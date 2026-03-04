package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path"
	"strings"

	"railyard/internal/types"

	"github.com/protomaps/go-pmtiles/pmtiles"
)

// App struct
type App struct {
	Registry   *Registry
	Config     *Config
	Downloader *Downloader
	ctx        context.Context
	Profiles   *UserProfiles
	Logger     *AppLogger
}

type MissingFilesError struct {
	Files []string
}

func (e *MissingFilesError) Error() string {
	return "Missing required files: " + strings.Join(e.Files, ", ")
}

type MapAlreadyExistsError struct {
	MapCode string
}

func (e *MapAlreadyExistsError) Error() string {
	return "Map with code '" + e.MapCode + "' has already been installed or would overwrite a vanilla map."
}

type installMapResponse struct {
	Status  string            `json:"status"`
	Message string            `json:"message,omitempty"`
	Data    *types.ConfigData `json:"data,omitempty"`
}

type installModResponse struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

type HandleInstallResponse struct {
	Status  string            `json:"status"`
	Message string            `json:"message,omitempty"`
	Data    *types.ConfigData `json:"data,omitempty"`
}

// CityInfo represents information about a single city

// NewApp creates a new App application struct
func NewApp() *App {
	config := NewConfig()
	registry := NewRegistry()
	logger := NewAppLogger()
	return &App{
		Registry:   registry,
		Config:     config,
		Downloader: NewDownloader(config, registry, logger),
		Profiles:   NewUserProfiles(logger),
		Logger:     logger,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.Config.setContext(ctx)
	if _, err := a.Config.resolveConfig(); err != nil {
		log.Printf("Warning: failed to resolve config on startup: %v", err)
	}

	if a.Logger == nil {
		a.Logger = NewAppLogger()
	}

	if err := moveLogFile(); err != nil {
		log.Printf("[WARN]: Failed to rotate startup log file: %v", err)
	}

	if err := a.Logger.Start(); err != nil {
		log.Printf("[WARN]: Failed to start app logger: %v", err)
	}

	runStartupRoutines(a)
}

// shutdown is called when the app shuts down.
func (a *App) shutdown(ctx context.Context) {
	if a.Logger == nil {
		return
	}

	a.Logger.Info("application shutdown")

	if err := a.Logger.Shutdown(); err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "failed to flush app logs on shutdown: %v\n", err)
	}

	if _, err := a.Config.SaveConfig(); err != nil {
		log.Printf("Warning: failed to save config on shutdown: %v", err)
	}
	if err := a.Registry.WriteInstalledToDisk(); err != nil {
		log.Printf("Warning: failed to persist installed registry state on shutdown: %v", err)
	}
}

func resolveStartupProfile(a *App) types.UserProfile {
	if p, err := a.Profiles.loadProfiles(); err == nil {
		return p
	} else {
		return a.recoverProfiles(err)
	}
}

func (a *App) recoverProfiles(cause error) types.UserProfile {
	success, quarantinedPath := a.Profiles.quarantineUserProfiles()
	if !success {
		a.Logger.Error("Failed to quarantine user profiles", cause)
		return types.DefaultProfile()
	}

	if resetErr := a.Profiles.ResetUserProfiles(); resetErr != nil {
		a.Logger.Error("Failed to reset user profiles", resetErr, "cause", cause, "quarantinedPath", quarantinedPath)
		return types.DefaultProfile()
	}

	profile, resolveErr := a.Profiles.GetActiveProfile()
	if resolveErr != nil {
		a.Logger.Error("Failed to resolve active profile after reset", resolveErr, "cause", cause)
		return types.DefaultProfile()
	}

	a.Logger.Warn("Recovered user profiles using defaults after load failure", "quarantinedPath", quarantinedPath)
	return profile
}

func runStartupRoutines(a *App) {
	// TODO: Handle auto-update of application version...

	activeProfile := resolveStartupProfile(a)

	// TODO: Backend should control registry state; frontend should not force initialization of the registry on startup.
	if err := a.Registry.initialize(); err != nil {
		a.Logger.Warn("Failed to ensure local registry repository", "error", err)
	}

	if activeProfile.SystemPreferences.RefreshRegistryOnStartup {
		if err := a.Registry.Refresh(); err != nil {
			a.Logger.Warn("Failed to refresh registry on startup", "error", err)
		}
	}
}

func (a *App) syncSubscriptions(profileID string, operations []types.SubscriptionOperation) error {
	a.Logger.Info("TODO: implement subscription sync", "profile", profileID, "operations", len(operations))
	// Pseudocode
	// installedMods, installedMaps := a.Registry.GetInstalledMods(), a.Registry.GetInstalledMaps()
	// for map in mapsToUpdate => HandleInstall(id, version, "map")
	// for mod in modsToUpdate => HandleInstall(id, version, "mod")
	// for map in mapsToDelete => HandleUninstall(id, "map")
	// for map in modsToDelete => HandleUninstall(id, "mod")
	// Compile errors from all operations and return a joined error
	return nil
}

func (a *App) UpdateSubscriptions(req types.UpdateSubscriptionsRequest) (types.UpdateSubscriptionsResult, error) {
	result, err := a.Profiles.UpdateSubscriptions(req)
	if err != nil {
		return types.UpdateSubscriptionsResult{}, err
	}

	if req.ForceSync && len(result.Operations) > 0 {
		if err := a.syncSubscriptions(result.Profile.ID, result.Operations); err != nil {
			return result, err
		}
	}

	return result, nil
}

func (a *App) LaunchGame() error {
	//TODO: Implement game launch logic, map mod generation
	var err error

	if err = a.startPMTilesServer(); err != nil {
		a.Logger.Warn("Failed to start PMTiles server", "error", err)
		return err
	}

	return nil
}

func (a *App) startPMTilesServer() error {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		a.Logger.Warn("Failed to start PMTiles server listener", "error", err)
		return err
	}
	port := listener.Addr().(*net.TCPAddr).Port // TODO: Pass port to mod generation
	listener.Close()

	a.Logger.Info(fmt.Sprintf("Starting PMTiles server on port %d", port))

	channel := make(chan error, 1)

	go func(logger *AppLogger, port int, errorChan chan error) {
		pmtilesServer, err := pmtiles.NewServerWithBucket(pmtiles.NewFileBucket(path.Join(AppDataRoot(), "tiles")), "", log.New(logger.writer, "pmtiles: ", log.Default().Flags()), 128, "")
		mux := http.NewServeMux()
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			statusCode := pmtilesServer.ServeHTTP(w, r)
			logger.Info("Handled PMTiles request", "path", r.URL.Path, "status", statusCode)
		})
		pmtilesServer.Start()
		if err != nil {
			logger.Error("Failed to create PMTiles server", err)
			errorChan <- err
			return
		}
		errorChan <- nil
		logger.Error("PMTiles error: ", http.ListenAndServe(fmt.Sprintf(":%d", port), pmtiles.NewCors("*").Handler(mux)))
	}(a.Logger, port, channel)
	return <-channel
}

package main

import (
	"archive/zip"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"slices"
	"strings"
	"time"

	"railyard/internal/files"

	"railyard/internal/types"

	"go.yaml.in/yaml/v4"
)

type MissingFilesError struct {
	Files []string
}

// App struct
type App struct {
	Registry *Registry
	Config   *Config
	ctx      context.Context
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
	return &App{
		Registry: NewRegistry(),
		Config:   NewConfig(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize the registry (clone or update) on startup
	if err := a.Registry.Initialize(); err != nil {
		log.Printf("Warning: failed to initialize registry: %v", err)
	}
}

func (a *App) HandleInstall(downloadUrl string, modType string, modId string) HandleInstallResponse {
	path, err := a.downloadZipFile(downloadUrl)
	if err != nil {
		return HandleInstallResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to download file: %v", err),
		}
	}

	if modType == "map" {
		installMapResponse := a.installMap(path)
		os.Remove(path)
		return HandleInstallResponse{
			Status:  installMapResponse.Status,
			Message: installMapResponse.Message,
			Data:    installMapResponse.Data,
		}
	}
	installModResponse := a.installMod(path, modId)
	os.Remove(path)
	return HandleInstallResponse{
		Status:  installModResponse.Status,
		Message: installModResponse.Message,
	}
}

func (a *App) downloadZipFile(downloadURL string) (string, error) {
	// Create a temporary file to save the downloaded zip
	tempDirStat, err := os.Stat(path.Join(AppDataRoot(), "temp"))
	if os.IsNotExist(err) {
		err = os.MkdirAll(path.Join(AppDataRoot(), "temp"), os.ModePerm)
		if err != nil {
			return "", fmt.Errorf("failed to create temp directory: %w", err)
		}
	} else if err != nil {
		return "", fmt.Errorf("failed to access temp directory: %w", err)
	} else if !tempDirStat.IsDir() {
		return "", fmt.Errorf("temp path exists but is not a directory")
	}
	file, err := os.CreateTemp(path.Join(AppDataRoot(), "temp"), "downloaded-*.zip")
	if err != nil {
		return "", fmt.Errorf("failed to create temporary file: %w", err)
	}
	defer file.Close()

	// Download the file
	resp, err := http.Get(downloadURL)
	if err != nil {
		return "", fmt.Errorf("failed to download file: %w", err)
	}
	defer resp.Body.Close()

	// Check if the download was successful
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download file: received status code %d", resp.StatusCode)
	}

	// Write the downloaded content to the temporary file
	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to save downloaded file: %w", err)
	}
	return file.Name(), nil
}

func (a *App) installMap(zipFilePath string) installMapResponse {
	config, err := a.Config.ResolveConfig()
	if err != nil {
		return installMapResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to resolve config: %v", err),
		}
	}
	if !config.Validation.IsValid() {
		return installMapResponse{
			Status:  "error",
			Message: fmt.Sprintf("Invalid config: %v", config.Validation),
		}
	}
	reader, err := zip.OpenReader(zipFilePath)
	if err != nil {
		return installMapResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to open zip file: %v", err),
		}
	}
	defer reader.Close()

	filesFound := map[string]types.FileFoundStruct{
		"config":     {Found: false, FileObject: nil, Required: true},
		"demandData": {Found: false, FileObject: nil, Required: true},
		"roads":      {Found: false, FileObject: nil, Required: true},
		"runways":    {Found: false, FileObject: nil, Required: true},
		"buildings":  {Found: false, FileObject: nil, Required: true},
		"tiles":      {Found: false, FileObject: nil, Required: true},
		"oceanDepth": {Found: false, FileObject: nil, Required: false},
		"thumbnail":  {Found: false, FileObject: nil, Required: false},
	}

	for _, file := range reader.File {
		if file.FileInfo().IsDir() {
			continue
		}
		fileFound := ""
		switch file.Name {
		case "config.json":
			fileFound = "config"
		case "demand_data.json":
			fileFound = "demandData"
		case "roads.geojson":
			fileFound = "roads"
		case "runways_taxiways.geojson":
			fileFound = "runways"
		case "buildings_index.json":
			fileFound = "buildings"
		case "ocean_depth_index.json":
			fileFound = "oceanDepth"
		}
		if strings.HasSuffix(file.Name, ".pmtiles") {
			fileFound = "tiles"
		}
		if strings.HasSuffix(file.Name, ".svg") {
			fileFound = "thumbnail"
		}
		if fileFound != "" {
			filesFound[fileFound] = types.FileFoundStruct{Found: true, FileObject: file, Required: filesFound[fileFound].Required}
		}
	}

	missingRequiredFiles := []string{}
	for key, fileInfo := range filesFound {
		if fileInfo.Required && !fileInfo.Found {
			missingRequiredFiles = append(missingRequiredFiles, key)
		}
	}
	if len(missingRequiredFiles) > 0 {
		return installMapResponse{
			Status:  "error",
			Message: "Missing required files: " + strings.Join(missingRequiredFiles, ", "),
		}
	}

	configFile, err := filesFound["config"].FileObject.Open()
	if err != nil {
		return installMapResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to open config file: %v", err),
		}
	}
	defer configFile.Close()

	fileBytes, err := io.ReadAll(configFile)
	if err != nil {
		return installMapResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to read config file: %v", err),
		}
	}

	var configData types.ConfigData
	configData, err = files.ParseJSON[types.ConfigData](fileBytes, "config file")
	if err != nil {
		return installMapResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to parse config file: %v", err),
		}
	}

	installedMaps := a.Registry.GetInstalledMapCodes()
	vanillaMaps := a.getVanillaMapCodes()

	if slices.Contains(installedMaps, configData.Code) || slices.Contains(vanillaMaps, configData.Code) {
		return installMapResponse{
			Status:  "error",
			Message: "Map with code '" + configData.Code + "' has already been installed or would overwrite a vanilla map.",
		}
	}

	os.MkdirAll(path.Join(config.Config.GetMapsFolderPath(), configData.Code), os.ModePerm)

	// Channel to collect errors from all goroutines
	errorChan := make(chan error, len(filesFound))
	var activeGoroutines int

	// Process each file (except config) in its own goroutine for maximum parallelization
	for entry, fileInfo := range filesFound {
		if fileInfo.Found && entry != "config" {
			activeGoroutines++
			go func(entry string, fileInfo types.FileFoundStruct) {
				defer func() {
					// Always send to channel to signal completion (nil for success)
					if r := recover(); r != nil {
						errorChan <- fmt.Errorf("Panic in %s processing: %v", entry, r)
					}
				}()

				log.Printf("[DEBUG] Starting %s goroutine...", entry)
				srcFile, err := fileInfo.FileObject.Open()
				if err != nil {
					log.Printf("[ERROR] Failed to open %s file: %v", entry, err)
					errorChan <- fmt.Errorf("Failed to open file %s: %v", entry, err)
					return
				}
				defer srcFile.Close()
				log.Printf("[DEBUG] Successfully opened %s file", entry)

				// Handle different file types
				switch entry {
				case "tiles":
					stats, err := os.Stat(TilesPath())
					if os.IsNotExist(err) {
						err = os.MkdirAll(TilesPath(), os.ModePerm)
						if err != nil {
							errorChan <- fmt.Errorf("Failed to create tiles directory: %v", err)
							return
						}
					} else if err != nil {
						errorChan <- fmt.Errorf("Failed to access tiles directory: %v", err)
						return
					} else if !stats.IsDir() {
						errorChan <- fmt.Errorf("Tiles path exists but is not a directory")
						return
					}

					destFilePath := path.Join(TilesPath(), configData.Code+".pmtiles")
					log.Printf("Installing %s for map %s at %s", entry, configData.Code, destFilePath)
					destFile, err := os.Create(destFilePath)
					if err != nil {
						errorChan <- fmt.Errorf("Failed to create destination file for tiles: %v", err)
						return
					}
					defer destFile.Close()

					_, err = io.Copy(destFile, srcFile)
					if err != nil {
						errorChan <- fmt.Errorf("Failed to copy tiles file: %v", err)
						return
					}
					log.Printf("Successfully installed %s for map %s", entry, configData.Code)

				case "thumbnail":
					cityMapsExists, err := os.Stat(config.Config.GetThumbnailFolderPath())
					if os.IsNotExist(err) || !cityMapsExists.IsDir() {
						err = os.MkdirAll(config.Config.GetThumbnailFolderPath(), os.ModePerm)
						if err != nil {
							errorChan <- fmt.Errorf("Failed to create city-maps directory: %v", err)
							return
						}
					}
					destFilePath := path.Join(config.Config.GetThumbnailFolderPath(), configData.Code+".svg")
					log.Printf("Installing %s for map %s at %s", entry, configData.Code, destFilePath)
					destFile, err := os.Create(destFilePath)
					if err != nil {
						errorChan <- fmt.Errorf("Failed to create destination file for thumbnail: %v", err)
						return
					}
					defer destFile.Close()

					_, err = io.Copy(destFile, srcFile)
					if err != nil {
						errorChan <- fmt.Errorf("Failed to copy thumbnail file: %v", err)
						return
					}
					log.Printf("Successfully installed %s for map %s", entry, configData.Code)

				default:
					// Handle compressed files (demandData, roads, runways, buildings, oceanDepth)
					destFilePath := path.Join(config.Config.GetMapsFolderPath(), configData.Code, path.Base(fileInfo.FileObject.Name)+".gz")
					fileSize := fileInfo.FileObject.UncompressedSize64
					log.Printf("Installing %s for map %s at %s (size: %.2f MB)", entry, configData.Code, destFilePath, float64(fileSize)/(1024*1024))

					destFile, err := os.Create(destFilePath)
					if err != nil {
						errorChan <- fmt.Errorf("Failed to create destination file for %s: %v", entry, err)
						return
					}
					defer destFile.Close()

					// Use fastest compression level for better performance
					compressedWriter, err := gzip.NewWriterLevel(destFile, gzip.BestSpeed)
					if err != nil {
						errorChan <- fmt.Errorf("Failed to create gzip writer for %s: %v", entry, err)
						return
					}
					defer compressedWriter.Close()

					log.Printf("[DEBUG] Starting compression for %s (%.2f MB)...", entry, float64(fileSize)/(1024*1024))
					startTime := time.Now()

					_, err = io.Copy(compressedWriter, srcFile)
					if err != nil {
						errorChan <- fmt.Errorf("Failed to copy and compress file %s: %v", entry, err)
						return
					}

					duration := time.Since(startTime)
					log.Printf("Successfully installed %s for map %s (compressed in %v)", entry, configData.Code, duration)
				}

				// Signal successful completion
				errorChan <- nil
			}(entry, fileInfo)
		}
	}

	// Wait for all goroutines to complete
	log.Printf("Waiting for %d file processing goroutines to complete...", activeGoroutines)
	for i := 0; i < activeGoroutines; i++ {
		select {
		case err := <-errorChan:
			if err != nil {
				log.Printf("[ERROR] File processing failed: %v", err)
				return installMapResponse{
					Status:  "error",
					Message: err.Error(),
				}
			}
			log.Printf("[DEBUG] File processing goroutine %d/%d completed successfully", i+1, activeGoroutines)
		case <-time.After(10 * time.Minute):
			log.Printf("[ERROR] File processing timed out after 10 minutes")
			return installMapResponse{
				Status:  "error",
				Message: "File processing timed out after 10 minutes",
			}
		}
	}

	log.Printf("[DEBUG] All file processing completed successfully")
	return installMapResponse{
		Status: "success",
		Data:   &configData,
	}
}

func (a *App) installMod(zipFilePath string, modId string) installModResponse {
	config, err := a.Config.ResolveConfig()
	if err != nil {
		return installModResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to resolve config: %v", err),
		}
	}
	if !config.Validation.IsValid() {
		return installModResponse{
			Status:  "error",
			Message: fmt.Sprintf("Invalid config: %v", config.Validation),
		}
	}
	reader, err := zip.OpenReader(zipFilePath)
	if err != nil {
		return installModResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to open zip file: %v", err),
		}
	}
	defer reader.Close()

	// Extract mod bundle to the correct directory
	modDir := path.Join(config.Config.GetModFolderPath(), modId)
	err = os.MkdirAll(modDir, os.ModePerm)
	if err != nil {
		return installModResponse{
			Status:  "error",
			Message: fmt.Sprintf("Failed to create mod directory: %v", err),
		}
	}

	// Collect all files to process (excluding directories)
	var filesToProcess []*zip.File
	for _, file := range reader.File {
		if !file.FileInfo().IsDir() {
			filesToProcess = append(filesToProcess, file)
		}
	}

	if len(filesToProcess) == 0 {
		return installModResponse{
			Status: "success",
		}
	}

	// Channel to collect errors from all goroutines
	errorChan := make(chan error, len(filesToProcess))

	log.Printf("Starting parallel extraction of %d mod files...", len(filesToProcess))

	// Process each file in its own goroutine for maximum parallelization
	for _, file := range filesToProcess {
		go func(file *zip.File) {
			defer func() {
				// Always send to channel to signal completion (nil for success)
				if r := recover(); r != nil {
					errorChan <- fmt.Errorf("Panic in %s processing: %v", file.Name, r)
				}
			}()

			log.Printf("[DEBUG] Starting extraction of %s...", file.Name)
			srcFile, err := file.Open()
			if err != nil {
				log.Printf("[ERROR] Failed to open file %s in zip: %v", file.Name, err)
				errorChan <- fmt.Errorf("Failed to open file in zip: %v", err)
				return
			}
			defer srcFile.Close()

			destFilePath := path.Join(modDir, file.Name)
			destDir := path.Dir(destFilePath)

			// Create destination directory if it doesn't exist
			err = os.MkdirAll(destDir, os.ModePerm)
			if err != nil {
				log.Printf("[ERROR] Failed to create directory %s for mod file: %v", destDir, err)
				errorChan <- fmt.Errorf("Failed to create directory for mod file: %v", err)
				return
			}

			destFile, err := os.Create(destFilePath)
			if err != nil {
				log.Printf("[ERROR] Failed to create destination file %s: %v", destFilePath, err)
				errorChan <- fmt.Errorf("Failed to create destination file for mod: %v", err)
				return
			}
			defer destFile.Close()

			fileSize := file.UncompressedSize64
			log.Printf("[DEBUG] Copying %s (%.2f MB)...", file.Name, float64(fileSize)/(1024*1024))
			startTime := time.Now()

			_, err = io.Copy(destFile, srcFile)
			if err != nil {
				log.Printf("[ERROR] Failed to copy mod file %s: %v", file.Name, err)
				errorChan <- fmt.Errorf("Failed to copy mod file: %v", err)
				return
			}

			duration := time.Since(startTime)
			log.Printf("Successfully extracted %s (%.2f MB in %v)", file.Name, float64(fileSize)/(1024*1024), duration)

			// Signal successful completion
			errorChan <- nil
		}(file)
	}

	// Wait for all goroutines to complete
	log.Printf("Waiting for %d file extraction goroutines to complete...", len(filesToProcess))
	for i := 0; i < len(filesToProcess); i++ {
		select {
		case err := <-errorChan:
			if err != nil {
				log.Printf("[ERROR] File extraction failed: %v", err)
				return installModResponse{
					Status:  "error",
					Message: err.Error(),
				}
			}
			log.Printf("[DEBUG] File extraction goroutine %d/%d completed successfully", i+1, len(filesToProcess))
		case <-time.After(5 * time.Minute):
			log.Printf("[ERROR] File extraction timed out after 5 minutes")
			return installModResponse{
				Status:  "error",
				Message: "File extraction timed out after 5 minutes",
			}
		}
	}

	log.Printf("[DEBUG] All mod file extractions completed successfully")
	return installModResponse{
		Status: "success",
	}
}

// getVanillaMapCodes returns the city codes of maps included with the game.
func (a *App) getVanillaMapCodes() []string {
	config, err := a.Config.ResolveConfig()
	if err != nil {
		log.Printf("Warning: failed to resolve config for GetVanillaMapCodes: %v", err)
		return []string{}
	}
	if !config.Validation.IsValid() {
		log.Printf("Warning: Invalid Config: %v", config.Validation)
		return []string{}
	}
	reader, err := os.Open(path.Join(config.Config.MetroMakerDataPath, "cities", "latest-cities.yml"))
	if err != nil {
		log.Printf("Warning: failed to open latest-cities.yml: %v", err)
		return []string{}
	}
	defer reader.Close()

	var citiesData types.CitiesData
	decoder := yaml.NewDecoder(reader)
	err = decoder.Decode(&citiesData)
	if err != nil {
		log.Printf("Warning: failed to parse latest-cities.yml: %v", err)
		return []string{}
	}
	cityCodes := make([]string, 0, len(citiesData.Cities))
	for code := range citiesData.Cities {
		cityCodes = append(cityCodes, code)
	}
	return cityCodes
}

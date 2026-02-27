package main

import (
	"os"
	"path"
	"strings"
	"sync"

	"railyard/internal/files"
)

// AppConfig is persisted at ConfigPath() and is used for global configuration
type AppConfig struct {
	MetroMakerDataPath string `json:"metroMakerDataPath,omitempty"`
	ExecutablePath     string `json:"executablePath,omitempty"`
	// Other fields to be appended here
}

// ConfigPathValidation is the result of validating AppConfig paths
type ConfigPathValidation struct {
	IsConfigured            bool `json:"isConfigured"`
	MetroMakerDataPathValid bool `json:"metroMakerDataPathValid"`
	ExecutablePathValid     bool `json:"executablePathValid"`
}

// ResolveConfigResult describes the result of resolving app config from disk.
type ResolveConfigResult struct {
	Config     AppConfig            `json:"config"`
	Validation ConfigPathValidation `json:"validation"`
}

// AreConfigPathsConfigured checks if both required paths have been set in AppConfig
func (c AppConfig) areConfigPathsConfigured() bool {
	return strings.TrimSpace(c.MetroMakerDataPath) != "" && strings.TrimSpace(c.ExecutablePath) != ""
}

// GetModFolderPath returns the full path to the mods folder based on the MetroMakerDataPath in AppConfig, or an empty string if paths are not properly configured.
func (c AppConfig) GetModFolderPath() string {
	pathsValid, _ := c.ValidateConfigPaths()
	if pathsValid {
		return path.Join(c.MetroMakerDataPath, "mods")
	}
	return ""
}

// GetThumbnailFolderPath returns the full path to the thumbnail folder based on the MetroMakerDataPath in AppConfig, or an empty string if paths are not properly configured.
func (c AppConfig) GetThumbnailFolderPath() string {
	pathsValid, _ := c.ValidateConfigPaths()
	if pathsValid {
		return path.Join(c.MetroMakerDataPath, "public", "data", "city-maps")
	}
	return ""
}

// GetMapsFolderPath returns the full path to the maps folder based on the MetroMakerDataPath in AppConfig, or an empty string if paths are not properly configured.
func (c AppConfig) GetMapsFolderPath() string {
	pathsValid, _ := c.ValidateConfigPaths()
	if pathsValid {
		return path.Join(c.MetroMakerDataPath, "cities", "data")
	}
	return ""
}

// ValidateConfigPaths checks whether the AppConfig has been configured and whether or not its specified paths exist on disk
func (c AppConfig) ValidateConfigPaths() (bool, ConfigPathValidation) {
	result := ConfigPathValidation{
		IsConfigured: c.areConfigPathsConfigured(),
	}

	if !result.IsConfigured {
		return false, result
	}

	modInfo, modErr := os.Stat(c.MetroMakerDataPath)
	result.MetroMakerDataPathValid = modErr == nil && modInfo.IsDir()
	exeInfo, exeErr := os.Stat(c.ExecutablePath)
	result.ExecutablePathValid = exeErr == nil && !exeInfo.IsDir()

	return result.IsValid(), result
}

func (v ConfigPathValidation) IsValid() bool {
	return v.IsConfigured && v.MetroMakerDataPathValid && v.ExecutablePathValid
}

type Config struct {
	// Mutex should be locked for all read/write operations
	mu sync.Mutex
}

func NewConfig() *Config {
	return &Config{}
}

func readAppConfig() (AppConfig, error) {
	return files.ReadJSON[AppConfig](
		ConfigPath(),
		"app config",
		files.JSONReadOptions{
			AllowMissing: true,
			AllowEmpty:   true,
		},
	)
}

func writeAppConfig(cfg AppConfig) error {
	return files.WriteJSON(ConfigPath(), "app config", cfg)
}

// ResolveConfig returns the current config from disk, or empty defaults when missing.
func (s *Config) ResolveConfig() (ResolveConfigResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cfg, err := readAppConfig()
	if err != nil {
		return ResolveConfigResult{}, err
	}

	_, validation := cfg.ValidateConfigPaths()
	return ResolveConfigResult{
		Config:     cfg,
		Validation: validation,
	}, nil
}

func (s *Config) updateConfig(mutator func(*AppConfig)) (AppConfig, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cfg, err := readAppConfig()
	if err != nil {
		return AppConfig{}, err
	}

	mutator(&cfg)
	if err := writeAppConfig(cfg); err != nil {
		return AppConfig{}, err
	}

	return cfg, nil
}

// UpdateExecutable updates and persists ExecutablePath to the app config.
func (s *Config) UpdateExecutable(executablePath string) (AppConfig, error) {
	return s.updateConfig(func(cfg *AppConfig) {
		cfg.ExecutablePath = strings.TrimSpace(executablePath)
	})
}

// UpdateMetroMakerDataFolder updates and persists metroMakerDataPath to the app config.
func (s *Config) UpdateMetroMakerDataFolder(metroMakerDataPath string) (AppConfig, error) {
	return s.updateConfig(func(cfg *AppConfig) {
		cfg.MetroMakerDataPath = strings.TrimSpace(metroMakerDataPath)
	})
}

// SetConfig replaces the persisted app config with the provided object.
func (s *Config) SetConfig(next AppConfig) (AppConfig, error) {
	return s.updateConfig(func(cfg *AppConfig) {
		*cfg = AppConfig{
			MetroMakerDataPath: strings.TrimSpace(next.MetroMakerDataPath),
			ExecutablePath:     strings.TrimSpace(next.ExecutablePath),
		}
	})
}

// ClearConfig clears all config fields (by replacing them with zero values).
func (s *Config) ClearConfig() (AppConfig, error) {
	return s.SetConfig(AppConfig{})
}

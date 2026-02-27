package main

import (
	"strings"
	"sync"

	"railyard/internal/files"
	"railyard/internal/types"
)

type Config struct {
	// Mutex should be locked for all read/write operations
	mu sync.Mutex
}

func NewConfig() *Config {
	return &Config{}
}

func readAppConfig() (types.AppConfig, error) {
	return files.ReadJSON[types.AppConfig](
		ConfigPath(),
		"app config",
		files.JSONReadOptions{
			AllowMissing: true,
			AllowEmpty:   true,
		},
	)
}

func writeAppConfig(cfg types.AppConfig) error {
	return files.WriteJSON(ConfigPath(), "app config", cfg)
}

// ResolveConfig returns the current config from disk, or empty defaults when missing.
func (s *Config) ResolveConfig() (types.ResolveConfigResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cfg, err := readAppConfig()
	if err != nil {
		return types.ResolveConfigResult{}, err
	}

	_, validation := cfg.ValidateConfigPaths()
	return types.ResolveConfigResult{
		Config:     cfg,
		Validation: validation,
	}, nil
}

func (s *Config) updateConfig(mutator func(*types.AppConfig)) (types.AppConfig, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cfg, err := readAppConfig()
	if err != nil {
		return types.AppConfig{}, err
	}

	mutator(&cfg)
	if err := writeAppConfig(cfg); err != nil {
		return types.AppConfig{}, err
	}

	return cfg, nil
}

// UpdateExecutable updates and persists ExecutablePath to the app config.
func (s *Config) UpdateExecutable(executablePath string) (types.AppConfig, error) {
	return s.updateConfig(func(cfg *types.AppConfig) {
		cfg.ExecutablePath = strings.TrimSpace(executablePath)
	})
}

// UpdateMetroMakerDataFolder updates and persists metroMakerDataPath to the app config.
func (s *Config) UpdateMetroMakerDataFolder(metroMakerDataPath string) (types.AppConfig, error) {
	return s.updateConfig(func(cfg *types.AppConfig) {
		cfg.MetroMakerDataPath = strings.TrimSpace(metroMakerDataPath)
	})
}

// SetConfig replaces the persisted app config with the provided object.
func (s *Config) SetConfig(next types.AppConfig) (types.AppConfig, error) {
	return s.updateConfig(func(cfg *types.AppConfig) {
		*cfg = types.AppConfig{
			MetroMakerDataPath: strings.TrimSpace(next.MetroMakerDataPath),
			ExecutablePath:     strings.TrimSpace(next.ExecutablePath),
		}
	})
}

// ClearConfig clears all config fields (by replacing them with zero values).
func (s *Config) ClearConfig() (types.AppConfig, error) {
	return s.SetConfig(types.AppConfig{})
}

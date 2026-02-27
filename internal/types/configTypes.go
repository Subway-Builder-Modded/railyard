package types

import (
	"os"
	"path"
	"strings"
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
func (c AppConfig) AreConfigPathsConfigured() bool {
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
		IsConfigured: c.AreConfigPathsConfigured(),
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

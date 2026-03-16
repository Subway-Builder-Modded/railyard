package types

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestAreConfigPathsConfigured(t *testing.T) {
	cfg := AppConfig{
		ExecutablePath:     "dir/executable.exe",
		MetroMakerDataPath: "dir/",
	}
	require.True(t, cfg.AreConfigPathsConfigured())

	cfg.MetroMakerDataPath = "   "
	require.False(t, cfg.AreConfigPathsConfigured())
}

func TestValidateConfigPaths(t *testing.T) {
	// Paths not configured
	cfg := AppConfig{}
	valid, result := cfg.ValidateConfigPaths()
	require.False(t, valid)
	require.False(t, result.IsConfigured)

	// Paths are configured but do not exist on disk
	cfg = AppConfig{
		MetroMakerDataPath: "blah/blah/",
		ExecutablePath:     "blah.exe",
	}
	valid, result = cfg.ValidateConfigPaths()
	require.False(t, valid)
	require.True(t, result.IsConfigured)
	require.False(t, result.MetroMakerDataPathValid)
	require.False(t, result.ExecutablePathValid)

	modDir := t.TempDir()
	exeFile := filepath.Join(modDir, "abcdef.exe")
	require.NoError(t, os.WriteFile(exeFile, []byte(""), 0o755))

	// Paths are configured and exist on disk
	cfg = AppConfig{
		MetroMakerDataPath: modDir,
		ExecutablePath:     exeFile,
	}
	valid, result = cfg.ValidateConfigPaths()
	require.True(t, valid)
	require.True(t, result.IsConfigured)
	require.True(t, result.MetroMakerDataPathValid)
	require.True(t, result.ExecutablePathValid)
}

func TestAppConfigFolderPathGetters(t *testing.T) {
	metroMakerDir := t.TempDir()
	exeName := "subway-builder"
	if runtime.GOOS == "windows" {
		exeName = "subway-builder.exe"
	}
	exePath := filepath.Join(metroMakerDir, exeName)
	require.NoError(t, os.WriteFile(exePath, []byte(""), 0o755))

	cfg := AppConfig{
		MetroMakerDataPath: metroMakerDir,
		ExecutablePath:     exePath,
	}

	require.Equal(t, filepath.Join(metroMakerDir, "mods"), cfg.GetModFolderPath())
	require.Equal(t, filepath.Join(metroMakerDir, "public", "data", "city-maps"), cfg.GetThumbnailFolderPath())
	require.Equal(t, filepath.Join(metroMakerDir, "cities", "data"), cfg.GetMapsFolderPath())
}

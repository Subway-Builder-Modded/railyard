package main

import (
	"os"
	"path/filepath"
	"railyard/internal/types"
	"testing"

	"github.com/stretchr/testify/require"
)

func setEnv(t *testing.T) {
	t.Helper()

	root := t.TempDir()
	t.Setenv("APPDATA", root)           // Config directory for Windows
	t.Setenv("LOCALAPPDATA", root)      // Executable default candidate on Windows
	t.Setenv("ProgramFiles", root)      // Executable default candidate fallback on Windows
	t.Setenv("ProgramFiles(x86)", root) // Executable default candidate fallback on Windows
	t.Setenv("XDG_CONFIG_HOME", root)   // Config directory for Linux and MacOS
	t.Setenv("HOME", root)              // Fallback for non-windows OS
}

func writeTestConfigFile(t *testing.T, content string) {
	t.Helper()

	path := ConfigPath()
	require.NoError(t, os.MkdirAll(filepath.Dir(path), 0o755))
	require.NoError(t, os.WriteFile(path, []byte(content), 0o644))
}

func testConfig() types.AppConfig {
	return types.AppConfig{
		ExecutablePath:     "dir/executable.exe",
		MetroMakerDataPath: "dir/",
	}
}

func TestAreConfigPathsConfigured(t *testing.T) {
	cfg := testConfig()
	require.True(t, cfg.AreConfigPathsConfigured())

	cfg.MetroMakerDataPath = "   "
	require.False(t, cfg.AreConfigPathsConfigured())
}

func TestValidateConfigPaths(t *testing.T) {
	setEnv(t)

	// Paths not configured
	cfg := types.AppConfig{}
	valid, result := cfg.ValidateConfigPaths()
	require.False(t, valid)
	require.False(t, result.IsConfigured)

	// Paths are configured but do not exist on disk
	cfg = types.AppConfig{
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
	require.NoError(t, os.WriteFile(exeFile, []byte(""), 0o644))

	// Paths are configured and exist on disk
	cfg = types.AppConfig{
		MetroMakerDataPath: modDir,
		ExecutablePath:     exeFile,
	}
	valid, result = cfg.ValidateConfigPaths()
	require.True(t, valid)
	require.True(t, result.IsConfigured)
	require.True(t, result.MetroMakerDataPathValid)
	require.True(t, result.ExecutablePathValid)
}

func TestUpdateConfigWithPersist(t *testing.T) {
	setEnv(t)
	require.NoError(t, writeAppConfig(types.AppConfig{
		ExecutablePath: "dir/executable.exe",
	}))

	cfg := NewConfig()
	_, err := cfg.resolveConfig()
	require.NoError(t, err)

	updated, err := cfg.updateConfig(func(c *types.AppConfig) {
		c.MetroMakerDataPath = "dir/"
	}, true) // Write through to disk
	
	require.NoError(t, err)
	require.Equal(t, testConfig(), updated.Config)

	persisted, err := readAppConfig()
	require.NoError(t, err)
	require.Equal(t, updated.Config, persisted)
}

func TestUpdateConfigWithoutPersist(t *testing.T) {
	setEnv(t)
	original := testConfig()
	require.NoError(t, writeAppConfig(original))

	cfg := NewConfig()
	_, err := cfg.resolveConfig()
	require.NoError(t, err)

	updated, err := cfg.updateConfig(func(c *types.AppConfig) {
		c.ExecutablePath = "updated/executable.exe"
	}, false)
	require.NoError(t, err)
	// cfg in memory should be updated; and cfg in the result from updateConfig should point to the same object
	require.Equal(t, "updated/executable.exe", updated.Config.ExecutablePath)
	require.Equal(t, "updated/executable.exe", cfg.GetConfig().Config.ExecutablePath)

	persisted, err := readAppConfig()
	require.NoError(t, err)
	require.Equal(t, original, persisted)
}

func TestSaveConfigPersistsRuntimeState(t *testing.T) {
	setEnv(t)
	require.NoError(t, writeAppConfig(types.AppConfig{}))

	cfg := NewConfig()
	_, err := cfg.resolveConfig()
	require.NoError(t, err)

	updated, err := cfg.updateConfig(func(c *types.AppConfig) {
		c.MetroMakerDataPath = "runtime/metro-maker4"
		c.ExecutablePath = "runtime/Subway Builder.exe"
	}, false)
	require.NoError(t, err)
	require.Equal(t, "runtime/metro-maker4", updated.Config.MetroMakerDataPath)

	saved, err := cfg.SaveConfig()
	require.NoError(t, err)
	require.Equal(t, updated.Config, saved.Config)

	persisted, err := readAppConfig()
	require.NoError(t, err)
	require.Equal(t, saved.Config, persisted)
}

func TestResolveConfigOverridesRuntimeState(t *testing.T) {
	setEnv(t)
	initial := types.AppConfig{
		MetroMakerDataPath: "first/metro",
		ExecutablePath:     "first.exe",
	}
	updated := types.AppConfig{
		MetroMakerDataPath: "second/metro",
		ExecutablePath:     "second.exe",
	}

	require.NoError(t, writeAppConfig(initial))
	cfg := NewConfig()

	resolved, err := cfg.resolveConfig()
	require.NoError(t, err)
	require.Equal(t, initial, resolved.Config)

	require.NoError(t, writeAppConfig(updated))
	runtimeBeforeReload := cfg.GetConfig()
	require.Equal(t, initial, runtimeBeforeReload.Config)

	reloaded, err := cfg.resolveConfig()
	require.NoError(t, err)
	require.Equal(t, updated, reloaded.Config)
}

func TestSetConfigOverwritesRuntime(t *testing.T) {
	setEnv(t)
	original := testConfig()
	require.NoError(t, writeAppConfig(original))

	cfg := NewConfig()
	_, err := cfg.resolveConfig()
	require.NoError(t, err)

	next := types.AppConfig{
		ExecutablePath:     "new/executable.exe",
		MetroMakerDataPath: "new/",
	}
	updated, err := cfg.SetConfig(next)
	require.NoError(t, err)
	require.Equal(t, next, updated)

	runtimeConfig := cfg.GetConfig()
	require.Equal(t, next, runtimeConfig.Config)

	// SetConfig should only affect the runtime config; no mutation should occur to the persisted config
	persisted, err := readAppConfig()
	require.NoError(t, err)
	require.Equal(t, original, persisted)
}

func TestClearConfigOverwritesRuntimeWithEmptyConfig(t *testing.T) {
	setEnv(t)
	original := testConfig()
	require.NoError(t, writeAppConfig(original))

	cfg := NewConfig()
	_, err := cfg.resolveConfig()
	require.NoError(t, err)

	updated, err := cfg.ClearConfig()
	require.NoError(t, err)
	require.Equal(t, types.AppConfig{}, updated)

	runtimeConfig := cfg.GetConfig()
	require.Equal(t, types.AppConfig{}, runtimeConfig.Config)

	// ClearConfig is runtime-only under the SaveConfig persistence model.
	persisted, err := readAppConfig()
	require.NoError(t, err)
	require.Equal(t, original, persisted)
}

func TestFindDefaultPathReturnsFirstMatchingDirectory(t *testing.T) {
	root := t.TempDir()
	filePath := filepath.Join(root, "candidate.exe")
	require.NoError(t, os.WriteFile(filePath, []byte("x"), 0o644))
	dirPath := filepath.Join(root, "metro-maker4")
	require.NoError(t, os.MkdirAll(dirPath, 0o755))

	found, ok := findDefaultPath([]string{
		"",
		"relative/path",
		filePath,
		dirPath,
	}, true)
	require.True(t, ok)
	require.Equal(t, dirPath, found)
}

func TestFindDefaultPathReturnsFirstMatchingFile(t *testing.T) {
	root := t.TempDir()
	dirPath := filepath.Join(root, "metro-maker4")
	require.NoError(t, os.MkdirAll(dirPath, 0o755))
	filePath := filepath.Join(root, "candidate.exe")
	require.NoError(t, os.WriteFile(filePath, []byte("x"), 0o644))

	found, ok := findDefaultPath([]string{
		"",
		"relative/path",
		dirPath,
		filePath,
	}, false)
	require.True(t, ok)
	require.Equal(t, filePath, found)
}

func TestFindDefaultPathReturnsNotFoundWhenTypeMismatches(t *testing.T) {
	root := t.TempDir()
	filePath := filepath.Join(root, "candidate.exe")
	require.NoError(t, os.WriteFile(filePath, []byte("x"), 0o644))

	// Executable file does not match when looking for directory
	found, ok := findDefaultPath([]string{filePath}, true)
	require.False(t, ok)
	require.Equal(t, "", found)
}

func createWritableCandidateFile(t *testing.T, candidates []string) string {
	t.Helper()

	for _, candidate := range candidates {
		if candidate == "" || !filepath.IsAbs(candidate) {
			continue
		}
		if err := os.MkdirAll(filepath.Dir(candidate), 0o755); err != nil {
			continue
		}
		if err := os.WriteFile(candidate, []byte("x"), 0o755); err == nil {
			return candidate
		}
	}

	t.Skip("no writable default executable candidate path available")
	return ""
}

func createWritableCandidateDir(t *testing.T, candidates []string) string {
	t.Helper()

	for _, candidate := range candidates {
		if candidate == "" || !filepath.IsAbs(candidate) {
			continue
		}
		if err := os.MkdirAll(candidate, 0o755); err == nil {
			return candidate
		}
	}

	t.Skip("no writable default metro maker data folder candidate path available")
	return ""
}

func TestOpenExecutableDialogAutoDetect(t *testing.T) {
	setEnv(t)
	detectedPath := createWritableCandidateFile(t, defaultExecutableCandidates())
	metroMakerPath := t.TempDir()
	require.NoError(t, writeAppConfig(types.AppConfig{
		MetroMakerDataPath: metroMakerPath,
	}))

	cfg := NewConfig()
	_, err := cfg.resolveConfig()
	require.NoError(t, err)

	result, err := cfg.OpenExecutableDialog(types.SetConfigPathOptions{AllowAutoDetect: true})
	require.NoError(t, err)
	require.Equal(t, types.AutoDetected, result.DialogResult)
	require.Equal(t, detectedPath, result.AutoDetectedPath)
	require.Equal(t, detectedPath, result.ResolveConfigResult.Config.ExecutablePath)

	runtimeCfg := cfg.GetConfig()
	require.Equal(t, detectedPath, runtimeCfg.Config.ExecutablePath)

	persisted, err := readAppConfig()
	require.NoError(t, err)
	require.Equal(t, "", persisted.ExecutablePath)
	require.Equal(t, metroMakerPath, persisted.MetroMakerDataPath)
}

func TestOpenMetroMakerDialogAutoDetectReturnsProposedConfigWithoutPersisting(t *testing.T) {
	setEnv(t)
	executablePath := createWritableCandidateFile(t, defaultExecutableCandidates())
	require.NoError(t, writeAppConfig(types.AppConfig{
		ExecutablePath: executablePath,
	}))
	detectedPath := createWritableCandidateDir(t, defaultMetroMakerDataFolderCandidates())

	cfg := NewConfig()
	_, err := cfg.resolveConfig()
	require.NoError(t, err)

	result, err := cfg.OpenMetroMakerDataFolderDialog(types.SetConfigPathOptions{AllowAutoDetect: true})
	require.NoError(t, err)
	require.Equal(t, types.AutoDetected, result.DialogResult)
	require.Equal(t, detectedPath, result.AutoDetectedPath)
	require.Equal(t, detectedPath, result.ResolveConfigResult.Config.MetroMakerDataPath)

	runtimeCfg := cfg.GetConfig()
	require.Equal(t, detectedPath, runtimeCfg.Config.MetroMakerDataPath)

	persisted, err := readAppConfig()
	require.NoError(t, err)
	require.Equal(t, "", persisted.MetroMakerDataPath)
	require.Equal(t, executablePath, persisted.ExecutablePath)
}

func TestTryAutoDetectExecutableFallsThroughWhenValidationInvalid(t *testing.T) {
	setEnv(t)
	detectedPath := createWritableCandidateFile(t, defaultExecutableCandidates())

	cfg := NewConfig()
	autoDetected, ok := cfg.tryAutoDetectPath(
		defaultExecutableCandidates(),
		false,
		cfg.updateExecutable,
	)
	require.False(t, ok)
	require.Equal(t, types.SetConfigPathResult{}, autoDetected)

	runtimeAfter := cfg.GetConfig()
	require.Equal(t, detectedPath, runtimeAfter.Config.ExecutablePath)
}

func TestTryAutoDetectMetroMakerFallsThroughWhenValidationInvalid(t *testing.T) {
	setEnv(t)
	detectedPath := createWritableCandidateDir(t, defaultMetroMakerDataFolderCandidates())

	cfg := NewConfig()
	autoDetected, ok := cfg.tryAutoDetectPath(
		defaultMetroMakerDataFolderCandidates(),
		true,
		cfg.updateMetroMakerDataFolder,
	)
	require.False(t, ok)
	require.Equal(t, types.SetConfigPathResult{}, autoDetected)

	runtimeAfter := cfg.GetConfig()
	require.Equal(t, detectedPath, runtimeAfter.Config.MetroMakerDataPath)
}

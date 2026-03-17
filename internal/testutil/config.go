package testutil

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"railyard/internal/types"

	"github.com/stretchr/testify/require"
)

// SetValidConfigPaths sets MetroMakerDataPath and ExecutablePath to valid temp paths for tests.
func SetValidConfigPaths(t *testing.T, cfg *types.AppConfig) {
	t.Helper()

	cfg.MetroMakerDataPath = t.TempDir()

	exeName := "subway-builder"
	if runtime.GOOS == "windows" {
		exeName += ".exe"
	}
	exePath := filepath.Join(t.TempDir(), exeName)
	require.NoError(t, os.WriteFile(exePath, []byte("bin"), 0o755))
	cfg.ExecutablePath = exePath
}

package main

import (
	"testing"

	"railyard/internal/logger"
	"railyard/internal/types"

	"github.com/stretchr/testify/require"
)

func newTestApp() *App {
	return &App{Logger: logger.LoggerAtPath("")}
}

func TestIsStartupReady(t *testing.T) {
	app := newTestApp()
	require.False(t, app.IsStartupReady().Ready)

	app.setStartupReady(true)
	require.True(t, app.IsStartupReady().Ready)

	app.setStartupReady(false)
	require.False(t, app.IsStartupReady().Ready)
}

func TestOpenInFileExplorerRejectsInvalidPaths(t *testing.T) {
	app := newTestApp()

	empty := app.OpenInFileExplorer("   ")
	require.Equal(t, types.ResponseError, empty.Status)
	require.Equal(t, "invalid path", empty.Message)

	missing := app.OpenInFileExplorer("this-path-does-not-exist")
	require.Equal(t, types.ResponseError, missing.Status)
	require.Contains(t, missing.Message, "failed to resolve path")
}

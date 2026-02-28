package main

import (
	"errors"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func readLogContent(t *testing.T) string {
	t.Helper()
	data, err := os.ReadFile(LogFilePath())
	require.NoError(t, err)
	return string(data)
}

func TestAppLoggerStartIsIdempotent(t *testing.T) {
	setEnv(t)

	logger := NewAppLogger()
	require.NoError(t, logger.Start())
	require.NoError(t, logger.Start())
	require.NoError(t, logger.Shutdown())
}

func TestAppLoggerShutdownBeforeStartIsNoOp(t *testing.T) {
	setEnv(t)

	logger := NewAppLogger()
	require.NoError(t, logger.Shutdown())
}

func TestAppLoggerShutdownIsIdempotent(t *testing.T) {
	setEnv(t)

	logger := NewAppLogger()
	require.NoError(t, logger.Start())
	logger.Info("MEOW")
	require.NoError(t, logger.Shutdown())
	require.NoError(t, logger.Shutdown())
}

func TestAppLoggerWritesBeforeStartAreDropped(t *testing.T) {
	setEnv(t)

	logger := NewAppLogger()
	logger.Info("no meow :(")
	require.NoError(t, logger.Start())
	require.NoError(t, logger.Shutdown())

	content := readLogContent(t)
	require.NotContains(t, content, "no meow :(")
}

func TestAppLoggerShutdownFlushesBuffer(t *testing.T) {
	setEnv(t)

	logger := NewAppLogger()
	require.NoError(t, logger.Start())

	logger.Info("meow remains")
	require.NoError(t, logger.Shutdown())

	content := readLogContent(t)
	require.Contains(t, content, "meow remains")
}

func TestAppLoggerErrorIncludesErrorField(t *testing.T) {
	setEnv(t)

	logger := NewAppLogger()
	require.NoError(t, logger.Start())

	logger.Error("cat invasion", errors.New("meow"), "kitty", "bad")
	require.NoError(t, logger.Shutdown())

	content := readLogContent(t)
	require.Contains(t, content, "level=ERROR")
	require.Contains(t, content, "cat invasion")
	require.Contains(t, content, "error=meow")
	require.Contains(t, content, "kitty=bad")
}

func TestAppLoggerCanRestartAfterShutdown(t *testing.T) {
	setEnv(t)

	logger := NewAppLogger()
	require.NoError(t, logger.Start())
	logger.Info("first meow")
	require.NoError(t, logger.Shutdown())

	require.NoError(t, logger.Start())
	logger.Info("second meow")
	require.NoError(t, logger.Shutdown())

	content := readLogContent(t)
	require.Contains(t, content, "first meow")
	require.Contains(t, content, "second meow")
}

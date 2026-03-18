package files

import (
	"archive/tar"
	"os"
	"path/filepath"
	"testing"

	"railyard/internal/logger"
	"railyard/internal/types"

	"github.com/stretchr/testify/require"
)

func TestCopyFileToArchiveAndExtractArchiveToDir(t *testing.T) {
	sourceDir := t.TempDir()
	sourceFile := filepath.Join(sourceDir, "sample.txt")
	require.NoError(t, os.WriteFile(sourceFile, []byte("hello"), 0o644))

	archivePath := filepath.Join(t.TempDir(), "single.tar")
	rawArchive, err := os.Create(archivePath)
	require.NoError(t, err)

	writer := tar.NewWriter(rawArchive)
	require.NoError(t, CopyFileToArchive(writer, sourceFile))
	require.NoError(t, writer.Close())
	require.NoError(t, rawArchive.Close())

	extractDir := t.TempDir()
	require.NoError(t, ExtractArchiveToDir(archivePath, extractDir))

	data, readErr := os.ReadFile(filepath.Join(extractDir, "sample.txt"))
	require.NoError(t, readErr)
	require.Equal(t, "hello", string(data))
}

func TestAddDirToArchiveAndExtractArchiveToDir(t *testing.T) {
	sourceDir := t.TempDir()
	nested := filepath.Join(sourceDir, "nested", "child.txt")
	require.NoError(t, os.MkdirAll(filepath.Dir(nested), 0o755))
	require.NoError(t, os.WriteFile(nested, []byte("nested-data"), 0o644))

	archivePath := filepath.Join(t.TempDir(), "dir.tar")
	rawArchive, err := os.Create(archivePath)
	require.NoError(t, err)

	writer := tar.NewWriter(rawArchive)
	require.NoError(t, AddDirToArchive(writer, sourceDir, sourceDir))
	require.NoError(t, writer.Close())
	require.NoError(t, rawArchive.Close())

	extractDir := t.TempDir()
	require.NoError(t, ExtractArchiveToDir(archivePath, extractDir))

	data, readErr := os.ReadFile(filepath.Join(extractDir, "nested", "child.txt"))
	require.NoError(t, readErr)
	require.Equal(t, "nested-data", string(data))
}

func TestCopyDirectory(t *testing.T) {
	sourceDir := t.TempDir()
	require.NoError(t, os.MkdirAll(filepath.Join(sourceDir, "a", "b"), 0o755))
	require.NoError(t, os.WriteFile(filepath.Join(sourceDir, "a", "b", "file.txt"), []byte("copy-me"), 0o644))

	destination := filepath.Join(t.TempDir(), "dest")
	require.NoError(t, CopyDirectory(sourceDir, destination))

	data, err := os.ReadFile(filepath.Join(destination, "a", "b", "file.txt"))
	require.NoError(t, err)
	require.Equal(t, "copy-me", string(data))
}

func TestCopyFileWithDest(t *testing.T) {
	log := logger.LoggerAtPath(filepath.Join(t.TempDir(), "archive_test.log"))

	src := filepath.Join(t.TempDir(), "from.txt")
	require.NoError(t, os.WriteFile(src, []byte("payload"), 0o644))

	dst := filepath.Join(t.TempDir(), "dest", "to.txt")
	response, ok := CopyFileWithDest(src, dst, "profile-a", "map-a", "manifest", log)
	require.True(t, ok)
	require.Equal(t, types.GenericResponse{}, response)

	data, err := os.ReadFile(dst)
	require.NoError(t, err)
	require.Equal(t, "payload", string(data))
}

func TestCopyFileWithDestReturnsErrorForMissingSource(t *testing.T) {
	log := logger.LoggerAtPath(filepath.Join(t.TempDir(), "archive_test_error.log"))
	response, ok := CopyFileWithDest("missing", filepath.Join(t.TempDir(), "dest", "to.txt"), "profile-a", "map-a", "manifest", log)
	require.False(t, ok)
	require.Equal(t, types.ResponseError, response.Status)
}

func TestCopyFile(t *testing.T) {
	log := logger.LoggerAtPath(filepath.Join(t.TempDir(), "copy_file.log"))
	src := filepath.Join(t.TempDir(), "src.txt")
	dst := filepath.Join(t.TempDir(), "dst.txt")
	require.NoError(t, os.WriteFile(src, []byte("abc"), 0o644))

	response, ok := CopyFile(src, dst, "profile-a", "map-a", log)
	require.True(t, ok)
	require.Equal(t, types.GenericResponse{}, response)

	data, err := os.ReadFile(dst)
	require.NoError(t, err)
	require.Equal(t, "abc", string(data))
}

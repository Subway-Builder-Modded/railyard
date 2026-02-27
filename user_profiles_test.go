package main

import (
	"os"
	"path/filepath"
	"railyard/internal/types"
	"testing"

	"github.com/stretchr/testify/require"
)

func writeRawUserProfilesFile(t *testing.T, content string) {
	t.Helper()

	path := UserProfilesPath()
	require.NoError(t, os.MkdirAll(filepath.Dir(path), 0o755))
	require.NoError(t, os.WriteFile(path, []byte(content), 0o644))
}

func TestLoadProfilesBootstrapsAndPersistsStateWhenMissing(t *testing.T) {
	setEnv(t)

	svc := NewUserProfiles()
	require.NoError(t, svc.LoadProfiles())

	persisted, err := readUserProfilesState()
	require.NoError(t, err)
	require.Equal(t, types.DefaultProfileID, persisted.ActiveProfileID)

	defaultProfile, ok := persisted.Profiles[types.DefaultProfileID]
	require.True(t, ok)
	require.Equal(t, types.DefaultProfileID, defaultProfile.ID)
	require.Equal(t, types.DefaultProfileName, defaultProfile.Name)
	require.NotEmpty(t, defaultProfile.UUID)
}

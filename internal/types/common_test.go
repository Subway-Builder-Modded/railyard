package types

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNormalizeVersion(t *testing.T) {
	tests := []struct {
		name      string
		version   Version
		expected  string
		expectErr bool
	}{
		{
			name:     "plain semver",
			version:  Version("1.2.3"),
			expected: "v1.2.3",
		},
		{
			name:     "semver with v prefix",
			version:  Version("v1.2.3"),
			expected: "v1.2.3",
		},
		{
			name:     "semver with prerelease and metadata",
			version:  Version("1.2.3-beta.1+build.5"),
			expected: "v1.2.3-beta.1+build.5",
		},
		{
			name:      "empty",
			version:   Version(""),
			expectErr: true,
		},
		{
			name:      "invalid",
			version:   Version("1.2.x"),
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			normalized, err := NormalizeVersion(tt.version)
			if tt.expectErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			require.Equal(t, tt.expected, normalized)
		})
	}
}

func TestCompareVersionAndEquals(t *testing.T) {
	cmp, err := CompareVersion(Version("1.2.3"), Version("v1.2.3"))
	require.NoError(t, err)
	require.Equal(t, 0, cmp)

	equal, err := VersionEquals(Version("1.2.3"), Version("v1.2.3"))
	require.NoError(t, err)
	require.True(t, equal)

	_, err = CompareVersion(Version("not-semver"), Version("1.2.3"))
	require.Error(t, err)
}

func TestIsUpgradeAndIsDowngrade(t *testing.T) {
	upgrade, err := IsUpgrade(Version("1.2.3"), Version("1.3.0"))
	require.NoError(t, err)
	require.True(t, upgrade)

	downgrade, err := IsDowngrade(Version("1.3.0"), Version("1.2.3"))
	require.NoError(t, err)
	require.True(t, downgrade)

	notUpgrade, err := IsUpgrade(Version("1.2.3"), Version("1.2.3"))
	require.NoError(t, err)
	require.False(t, notUpgrade)

	notDowngrade, err := IsDowngrade(Version("1.2.3"), Version("1.2.3"))
	require.NoError(t, err)
	require.False(t, notDowngrade)
}

func TestIsValidAssetType(t *testing.T) {
	require.True(t, IsValidAssetType(AssetTypeMap))
	require.True(t, IsValidAssetType(AssetTypeMod))
	require.False(t, IsValidAssetType(AssetType("unknown")))
}

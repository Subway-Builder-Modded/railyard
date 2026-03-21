package types

import (
	"bytes"
	"io"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestIsValidAssetType(t *testing.T) {
	require.True(t, IsValidAssetType(AssetTypeMap))
	require.True(t, IsValidAssetType(AssetTypeMod))
	require.False(t, IsValidAssetType(AssetType("unknown")))
}

func TestIsValidSemverVersion(t *testing.T) {
	require.True(t, IsValidSemverVersion(Version("1.2.3")))
	require.True(t, IsValidSemverVersion(Version("v1.2.3")))
	require.True(t, IsValidSemverVersion(Version(" 1.2.3 ")))

	require.False(t, IsValidSemverVersion(Version("1.2")))
	require.False(t, IsValidSemverVersion(Version("1.2.3.4")))
	require.False(t, IsValidSemverVersion(Version("1.2.3-beta.1")))
	require.False(t, IsValidSemverVersion(Version("1.2.3+build.9")))
	require.False(t, IsValidSemverVersion(Version("not-semver")))
	require.False(t, IsValidSemverVersion(Version("")))
}

func TestResponseHelpers(t *testing.T) {
	errResp := ErrorResponse("bad")
	require.Equal(t, ResponseError, errResp.Status)
	require.Equal(t, "bad", errResp.Message)

	successResp := SuccessResponse("ok")
	require.Equal(t, ResponseSuccess, successResp.Status)
	require.Equal(t, "ok", successResp.Message)

	warnResp := WarnResponse("warn")
	require.Equal(t, ResponseWarn, warnResp.Status)
	require.Equal(t, "warn", warnResp.Message)
}

func TestAutoPurgeDownloadErrors(t *testing.T) {
	require.True(t, AutoPurgeDownloadErrors(InstallErrorInvalidManifest))
	require.True(t, AutoPurgeDownloadErrors(InstallErrorInvalidArchive))
	require.True(t, AutoPurgeDownloadErrors(InstallErrorChecksumFailed))
	require.False(t, AutoPurgeDownloadErrors(InstallErrorVersionLookup))
}

func TestAssetTypeDir(t *testing.T) {
	require.Equal(t, "maps", AssetTypeDir(AssetTypeMap))
	require.Equal(t, "mods", AssetTypeDir(AssetTypeMod))
	require.Panics(t, func() {
		_ = AssetTypeDir(AssetType("unknown"))
	})
}

func TestCustomErrorTypes(t *testing.T) {
	missing := (&MissingFilesError{Files: []string{"a", "b"}}).Error()
	require.Contains(t, missing, "Missing required files:")
	require.Contains(t, missing, "a, b")

	conflict := (&MapAlreadyExistsError{MapCode: "ABC"}).Error()
	require.Contains(t, conflict, "ABC")
}

func TestProgressReader(t *testing.T) {
	payload := []byte("abcdef")
	progressCalls := 0
	var lastReceived int64
	var lastTotal int64

	reader := &ProgressReader{
		Reader: bytes.NewReader(payload),
		Total:  int64(len(payload)),
		ItemId: "asset-1",
		OnProgress: func(_ string, received int64, total int64) {
			progressCalls++
			lastReceived = received
			lastTotal = total
		},
	}

	out, err := io.ReadAll(reader)
	require.NoError(t, err)
	require.Equal(t, payload, out)
	require.GreaterOrEqual(t, progressCalls, 1)
	require.Equal(t, int64(len(payload)), lastReceived)
	require.Equal(t, int64(len(payload)), lastTotal)
}

func TestLocalMapCodePattern(t *testing.T) {
	require.True(t, LocalMapCodePattern.MatchString("AB"))
	require.True(t, LocalMapCodePattern.MatchString("ABC"))
	require.True(t, LocalMapCodePattern.MatchString("ABCD"))
	require.False(t, LocalMapCodePattern.MatchString("A"))
	require.False(t, LocalMapCodePattern.MatchString("ABCDE"))
	require.False(t, LocalMapCodePattern.MatchString("AbC"))
	require.False(t, LocalMapCodePattern.MatchString("abc"))
	require.False(t, LocalMapCodePattern.MatchString("AB1"))
	require.False(t, LocalMapCodePattern.MatchString(" AB"))
	require.False(t, LocalMapCodePattern.MatchString("AB "))
}

func TestNormalizeSemver(t *testing.T) {
	require.Equal(t, "v1.2.3", NormalizeSemver("1.2.3"))
	require.Equal(t, "v1.2.3", NormalizeSemver("v1.2.3"))
	require.Equal(t, "v1.2.3", NormalizeSemver(" 1.2.3 "))
	require.Equal(t, "", NormalizeSemver("   "))
}

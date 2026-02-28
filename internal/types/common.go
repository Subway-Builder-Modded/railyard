package types

import (
	"fmt"
	"strings"

	"golang.org/x/mod/semver"
)

type AssetType string

const (
	AssetTypeMap AssetType = "map"
	AssetTypeMod AssetType = "mod"
)

func IsValidAssetType(assetType AssetType) bool {
	switch assetType {
	case AssetTypeMap, AssetTypeMod:
		return true
	default:
		return false
	}
}

type Version string

func NormalizeVersion(v Version) (string, error) {
	raw := strings.TrimSpace(string(v))
	if raw == "" {
		return "", fmt.Errorf("version cannot be empty")
	}

	if !strings.HasPrefix(raw, "v") {
		raw = "v" + raw
	}

	if !semver.IsValid(raw) {
		return "", fmt.Errorf("invalid version %q", v)
	}

	return raw, nil
}

func CompareVersion(a Version, b Version) (int, error) {
	normalizedA, err := NormalizeVersion(a)
	if err != nil {
		return 0, err
	}
	normalizedB, err := NormalizeVersion(b)
	if err != nil {
		return 0, err
	}

	return semver.Compare(normalizedA, normalizedB), nil
}

func VersionEquals(a Version, b Version) (bool, error) {
	cmp, err := CompareVersion(a, b)
	if err != nil {
		return false, err
	}
	return cmp == 0, nil
}

func IsUpgrade(current Version, next Version) (bool, error) {
	cmp, err := CompareVersion(current, next)
	if err != nil {
		return false, err
	}
	return cmp < 0, nil
}

func IsDowngrade(current Version, next Version) (bool, error) {
	cmp, err := CompareVersion(current, next)
	if err != nil {
		return false, err
	}
	return cmp > 0, nil
}

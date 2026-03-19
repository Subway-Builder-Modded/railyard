package registry

import (
	"fmt"
	"os"
	"strings"

	"railyard/internal/constants"
	"railyard/internal/files"
	"railyard/internal/paths"
	"railyard/internal/types"
)

// BootstrapInstalledStateFromProfile rebuilds installed_mods/installed_maps from active profile subscriptions and on-disk marker checks, then persists the rebuilt state.
// This is primarily used when the installed_maps/mods are corrupted/incomplete to avoid having the user deal with a long queue of downloads for already-installed assets
func (r *Registry) BootstrapInstalledStateFromProfile(profile types.UserProfile) error {
	r.logger.Info(
		"Bootstrapping installed asset state from profile subscriptions",
		"profile_id", profile.ID,
		"subscriptions", profile.Subscriptions,
	)
	nextInstalledMods := r.bootstrapInstalledMods(profile.Subscriptions, r.config.Cfg.GetModsFolderPath())
	nextInstalledMaps := r.bootstrapInstalledMaps(profile.Subscriptions, r.config.Cfg.GetMapsFolderPath())

	previousMods := r.installedMods
	previousMaps := r.installedMaps
	r.installedMods = nextInstalledMods
	r.installedMaps = nextInstalledMaps

	if err := r.WriteInstalledToDisk(); err != nil {
		r.installedMods = previousMods
		r.installedMaps = previousMaps
		return fmt.Errorf("failed to persist bootstrapped installed state: %w", err)
	}

	r.logger.Info(
		"Bootstrapped installed asset state from profile subscriptions",
		"profile_id", profile.ID,
		"installed_mods_count", len(nextInstalledMods),
		"installed_maps_count", len(nextInstalledMaps),
	)
	return nil
}

func (r *Registry) bootstrapInstalledMods(subscriptions types.Subscriptions, modInstallRoot string) []types.InstalledModInfo {
	r.logger.Info("Bootstrapping installed mods from subscriptions", "subscriptions", subscriptions.Mods)

	installedMods := make([]types.InstalledModInfo, 0, len(subscriptions.Mods))
	for modID, version := range subscriptions.Mods {
		registryManifest, err := r.GetMod(modID)
		if err != nil {
			r.logger.Warn("Skipping subscribed mod during installed-state bootstrap: missing registry manifest", "mod_id", modID, "error", err)
			continue
		}

		modPath := paths.JoinLocalPath(modInstallRoot, modID)
		if !r.hasAssetMarker(types.AssetTypeMod, modID, modInstallRoot, modID) {
			continue
		}
		// Validate the manifest exists + matches the subscribed version to avoid bootstrapping out-of-date or corrupted mods
		manifestMatch, manifestErr := modManifestVersionMatches(modPath, version)
		if manifestErr != nil || !manifestMatch {
			r.logger.Warn(
				"Skipping subscribed mod during installed-state bootstrap: invalid/mismatched manifest",
				"mod_id", modID,
				"manifest_path", paths.JoinLocalPath(modPath, constants.MANIFEST_JSON),
				"expected_version", version,
				"error", manifestErr,
			)
			continue
		}

		installedMods = append(installedMods, installedModInfoFromManifest(modID, version, registryManifest))
	}

	return installedMods
}

func (r *Registry) bootstrapInstalledMaps(subscriptions types.Subscriptions, mapInstallRoot string) []types.InstalledMapInfo {
	r.logger.Info("Bootstrapping installed maps from subscriptions", "subscriptions", subscriptions.Maps)

	installedMaps := make([]types.InstalledMapInfo, 0, len(subscriptions.Maps)+len(subscriptions.LocalMaps))
	existingRemoteByID := make(map[string]types.InstalledMapInfo, len(r.installedMaps))
	manifestByCityCode := make(map[string]*types.MapManifest, len(r.maps))
	for i := range r.maps {
		manifest := &r.maps[i]
		cityCode := strings.TrimSpace(manifest.CityCode)
		if cityCode == "" {
			continue
		}
		manifestByCityCode[cityCode] = manifest
	}

	for _, installed := range r.installedMaps {
		if installed.IsLocal {
			continue
		}
		existingRemoteByID[installed.ID] = installed
	}

	for mapID, version := range subscriptions.Maps {
		manifest, err := r.GetMap(mapID)
		existing, hasExisting := existingRemoteByID[mapID]

		if err != nil && !hasExisting {
			r.logger.Warn("Skipping subscribed map during installed-state bootstrap: missing manifest and no previous installed entry", "map_id", mapID, "error", err)
			continue
		}

		cityCode := ""
		if manifest != nil {
			cityCode = strings.TrimSpace(manifest.CityCode)
		}
		if cityCode == "" && hasExisting {
			cityCode = strings.TrimSpace(existing.MapConfig.Code)
		}
		if cityCode == "" {
			r.logger.Warn("Skipping subscribed map during installed-state bootstrap: missing city_code", "map_id", mapID, "has_existing", hasExisting)
			continue
		}
		if _, ok := r.validateBootstrappedMapData(mapID, mapInstallRoot, cityCode, false); !ok {
			continue
		}

		if manifest != nil {
			manifestInstalled := installedMapInfoFromManifest(mapID, version, manifest)
			if hasExisting {
				manifestInstalled.MapConfig = bootstrapPreserveMapConfig(existing.MapConfig, manifestInstalled.MapConfig)
			}
			installedMaps = append(installedMaps, manifestInstalled)
			continue
		}

		if hasExisting {
			existing.Version = version
			existing.IsLocal = false
			if strings.TrimSpace(existing.MapConfig.Code) == "" {
				existing.MapConfig.Code = cityCode
			}
			if strings.TrimSpace(existing.MapConfig.Version) == "" {
				existing.MapConfig.Version = version
			}
			installedMaps = append(installedMaps, existing)
			continue
		}

		installedMaps = append(installedMaps, types.InstalledMapInfo{
			ID:      mapID,
			Version: version,
			IsLocal: false,
			MapConfig: types.ConfigData{
				Code:    cityCode,
				Version: version,
			},
		})
	}

	for localMapID, version := range subscriptions.LocalMaps {
		cityCode, ok := types.LocalMapCodeFromAssetID(localMapID)
		if !ok {
			r.logger.Warn("Skipping local map subscription during installed-state bootstrap: invalid local map id", "map_id", localMapID)
			continue
		}

		configFromDisk, ok := r.validateBootstrappedMapData(localMapID, mapInstallRoot, cityCode, true)
		if !ok {
			continue
		}

		config := configFromDisk
		if strings.TrimSpace(config.Code) == "" {
			config.Code = cityCode
		}
		config.Version = version
		if config.Country == nil || *config.Country == "" {
			if manifest, ok := manifestByCityCode[cityCode]; ok {
				config.Country = nonEmptyCountryPointer(manifest.Country)
			}
		}

		installedMaps = append(installedMaps, types.InstalledMapInfo{
			ID:        localMapID,
			Version:   version,
			IsLocal:   true,
			MapConfig: config,
		})
	}

	return installedMaps
}

func (r *Registry) validateBootstrappedMapData(assetID string, mapInstallRoot string, cityCode string, isLocal bool) (types.ConfigData, bool) {
	if !r.hasAssetMarker(types.AssetTypeMap, assetID, mapInstallRoot, cityCode) {
		return types.ConfigData{}, false
	}

	if isLocal {
		configFromDisk, errorType, validationErr := files.ValidateInstalledLocalMapData(mapInstallRoot, cityCode)
		if validationErr != nil {
			r.logger.Warn(
				"Skipping local map subscription during installed-state bootstrap: missing required local map files",
				"map_id", assetID,
				"map_code", cityCode,
				"error_type", errorType,
				"error", validationErr,
			)
			return types.ConfigData{}, false
		}
		return configFromDisk, true
	}

	errorType, validationErr := files.ValidateInstalledDownloadedMapData(mapInstallRoot, cityCode)
	if validationErr != nil {
		r.logger.Warn(
			"Skipping subscribed map during installed-state bootstrap: missing downloaded map data files",
			"map_id", assetID,
			"map_code", cityCode,
			"error_type", errorType,
			"error", validationErr,
		)
		return types.ConfigData{}, false
	}

	return types.ConfigData{}, true
}

// modManifestVersionMatches checks if the manifest.json in the given mod path exists and has a version field matching the expected version (from profile state)
func modManifestVersionMatches(modPath string, expectedVersion string) (bool, error) {
	manifestPath := paths.JoinLocalPath(modPath, constants.MANIFEST_JSON)
	manifest, err := files.ReadJSON[types.MetroMakerModManifest](manifestPath, "installed mod manifest", files.JSONReadOptions{})
	if err != nil {
		return false, err
	}
	semverExpected, semverActual := types.NormalizeSemver(expectedVersion), types.NormalizeSemver(manifest.Version)

	if semverExpected != semverActual {
		return false, fmt.Errorf("manifest version mismatch: expected %s, got %s", semverExpected, semverActual)
	}
	return true, nil
}

// hasAssetMarker checks for the presence of the .railyard_asset marker file in the expected location for the given asset, logging a warning if it is missing to avoid bootstrapping assets that may not be managed by Railyard or are corrupted/missing
func (r *Registry) hasAssetMarker(assetType types.AssetType, assetID string, installRoot string, markerPathPart string) bool {
	markerPath := paths.JoinLocalPath(installRoot, markerPathPart, constants.RailyardAssetMarker)
	_, err := os.Stat(markerPath)
	if !os.IsNotExist(err) {
		return true
	}
	attrs := []any{
		"asset_type", assetType,
		"asset_id", assetID,
		"marker_path", markerPath,
	}
	r.logger.Warn("Skipping subscribed asset during installed-state bootstrap: missing marker", attrs...)
	return false
}

func bootstrapPreserveMapConfig(existing types.ConfigData, manifestConfig types.ConfigData) types.ConfigData {
	config := existing

	config.Code = manifestConfig.Code
	config.Version = manifestConfig.Version

	if config.Country == nil || *config.Country == "" {
		config.Country = manifestConfig.Country
	}

	return config
}

func nonEmptyCountryPointer(country string) *string {
	if country == "" {
		return nil
	}
	value := country
	return &value
}

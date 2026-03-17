package registry

import (
	"fmt"
	"os"
	"strings"

	"railyard/internal/constants"
	"railyard/internal/paths"
	"railyard/internal/types"
)

// BootstrapInstalledStateFromProfile rebuilds installed_mods/installed_maps from active profile subscriptions
// and on-disk marker checks, then persists the rebuilt state.
func (r *Registry) BootstrapInstalledStateFromProfile(profile types.UserProfile) error {
	hasSubscriptions := len(profile.Subscriptions.Mods) > 0 || len(profile.Subscriptions.Maps) > 0

	metroMakerDataPath := strings.TrimSpace(r.config.Cfg.MetroMakerDataPath)
	if hasSubscriptions && metroMakerDataPath == "" {
		return fmt.Errorf("metro maker data path is not configured")
	}

	r.logger.Info(
		"Bootstrapping installed asset state from profile subscriptions",
		"profile_id", profile.ID,
		"subscriptions", profile.Subscriptions,
	)

	modInstallRoot := paths.JoinLocalPath(metroMakerDataPath, "mods")
	mapInstallRoot := paths.JoinLocalPath(metroMakerDataPath, "cities", "data")

	nextInstalledMods := r.bootstrapInstalledMods(profile.Subscriptions, modInstallRoot)
	nextInstalledMaps := r.bootstrapInstalledMaps(profile.Subscriptions, mapInstallRoot)

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
		markerPath := paths.JoinLocalPath(modInstallRoot, modID, constants.RailyardAssetMarker)
		if !fileExists(markerPath) {
			r.logger.Warn(
				"Skipping subscribed mod during installed-state bootstrap: missing marker",
				"mod_id", modID,
				"marker_path", markerPath,
			)
			continue
		}

		installedMods = append(installedMods, types.InstalledModInfo{
			ID:      modID,
			Version: strings.TrimSpace(version),
		})
	}

	return installedMods
}

func (r *Registry) bootstrapInstalledMaps(subscriptions types.Subscriptions, mapInstallRoot string) []types.InstalledMapInfo {
	r.logger.Info("Bootstrapping installed maps from subscriptions", "subscriptions", subscriptions.Maps)

	mapManifestByID := r.mapManifestByID()
	installedMaps := make([]types.InstalledMapInfo, 0, len(subscriptions.Maps))

	for mapID, version := range subscriptions.Maps {
		manifest, ok := mapManifestByID[mapID]
		if !ok {
			r.logger.Warn("Skipping subscribed map during installed-state bootstrap: missing manifest", "map_id", mapID)
			continue
		}

		cityCode := strings.TrimSpace(manifest.CityCode)
		if cityCode == "" {
			r.logger.Warn("Skipping subscribed map during installed-state bootstrap: missing city_code", "map_id", mapID)
			continue
		}

		markerPath := paths.JoinLocalPath(mapInstallRoot, cityCode, constants.RailyardAssetMarker)
		if !fileExists(markerPath) {
			r.logger.Warn(
				"Skipping subscribed map during installed-state bootstrap: missing marker",
				"map_id", mapID,
				"map_code", cityCode,
				"marker_path", markerPath,
			)
			continue
		}

		installedMaps = append(installedMaps, types.InstalledMapInfo{
			ID:      mapID,
			Version: strings.TrimSpace(version),
			MapConfig: types.ConfigData{
				Code: cityCode,
			},
		})
	}

	return installedMaps
}

func (r *Registry) mapManifestByID() map[string]types.MapManifest {
	manifestByID := make(map[string]types.MapManifest, len(r.maps))
	for _, manifest := range r.maps {
		manifestByID[manifest.ID] = manifest
	}
	return manifestByID
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

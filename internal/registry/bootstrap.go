package registry

import (
	"fmt"
	"os"
	"strings"

	"railyard/internal/constants"
	"railyard/internal/paths"
	"railyard/internal/types"
)

// BootstrapSummary reports the outcome of rebuilding installed state from profile subscriptions.
type BootstrapSummary struct {
	DesiredMods                int
	DesiredMaps                int
	RebuiltMods                int
	RebuiltMaps                int
	SkippedModsMissingMarker   int
	SkippedMapsMissingMarker   int
	SkippedMapsMissingManifest int
	SkippedMapsMissingCode     int
}

// BootstrapInstalledStateFromProfile rebuilds installed_mods/installed_maps from active profile subscriptions
// and on-disk marker checks, then persists the rebuilt state.
func (r *Registry) BootstrapInstalledStateFromProfile(profile types.UserProfile) (BootstrapSummary, error) {
	summary := BootstrapSummary{
		DesiredMods: len(profile.Subscriptions.Mods),
		DesiredMaps: len(profile.Subscriptions.Maps),
	}

	metroMakerDataPath := strings.TrimSpace(r.config.Cfg.MetroMakerDataPath)
	if (summary.DesiredMods > 0 || summary.DesiredMaps > 0) && metroMakerDataPath == "" {
		return summary, fmt.Errorf("metro maker data path is not configured")
	}

	modInstallRoot := paths.JoinLocalPath(metroMakerDataPath, "mods")
	mapInstallRoot := paths.JoinLocalPath(metroMakerDataPath, "cities", "data")

	nextInstalledMods := make([]types.InstalledModInfo, 0, summary.DesiredMods)
	for modID, version := range profile.Subscriptions.Mods {
		markerPath := paths.JoinLocalPath(modInstallRoot, modID, constants.AssetMarkerFileName)
		if !fileExists(markerPath) {
			summary.SkippedModsMissingMarker++
			continue
		}
		nextInstalledMods = append(nextInstalledMods, types.InstalledModInfo{
			ID:      modID,
			Version: strings.TrimSpace(version),
		})
		summary.RebuiltMods++
	}

	mapManifestByID := make(map[string]types.MapManifest, len(r.maps))
	for _, manifest := range r.maps {
		mapManifestByID[manifest.ID] = manifest
	}

	nextInstalledMaps := make([]types.InstalledMapInfo, 0, summary.DesiredMaps)
	for mapID, version := range profile.Subscriptions.Maps {
		manifest, ok := mapManifestByID[mapID]
		if !ok {
			summary.SkippedMapsMissingManifest++
			continue
		}

		cityCode := strings.TrimSpace(manifest.CityCode)
		if cityCode == "" {
			summary.SkippedMapsMissingCode++
			continue
		}

		markerPath := paths.JoinLocalPath(mapInstallRoot, cityCode, constants.AssetMarkerFileName)
		if !fileExists(markerPath) {
			summary.SkippedMapsMissingMarker++
			continue
		}

		nextInstalledMaps = append(nextInstalledMaps, types.InstalledMapInfo{
			ID:      mapID,
			Version: strings.TrimSpace(version),
			MapConfig: types.ConfigData{
				Code: cityCode,
			},
		})
		summary.RebuiltMaps++
	}

	previousMods := r.installedMods
	previousMaps := r.installedMaps
	r.installedMods = nextInstalledMods
	r.installedMaps = nextInstalledMaps

	if err := r.WriteInstalledToDisk(); err != nil {
		r.installedMods = previousMods
		r.installedMaps = previousMaps
		return summary, fmt.Errorf("failed to persist bootstrapped installed state: %w", err)
	}

	return summary, nil
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

package registry

import (
	"fmt"

	"railyard/internal/types"
	"railyard/internal/utils"
)

// GetAssetDownloadCounts returns the download counts for all versions of a specific mod or map.
func (r *Registry) GetAssetDownloadCounts(assetType types.AssetType, assetID string) types.AssetDownloadCountsResponse {
	if !types.IsValidAssetType(assetType) {
		// This is validation of frontend input. If this occurs, it's an implementation error
		if r.logger != nil {
			r.logger.Warn("GetAssetDownloadCounts rejected invalid asset type", "asset_type", assetType, "asset_id", assetID)
		}
		return types.AssetDownloadCountsResponse{
			GenericResponse: types.ErrorResponse(fmt.Sprintf("invalid asset type %q: valid types are %q and %q", assetType, types.AssetTypeMap, types.AssetTypeMod)),
			AssetType:       string(assetType),
			AssetID:         assetID,
			Counts:          map[string]int{},
		}
	}

	countsByAssetID := r.downloadCounts[assetType]
	countsByAssetID = utils.OrEmptyNestedMap(countsByAssetID)
	assetCounts := utils.CloneMap(countsByAssetID[assetID])
	if r.logger != nil {
		r.logger.Info("Fetched asset download counts", "asset_type", assetType, "asset_id", assetID, "version_count", len(assetCounts), "counts", assetCounts)
	}

	return types.AssetDownloadCountsResponse{
		GenericResponse: types.SuccessResponse("Asset download counts loaded"),
		AssetType:       string(assetType),
		AssetID:         assetID,
		Counts:          assetCounts,
	}
}

// GetDownloadCountsByAssetType returns the download counts for all mods or maps, organized by asset ID and version.
func (r *Registry) GetDownloadCountsByAssetType(assetType types.AssetType) types.DownloadCountsByAssetTypeResponse {
	if !types.IsValidAssetType(assetType) {
		// This is validation of frontend input. If this occurs, it's an implementation error
		if r.logger != nil {
			r.logger.Warn("GetDownloadCountsByAssetType rejected invalid asset type", "asset_type", assetType)
		}
		return types.DownloadCountsByAssetTypeResponse{
			GenericResponse: types.ErrorResponse(fmt.Sprintf("invalid asset type %q: valid types are %q and %q", assetType, types.AssetTypeMap, types.AssetTypeMod)),
			AssetType:       string(assetType),
			Counts:          map[string]map[string]int{},
		}
	}

	countsByAssetID := r.downloadCounts[assetType]
	countsByAssetID = utils.OrEmptyNestedMap(countsByAssetID)
	if r.logger != nil {
		r.logger.Info("Fetched download counts by asset type", "asset_type", assetType, "asset_count", len(countsByAssetID))
	}

	return types.DownloadCountsByAssetTypeResponse{
		GenericResponse: types.SuccessResponse("Download counts loaded"),
		AssetType:       string(assetType),
		Counts:          utils.CloneNestedMap(countsByAssetID),
	}
}

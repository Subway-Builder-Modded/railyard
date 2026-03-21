package downloader

import (
	"archive/zip"
	"compress/gzip"
	"io"
	"os"
	"path"
	"path/filepath"
	"sync"
	"sync/atomic"

	"railyard/internal/constants"
	"railyard/internal/files"
	"railyard/internal/paths"
	"railyard/internal/types"
	"railyard/internal/utils"
)

// extractMod processes the downloaded mod zip file, extracts it to the appropriate location.
func extractMod(d *Downloader, filePath string, modId string, version string) types.AssetInstallResponse {
	reader, err := zip.OpenReader(filePath)
	if err != nil {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorInvalidArchive, "Failed to open zip file", err, "file_path", filePath, "mod_id", modId)
	}
	defer reader.Close()

	destFolder := paths.JoinLocalPath(d.getModPath(), modId)

	requiredFiles := map[string]types.FileFoundStruct{
		"manifest":        {Found: false, FileObject: nil, Required: true},
		"manifest_target": {Found: false, FileObject: nil, Required: true},
	}

	fileCount := 0
	for _, file := range reader.File {
		if !file.FileInfo().IsDir() {
			fileCount++
		}
	}

	for _, file := range reader.File {
		if file.Name == constants.MANIFEST_JSON {
			requiredFiles["manifest"] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
		}
	}

	if !requiredFiles["manifest"].Found {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorInvalidArchive, "Zip file is missing manifest.json", nil, "file_path", filePath, "mod_id", modId)
	}

	rawManifestReader, err := requiredFiles["manifest"].FileObject.Open()
	if err != nil {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorInvalidManifest, "Failed to read manifest file", err, "file_path", filePath, "mod_id", modId)
	}
	defer rawManifestReader.Close()

	rawManifestBytes, err := io.ReadAll(rawManifestReader)
	if err != nil {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorInvalidManifest, "Failed to read manifest file", err, "file_path", filePath, "mod_id", modId)
	}

	manifestData, err := files.ParseJSON[types.MetroMakerModManifest](rawManifestBytes, constants.MANIFEST_JSON)
	if err != nil {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorInvalidManifest, "Failed to parse manifest file", err, "file_path", filePath, "mod_id", modId)
	}
	for _, file := range reader.File {
		if file.Name == manifestData.Main {
			requiredFiles["manifest_target"] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
			break
		}
	}

	if !requiredFilesPresent(requiredFiles) {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorInvalidArchive, "Zip file is missing one or more required files", nil, "file_path", filePath, "mod_id", modId)
	}

	if err := os.MkdirAll(destFolder, os.ModePerm); err != nil {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorFilesystem, "Failed to create destination folder", err, "destination", destFolder, "mod_id", modId)
	}

	// First pass: create directories to avoid extract errors
	for _, file := range reader.File {
		if file.FileInfo().IsDir() {
			destPath := paths.JoinLocalPath(destFolder, file.Name)
			if err := os.MkdirAll(destPath, os.ModePerm); err != nil {
				return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorFilesystem, "Failed to create directory during extraction", err, "directory_path", destPath, "mod_id", modId)
			}
		}
	}

	// Second pass: extract files in parallel
	var wg sync.WaitGroup
	errChan := make(chan error, len(reader.File))

	if d.OnExtractProgress != nil {
		d.OnExtractProgress(modId, 0, int64(fileCount))
	}
	var installCounter atomic.Int64
	for _, file := range reader.File {
		if !file.FileInfo().IsDir() {
			wg.Add(1)
			go func(file *zip.File) {
				defer wg.Done()

				destPath := paths.JoinLocalPath(destFolder, file.Name)

				// Ensure parent directory exists
				parentDir := filepath.Dir(destPath)
				if err := os.MkdirAll(parentDir, os.ModePerm); err != nil {
					errChan <- err
					return
				}

				destFile, err := os.Create(destPath)
				if err != nil {
					errChan <- err
					return
				}
				defer destFile.Close()

				srcFile, err := file.Open()
				if err != nil {
					errChan <- err
					return
				}
				defer srcFile.Close()

				_, err = io.Copy(destFile, srcFile)
				if d.OnExtractProgress != nil {
					d.OnExtractProgress(modId, installCounter.Add(1), int64(fileCount))
				}
				if err != nil {
					errChan <- err
					return
				}
			}(file)
		}
	}

	wg.Wait()
	close(errChan)

	if len(errChan) > 0 {
		err := <-errChan
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorExtractFailed, "Failed to extract file", err, "file_path", filePath, "mod_id", modId)
	}

	if err := createAssetMarker(paths.JoinLocalPath(destFolder, constants.RailyardAssetMarker)); err != nil {
		return d.installError(types.AssetTypeMod, modId, version, types.ConfigData{}, types.InstallErrorFilesystem, "Failed to create asset marker file", err, "mod_id", modId)
	}

	return d.installSuccess(types.AssetTypeMod, modId, version, types.ConfigData{}, "Mod extracted successfully", "file_path", filePath, "assetId", modId)
}

// extractMap processes map zip files for downloaded/local installs and writes only the expected city-data artifacts.
func extractMap(d *Downloader, filePath string, mapId string, version string) types.AssetInstallResponse {
	configData, errorType, inspectErr := files.ValidateMapArchive(filePath)
	if inspectErr != nil {
		return d.installError(types.AssetTypeMap, mapId, version, configData, errorType, "Failed map archive inspection", inspectErr, "file_path", filePath)
	}

	reader, err := zip.OpenReader(filePath)
	if err != nil {
		return d.installError(types.AssetTypeMap, mapId, version, configData, types.InstallErrorInvalidArchive, "Failed to open zip file", err, "file_path", filePath)
	}
	defer reader.Close()

	filesFound := files.BuildMapArchiveFileIndex(reader.File)

	filesCount := 0
	for _, fileStruct := range filesFound {
		if fileStruct.Found {
			filesCount++
		}
	}
	if configData.ThumbnailBbox != nil {
		if fileStruct, ok := filesFound[files.MapArchiveKeyThumbnail]; !ok || !fileStruct.Found {
			filesCount++
		}
	}

	if conflict, hasConflict := d.FindMapCodeConflict(mapId, configData.Code, true); hasConflict {
		return d.installError(
			types.AssetTypeMap,
			mapId,
			version,
			configData,
			types.InstallErrorMapCodeConflict,
			"Cannot install map because its code matches a vanilla map included with the game or an already installed map.",
			nil,
			"map_code", conflict.CityCode,
			"conflicting_asset_id", conflict.ExistingAssetID,
			"conflicting_is_local", conflict.ExistingIsLocal,
		)
	}

	// Create necessary directories first
	destFolder := paths.JoinLocalPath(d.getMapDataPath(), configData.Code)
	if err := os.MkdirAll(destFolder, os.ModePerm); err != nil {
		return d.installError(types.AssetTypeMap, mapId, version, configData, types.InstallErrorFilesystem, "Failed to create destination folder", err, "destination", destFolder)
	}
	if err := os.MkdirAll(d.getMapTilePath(), os.ModePerm); err != nil {
		return d.installError(types.AssetTypeMap, mapId, version, configData, types.InstallErrorFilesystem, "Failed to create tiles directory", err, "tiles_path", d.getMapTilePath())
	}
	if err := os.MkdirAll(d.getMapThumbnailPath(), os.ModePerm); err != nil {
		return d.installError(types.AssetTypeMap, mapId, version, configData, types.InstallErrorFilesystem, "Failed to create thumbnail directory", err, "thumbnail_path", d.getMapThumbnailPath())
	}

	// Process files in parallel
	var wg sync.WaitGroup
	errChan := make(chan error, len(filesFound))

	// Use atomic counter to track progress across routines
	var extractCount atomic.Int64
	if d.OnExtractProgress != nil {
		d.OnExtractProgress(configData.Code, 0, int64(filesCount))
	}
	for key, fileStruct := range filesFound {
		if !fileStruct.Found {
			continue
		}

		wg.Add(1)
		go func(key string, fileStruct types.FileFoundStruct) {
			defer wg.Done()

			srcFile, err := fileStruct.FileObject.Open()
			if err != nil {
				errChan <- err
				return
			}
			defer srcFile.Close()

			outputFileName := path.Base(fileStruct.FileObject.Name)
			destinationPath := paths.JoinLocalPath(destFolder, outputFileName+".gz")
			shouldArchive := true

			switch key {
			// Extract out config.json for future bootstrapping from installed state, in particular for local maps
			case files.MapArchiveKeyConfig:
				destinationPath = paths.JoinLocalPath(destFolder, files.MapConfigFileName)
				shouldArchive = false
			case files.MapArchiveKeyTiles:
				destinationPath = paths.JoinLocalPath(d.getMapTilePath(), configData.Code+files.MapTileFileExt)
				shouldArchive = false
			case files.MapArchiveKeyThumbnail:
				destinationPath = paths.JoinLocalPath(d.getMapThumbnailPath(), configData.Code+files.MapThumbnailFileExt)
				shouldArchive = false
			}

			extractFileMap(destinationPath, srcFile, errChan, shouldArchive)
			if d.OnExtractProgress != nil {
				d.OnExtractProgress(configData.Code, extractCount.Add(1), int64(filesCount))
			}
		}(key, fileStruct)
	}

	wg.Wait()
	close(errChan)

	if len(errChan) > 0 {
		err := <-errChan
		return d.installError(types.AssetTypeMap, mapId, version, configData, types.InstallErrorExtractFailed, "Failed to extract file", err, "file_path", filePath)
	}
	if fileStruct, ok := filesFound[files.MapArchiveKeyThumbnail]; (!ok || !fileStruct.Found) && configData.ThumbnailBbox != nil {
		srv, port, srvErr := utils.StartTempPMTilesServer()
		if srvErr != nil {
			return d.installWarn(types.AssetTypeMap, mapId, version, configData, nil, "Failed to start PMTiles server for thumbnail generation, but map was extracted successfully.", "file_path", filePath, "map_code", configData.Code)
		}
		defer srv.Close()

		thumbnailData, err := utils.GenerateThumbnail(configData.Code, configData, port)
		if err != nil {
			return d.installWarn(types.AssetTypeMap, mapId, version, configData, nil, "Failed to generate thumbnail, but map was extracted successfully. You can try generating the thumbnail later from the map details page.", "file_path", filePath, "map_code", configData.Code)
		}

		thumbnailPath := paths.JoinLocalPath(d.getMapThumbnailPath(), configData.Code+files.MapThumbnailFileExt)
		if err := files.WriteFilesAtomically([]files.AtomicFileWrite{
			{
				Path:  thumbnailPath,
				Label: "map thumbnail",
				Data:  []byte(thumbnailData),
				Perm:  0o644,
			},
		}); err != nil {
			return d.installWarn(types.AssetTypeMap, mapId, version, configData, nil, "Failed to save generated thumbnail, but map was extracted successfully. You can try generating the thumbnail later from the map details page.", "file_path", filePath, "map_code", configData.Code, "thumbnail_path", thumbnailPath)
		}
		if d.OnExtractProgress != nil {
			d.OnExtractProgress(configData.Code, extractCount.Add(1), int64(filesCount))
		}
	}

	if err := createAssetMarker(paths.JoinLocalPath(destFolder, constants.RailyardAssetMarker)); err != nil {
		return d.installError(types.AssetTypeMap, mapId, version, configData, types.InstallErrorFilesystem, "Failed to create asset marker file", err, "assetId", mapId)
	}

	return d.installSuccess(types.AssetTypeMap, mapId, version, configData, "Map extracted successfully", "file_path", filePath, "map_code", configData.Code)
}

func extractFileMap(path string, srcFile io.ReadCloser, errChan chan<- error, useGzip bool) {
	destFile, err := os.Create(path)
	if err != nil {
		errChan <- err
		return
	}

	defer destFile.Close()

	if useGzip {
		gzipWriter := gzip.NewWriter(destFile)
		defer gzipWriter.Close()
		_, err = io.Copy(gzipWriter, srcFile)
		if err != nil {
			errChan <- err
			return
		}
	} else {
		_, err = io.Copy(destFile, srcFile)
		if err != nil {
			errChan <- err
			return
		}
	}
}

func createAssetMarker(path string) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	return file.Close()
}

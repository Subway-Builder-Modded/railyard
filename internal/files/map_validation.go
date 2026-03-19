package files

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path"

	"railyard/internal/paths"
	"railyard/internal/types"
)

const (
	mapConfigFileName     = "config.json"
	mapDemandFileName     = "demand_data.json"
	mapRoadsFileName      = "roads.geojson"
	mapRunwaysFileName    = "runways_taxiways.geojson"
	mapBuildingsFileName  = "buildings_index.json"
	mapOceanDepthFileName = "ocean_depth_index.json"

	mapDemandArchivedFileName    = "demand_data.json.gz"
	mapRoadsArchivedFileName     = "roads.geojson.gz"
	mapRunwaysArchivedFileName   = "runways_taxiways.geojson.gz"
	mapBuildingsArchivedFileName = "buildings_index.json.gz"

	mapTileFileExt      = ".pmtiles"
	mapThumbnailFileExt = ".svg"

	MapArchiveKeyConfig     = "config"
	MapArchiveKeyDemandData = "demandData"
	MapArchiveKeyRoads      = "roads"
	MapArchiveKeyRunways    = "runways"
	MapArchiveKeyBuildings  = "buildings"
	MapArchiveKeyTiles      = "tiles"
	MapArchiveKeyThumbnail  = "thumbnail"
	MapArchiveKeyOceanDepth = "oceanDepth"
)

func BuildMapArchiveFileIndex(zipFiles []*zip.File) map[string]types.FileFoundStruct {
	filesFound := map[string]types.FileFoundStruct{
		MapArchiveKeyConfig:     {Found: false, FileObject: nil, Required: true},
		MapArchiveKeyDemandData: {Found: false, FileObject: nil, Required: true},
		MapArchiveKeyRoads:      {Found: false, FileObject: nil, Required: true},
		MapArchiveKeyRunways:    {Found: false, FileObject: nil, Required: true},
		MapArchiveKeyBuildings:  {Found: false, FileObject: nil, Required: true},
		MapArchiveKeyTiles:      {Found: false, FileObject: nil, Required: true},
		MapArchiveKeyThumbnail:  {Found: false, FileObject: nil, Required: false},
		MapArchiveKeyOceanDepth: {Found: false, FileObject: nil, Required: false},
	}

	for _, file := range zipFiles {
		switch file.Name {
		case mapConfigFileName:
			filesFound[MapArchiveKeyConfig] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
		case mapDemandFileName:
			filesFound[MapArchiveKeyDemandData] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
		case mapRoadsFileName:
			filesFound[MapArchiveKeyRoads] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
		case mapRunwaysFileName:
			filesFound[MapArchiveKeyRunways] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
		case mapBuildingsFileName:
			filesFound[MapArchiveKeyBuildings] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
		case mapOceanDepthFileName:
			filesFound[MapArchiveKeyOceanDepth] = types.FileFoundStruct{Found: true, FileObject: file, Required: false}
		}
		if path.Ext(file.Name) == mapTileFileExt {
			filesFound[MapArchiveKeyTiles] = types.FileFoundStruct{Found: true, FileObject: file, Required: true}
		}
		if path.Ext(file.Name) == mapThumbnailFileExt {
			filesFound[MapArchiveKeyThumbnail] = types.FileFoundStruct{Found: true, FileObject: file, Required: false}
		}
	}

	return filesFound
}

// ValidateMapArchive validates required map archive files and parses config.json.
func ValidateMapArchive(filePath string) (types.ConfigData, types.DownloaderErrorType, error) {
	configData := types.ConfigData{}
	reader, err := zip.OpenReader(filePath)
	if err != nil {
		return configData, types.InstallErrorInvalidArchive, err
	}
	defer reader.Close()

	filesFound := BuildMapArchiveFileIndex(reader.File)

	if !requiredFilesPresent(filesFound) {
		return configData, types.InstallErrorInvalidArchive, &types.MissingFilesError{Files: []string{"map archive is missing one or more required files"}}
	}

	configReader, err := filesFound[MapArchiveKeyConfig].FileObject.Open()
	if err != nil {
		return configData, types.InstallErrorInvalidManifest, err
	}
	defer configReader.Close()

	configBytes, err := io.ReadAll(configReader)
	if err != nil {
		return configData, types.InstallErrorInvalidManifest, err
	}

	configData, err = ParseJSON[types.ConfigData](configBytes, "config")
	if err != nil {
		return configData, types.InstallErrorInvalidManifest, err
	}
	if !types.IsValidMapCode(configData.Code) {
		return configData, types.InstallErrorInvalidMapCode, fmt.Errorf("invalid map code %q in config.json: must match ^[A-Z]{2,4}$", configData.Code)
	}

	return configData, "", nil
}

func readInstalledMapConfig(mapInstallRoot string, cityCode string) (types.ConfigData, types.DownloaderErrorType, error) {
	configData := types.ConfigData{}
	plainPath := paths.JoinLocalPath(mapInstallRoot, cityCode, mapConfigFileName)
	file, err := os.Open(plainPath)
	if err != nil {
		return configData, types.InstallErrorInvalidManifest, fmt.Errorf("failed to open installed map config: %w", err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return configData, types.InstallErrorInvalidManifest, fmt.Errorf("failed to read installed map config payload: %w", err)
	}
	configData, err = ParseJSON[types.ConfigData](data, "installed map config")
	if err != nil {
		return configData, types.InstallErrorInvalidManifest, fmt.Errorf("failed to parse installed map config: %w", err)
	}
	if !types.IsValidMapCode(configData.Code) {
		return configData, types.InstallErrorInvalidMapCode, fmt.Errorf("invalid map code %q in installed map config: must match ^[A-Z]{2,4}$", configData.Code)
	}

	return configData, "", nil
}

// ValidateInstalledLocalMapData validates required on-disk local map files and parses config.json.
func ValidateInstalledLocalMapData(mapInstallRoot string, cityCode string) (types.ConfigData, types.DownloaderErrorType, error) {
	configPath := paths.JoinLocalPath(mapInstallRoot, cityCode, mapConfigFileName)
	if _, err := os.Stat(configPath); err != nil {
		if os.IsNotExist(err) {
			return types.ConfigData{}, types.InstallErrorInvalidArchive, &types.MissingFilesError{Files: []string{fmt.Sprintf("missing installed map file: %s", configPath)}}
		}
		return types.ConfigData{}, types.InstallErrorFilesystem, fmt.Errorf("failed to stat installed map file %q: %w", configPath, err)
	}

	if errorType, err := validateRequiredInstalledMapFiles(mapInstallRoot, cityCode); err != nil {
		return types.ConfigData{}, errorType, err
	}

	return readInstalledMapConfig(mapInstallRoot, cityCode)
}

// ValidateInstalledDownloadedMapData validates the expected on-disk data files for downloaded maps.
// Downloaded maps in active installs may omit config/tile artifacts during normal game runtime.
func ValidateInstalledDownloadedMapData(mapInstallRoot string, cityCode string) (types.DownloaderErrorType, error) {
	return validateRequiredInstalledMapFiles(mapInstallRoot, cityCode)
}

func requiredFilesPresent(filesFound map[string]types.FileFoundStruct) bool {
	for _, fileStruct := range filesFound {
		if fileStruct.Required && !fileStruct.Found {
			return false
		}
	}
	return true
}

func validateRequiredInstalledMapFiles(mapInstallRoot string, cityCode string) (types.DownloaderErrorType, error) {
	requiredPaths := []string{
		paths.JoinLocalPath(mapInstallRoot, cityCode, mapDemandArchivedFileName),
		paths.JoinLocalPath(mapInstallRoot, cityCode, mapRoadsArchivedFileName),
		paths.JoinLocalPath(mapInstallRoot, cityCode, mapRunwaysArchivedFileName),
		paths.JoinLocalPath(mapInstallRoot, cityCode, mapBuildingsArchivedFileName),
	}

	for _, filePath := range requiredPaths {
		if _, err := os.Stat(filePath); err != nil {
			if os.IsNotExist(err) {
				return types.InstallErrorInvalidArchive, &types.MissingFilesError{Files: []string{fmt.Sprintf("missing installed map file: %s", filePath)}}
			}
			return types.InstallErrorFilesystem, fmt.Errorf("failed to stat installed map file %q: %w", filePath, err)
		}
	}
	return "", nil
}

package constants

import (
	_ "embed"
)

//go:embed version.txt
var RAILYARD_VERSION string

const RAILYARD_REPO = "Subway-Builder-Modded/Railyard"

// AssetMarkerFileName marks files/directories managed by Railyard installs.
const AssetMarkerFileName = ".railyard_asset"
const AssetSaltedMarkerFileName = ".railyard_assets_salted"

package constants

const MOD_VERSION = "1.0.0"

const MOD_TEMPLATE = `
const config = $REPLACE;
function getFlagEmoji (countryCode) {
	let codePoints = countryCode.toUpperCase().split('').map(char =>  127397 + char.charCodeAt());
	return String.fromCodePoint(...codePoints);
}

function getCountryName(countryCode) {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(countryCode.toUpperCase());
}

function generateTabs(places) {
  let tabs = {};
  places.forEach(place => {
    if(place.country === undefined || place.country.toUpperCase() === "US" || place.country.toUpperCase() === "GB") { // don't make tabs for these, we will have to do these on an upcoming update
      return;
    }
    if(tabs.hasOwnProperty(place.country)) {
      tabs[place.country].push(place.code);
    } else {
      tabs[place.country] = [place.code];
    }
  });
  return tabs;
}

config.places.forEach(async place => {
    let publicDir = await window.electron.getModsFolder();
    publicDir = publicDir.replaceAll('\\', '/').replace("/mods", '/public/data/city-maps/');
    let newPlace = {
        code: place.code,
        name: place.name,
        population: place.population,
        description: place.description,
        mapImageUrl: "file://" + publicDir + place.code + ".svg" // Tries to pull this from the app.asar instead of public/
    };
    if (place.initialViewState) {
        newPlace.initialViewState = place.initialViewState;
    } else {
        newPlace.initialViewState = {
            longitude: (place.bbox[0] + place.bbox[2]) / 2,
            latitude: (place.bbox[1] + place.bbox[3]) / 2,
            zoom: 12,
            bearing: 0,
        };
    }
    window.SubwayBuilderAPI.registerCity(newPlace);
    window.SubwayBuilderAPI.map.setDefaultLayerVisibility(place.code, {
        oceanFoundations: false,
        trackElevations: false
    });
    // 3. Fix layer schemas for custom tiles
    window.SubwayBuilderAPI.map.setLayerOverride({
        layerId: 'parks-large',
        sourceLayer: 'landuse',
        filter: ['==', ['get', 'kind'], 'park'],
    });

    window.SubwayBuilderAPI.map.setLayerOverride({
        layerId: 'airports',
        sourceLayer: 'landuse',
        filter: ['==', ['get', 'kind'], 'aerodrome'],
    });

    window.SubwayBuilderAPI.map.setTileURLOverride({
        cityCode: place.code,
        tilesUrl: "http://127.0.0.1:" + config.port + "/" + place.code + "/{z}/{x}/{y}.mvt",
        foundationTilesUrl: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        maxZoom: config["tile-zoom-level"]
    });

    window.SubwayBuilderAPI.cities.setCityDataFiles(place.code, { // auto appends .gz, is this intended? if it is then its fine if not then that has to be removed so we can manually set the .gz file extension
        buildingsIndex: "/data/" + place.code + "/buildings_index.json",
        demandData: "/data/" + place.code + "/demand_data.json", // drivingPaths supplied in demand_data.json.gz still aren't used
        roads: "/data/" + place.code + "/roads.geojson",
        runwaysTaxiways: "/data/" + place.code + "/runways_taxiways.geojson",
    })
})

let tabs = generateTabs(config.places);
Object.entries(tabs).forEach(([country, codes]) => {
    window.SubwayBuilderAPI.cities.registerTab({
      id: country,
      label: getCountryName(country),
      emoji: getFlagEmoji(country),
      cityCodes: codes,
    });
});
`

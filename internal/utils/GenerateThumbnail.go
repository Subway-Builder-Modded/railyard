package utils

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"path"
	"time"

	"railyard/internal/paths"
	"railyard/internal/types"

	svg "github.com/ajstarks/svgo"
	"github.com/paulmach/orb"
	"github.com/paulmach/orb/encoding/mvt"
	"github.com/protomaps/go-pmtiles/pmtiles"
)

var globalPMTilesServer *http.Server
var globalPMTilesPort int

// Global projection state for coordinate transformation
var (
	projectionMinTileX, projectionMinTileY int
	projectionMaxTileX, projectionMaxTileY int
	projectionScale                        float64
	projectionOffsetX, projectionOffsetY   float64
	projectionInitialized                  bool
)

// initializeProjection sets up bounding box and scaling for coordinate transformation
func initializeProjection(minTileX, minTileY, maxTileX, maxTileY int) {
	// Store tile bounds for coordinate calculation
	projectionMinTileX = minTileX
	projectionMinTileY = minTileY
	projectionMaxTileX = maxTileX
	projectionMaxTileY = maxTileY

	// Calculate total pixel space across all tiles
	tileGridWidth := float64((maxTileX - minTileX + 1) * 4096)
	tileGridHeight := float64((maxTileY - minTileY + 1) * 4096)

	// Calculate scale to fit grid into 800x800 canvas
	scaleX := 800.0 / tileGridWidth
	scaleY := 800.0 / tileGridHeight
	projectionScale = math.Min(scaleX, scaleY)

	// Calculate offset to center content
	scaledWidth := tileGridWidth * projectionScale
	scaledHeight := tileGridHeight * projectionScale
	projectionOffsetX = (800.0 - scaledWidth) / 2
	projectionOffsetY = (800.0 - scaledHeight) / 2

	projectionInitialized = true
}

// projectCoordinates converts tile coordinates to canvas coordinates
// tileX, tileY are tile indices; pixelX, pixelY are coordinates within that tile (0-4096)
func projectCoordinatesWithTile(tileX, tileY int, pixelX, pixelY float64) (float64, float64) {
	if !projectionInitialized {
		// Fallback: simple scaling within a single tile
		return (pixelX / 4096.0) * 800, (pixelY / 4096.0) * 800
	}

	// Calculate absolute pixel position across tile grid
	absoluteX := float64((tileX-projectionMinTileX)*4096) + pixelX
	absoluteY := float64((tileY-projectionMinTileY)*4096) + pixelY

	// Scale and offset to canvas
	canvasX := absoluteX*projectionScale + projectionOffsetX
	canvasY := absoluteY*projectionScale + projectionOffsetY

	return canvasX, canvasY
}

// projectCoordinates is a legacy wrapper for single-tile coordinates
func projectCoordinates(pixelX, pixelY float64) (float64, float64) {
	return projectCoordinatesWithTile(projectionMinTileX, projectionMinTileY, pixelX, pixelY)
}

func lon2tile(lon float64, zoom int) int {
	return int(math.Floor((lon + 180.0) / 360.0 * math.Pow(2, float64(zoom))))
}

func lat2tile(lat float64, zoom int) int {
	return int(math.Floor((1.0 - math.Log(math.Tan(lat*math.Pi/180.0)+1.0/math.Cos(lat*math.Pi/180.0))/math.Pi) / 2.0 * math.Pow(2, float64(zoom))))
}

func fetchWithRetry(url string, retries int, delay time.Duration) ([]byte, error) {
	for attempt := 1; attempt <= retries; attempt++ {
		resp, err := http.Get(url)
		if err == nil && resp.StatusCode == http.StatusOK {
			defer resp.Body.Close()
			return io.ReadAll(resp.Body)
		}
		if attempt == retries {
			return nil, fmt.Errorf("failed to fetch %s after %d attempts", url, retries)
		}
		time.Sleep(delay)
		delay *= 2
	}
	return nil, errors.New("unreachable code")
}

func startPMTilesServer() (*http.Server, int, error) {
	// If server is already running, return it
	if globalPMTilesServer != nil {
		return globalPMTilesServer, globalPMTilesPort, nil
	}

	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		return nil, -1, err
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()

	pmtilesServer, err := pmtiles.NewServerWithBucket(pmtiles.NewFileBucket(path.Join(paths.AppDataRoot(), "tiles")), "", log.New(io.Discard, "", log.LstdFlags), 128, "")
	if err != nil {
		return nil, -1, fmt.Errorf("failed to create PMTiles server: %w", err)
	}

	pmtilesServer.Start()

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if pmtilesServer != nil {
			pmtilesServer.ServeHTTP(w, r)
		}
	})

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: mux,
	}

	// Store globally so we can access it later
	globalPMTilesServer = srv
	globalPMTilesPort = port

	// Start server in background
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("PMTiles server error: %v\n", err)
		}
	}()

	// Give the server a moment to start listening
	time.Sleep(100 * time.Millisecond)

	return srv, port, nil
}

func GenerateThumbnail(cityCode string, cityConfig types.ConfigData) (string, error) {
	bboxToUse := cityConfig.ThumbnailBbox
	if bboxToUse == nil {
		bboxToUse = cityConfig.Bbox
	}
	if bboxToUse == nil {
		return "", errors.New("no bounding box found for city " + cityCode)
	}

	minXTile := lon2tile(bboxToUse[0], 12)
	maxXTile := lon2tile(bboxToUse[2], 12)
	maxYTile := lat2tile(bboxToUse[1], 12)
	minYTile := lat2tile(bboxToUse[3], 12)

	// Initialize projection with tile grid dimensions
	initializeProjection(minXTile, minYTile, maxXTile, maxYTile)

	_, port, err := startPMTilesServer()
	if err != nil {
		return "", fmt.Errorf("failed to start PMTiles server: %w", err)
	}

	// Create a map to store tiles with their coordinates
	type TileData struct {
		X, Y int
		Data []byte
	}
	var allTiles []TileData

	for x := minXTile; x <= maxXTile; x++ {
		for y := minYTile; y <= maxYTile; y++ {
			tileURL := fmt.Sprintf("http://127.0.0.1:%d/%s/12/%d/%d.mvt", port, cityCode, x, y)
			buffer, err := fetchWithRetry(tileURL, 5, 200*time.Millisecond)
			if err != nil {
				fmt.Printf("Error fetching tile: %v\n", err)
				continue
			}
			allTiles = append(allTiles, TileData{X: x, Y: y, Data: buffer})
		}
	}

	var svgBuffer bytes.Buffer
	svgCanvas := svg.New(&svgBuffer)
	svgCanvas.Start(800, 800)
	svgCanvas.Rect(0, 0, 800, 800, "fill:rgb(242,231,211)") // Background color

	for _, tile := range allTiles {
		// Parse MVT (Mapbox Vector Tile) binary data
		layers, err := mvt.Unmarshal(tile.Data)
		if err != nil {
			log.Printf("failed to parse tile data: %v\n", err)
			continue
		}

		// Find the water layer
		var waterLayer *mvt.Layer
		for _, layer := range layers {
			if layer.Name == "water" {
				waterLayer = layer
				break
			}
		}

		if waterLayer == nil {
			continue
		}

		// Process water features
		for _, feature := range waterLayer.Features {
			geometry := feature.Geometry

			switch g := geometry.(type) {
			case orb.Point:
				// Project coordinates and draw point as a small circle using path
				x, y := projectCoordinatesWithTile(tile.X, tile.Y, g.X(), g.Y())
				path := fmt.Sprintf("M %f,%f m -2, 0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", x, y)
				svgCanvas.Path(path, "fill:rgb(159,201,234)")
			case orb.LineString:
				if len(g) > 0 {
					x0, y0 := projectCoordinatesWithTile(tile.X, tile.Y, g[0].X(), g[0].Y())
					path := fmt.Sprintf("M %f %f", x0, y0)
					for _, pt := range g[1:] {
						x, y := projectCoordinatesWithTile(tile.X, tile.Y, pt.X(), pt.Y())
						path += fmt.Sprintf(" L %f %f", x, y)
					}
					svgCanvas.Path(path, "stroke:rgb(159,201,234);fill:none")
				}
			case orb.Polygon:
				for _, ring := range g {
					if len(ring) > 0 {
						x0, y0 := projectCoordinatesWithTile(tile.X, tile.Y, ring[0].X(), ring[0].Y())
						path := fmt.Sprintf("M %f %f", x0, y0)
						for _, pt := range ring[1:] {
							x, y := projectCoordinatesWithTile(tile.X, tile.Y, pt.X(), pt.Y())
							path += fmt.Sprintf(" L %f %f", x, y)
						}
						path += " Z"
						svgCanvas.Path(path, "fill:rgb(159,201,234);stroke:none")
					}
				}
			case orb.MultiPoint:
				for _, pt := range g {
					x, y := projectCoordinatesWithTile(tile.X, tile.Y, pt.X(), pt.Y())
					path := fmt.Sprintf("M %f,%f m -2, 0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", x, y)
					svgCanvas.Path(path, "fill:rgb(159,201,234)")
				}
			case orb.MultiLineString:
				for _, ls := range g {
					if len(ls) > 0 {
						x0, y0 := projectCoordinatesWithTile(tile.X, tile.Y, ls[0].X(), ls[0].Y())
						path := fmt.Sprintf("M %f %f", x0, y0)
						for _, pt := range ls[1:] {
							x, y := projectCoordinatesWithTile(tile.X, tile.Y, pt.X(), pt.Y())
							path += fmt.Sprintf(" L %f %f", x, y)
						}
						svgCanvas.Path(path, "stroke:rgb(159,201,234);fill:none")
					}
				}
			case orb.MultiPolygon:
				for _, polygon := range g {
					for _, ring := range polygon {
						if len(ring) > 0 {
							x0, y0 := projectCoordinatesWithTile(tile.X, tile.Y, ring[0].X(), ring[0].Y())
							path := fmt.Sprintf("M %f %f", x0, y0)
							for _, pt := range ring[1:] {
								x, y := projectCoordinatesWithTile(tile.X, tile.Y, pt.X(), pt.Y())
								path += fmt.Sprintf(" L %f %f", x, y)
							}
							path += " Z"
							svgCanvas.Path(path, "fill:rgb(159,201,234);stroke:none")
						}
					}
				}
			}
		}
	}

	svgCanvas.End()
	return svgBuffer.String(), nil
}

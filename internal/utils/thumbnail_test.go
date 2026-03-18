package utils

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"railyard/internal/testutil"
	"railyard/internal/types"
	"strings"
	"testing"
	"time"

	svg "github.com/ajstarks/svgo"
	"github.com/paulmach/orb"
	"github.com/stretchr/testify/require"
)

func TestNewProjectionAndProject(t *testing.T) {
	proj := newProjection(0, 0, 0, 0)
	require.InDelta(t, 800.0/4096.0, proj.scale, 1e-9)
	require.InDelta(t, 0.0, proj.offsetX, 1e-9)
	require.InDelta(t, 0.0, proj.offsetY, 1e-9)

	x, y := proj.project(0, 0, 4096, 4096)
	require.InDelta(t, 800.0, x, 1e-9)
	require.InDelta(t, 800.0, y, 1e-9)
}

func TestLonLatToTileAtZoomZero(t *testing.T) {
	require.Equal(t, 0, lon2tile(0, 0))
	require.Equal(t, 0, lat2tile(0, 0))
}

func TestBuildLineStringPath(t *testing.T) {
	proj := projection{scale: 1}
	path := buildLineStringPath(&proj, 0, 0, orb.LineString{
		orb.Point{1, 2},
		orb.Point{3, 4},
	})
	require.Equal(t, "M 1.000000 2.000000 L 3.000000 4.000000", path)
	require.Equal(t, "", buildLineStringPath(&proj, 0, 0, nil))
}

func TestBuildRingPath(t *testing.T) {
	proj := projection{scale: 1}
	path := buildRingPath(&proj, 0, 0, orb.Ring{
		orb.Point{0, 0},
		orb.Point{2, 0},
		orb.Point{2, 2},
	})
	require.True(t, strings.HasSuffix(path, " Z"))
	require.Equal(t, "", buildRingPath(&proj, 0, 0, nil))
}

func TestFetchWithRetrySuccessAfterRetries(t *testing.T) {
	var calls int
	server := testutil.NewLocalhostServer(t, http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		calls++
		if calls < 3 {
			w.WriteHeader(http.StatusBadGateway)
			_, _ = io.WriteString(w, "retry")
			return
		}
		_, _ = io.WriteString(w, "ok")
	}))
	defer server.Close()

	body, err := fetchWithRetry(server.URL, 3, time.Millisecond)
	require.NoError(t, err)
	require.Equal(t, []byte("ok"), body)
	require.Equal(t, 3, calls)
}

func TestFetchWithRetryFailure(t *testing.T) {
	server := testutil.NewLocalhostServer(t, http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusBadGateway)
		_, _ = io.WriteString(w, "nope")
	}))
	defer server.Close()

	_, err := fetchWithRetry(server.URL, 2, time.Millisecond)
	require.Error(t, err)
	require.Contains(t, err.Error(), "after 2 attempts")
}

func TestGenerateThumbnailErrorsWhenNoBoundsOrViewState(t *testing.T) {
	cityConfig := types.ConfigData{}

	_, err := GenerateThumbnail("TEST", cityConfig, 1234)
	require.Error(t, err)
	require.Contains(t, err.Error(), "no bounding box or initial view state")
}

func TestGenerateThumbnailReturnsSVGWhenTilesUnavailableOrInvalid(t *testing.T) {
	server := testutil.NewLocalhostServer(t, http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = io.WriteString(w, "not-a-valid-mvt")
	}))
	defer server.Close()

	u, err := url.Parse(server.URL)
	require.NoError(t, err)

	var port int
	_, scanErr := fmt.Sscanf(u.Host, "127.0.0.1:%d", &port)
	require.NoError(t, scanErr)

	bbox := [4]float64{0, 0, 0, 0}
	cityConfig := types.ConfigData{Bbox: &bbox}

	svgText, err := GenerateThumbnail("TEST", cityConfig, port)
	require.NoError(t, err)
	require.Contains(t, svgText, "<svg")
}

func TestRenderGeometryHandlesKnownTypes(t *testing.T) {
	var output strings.Builder
	canvas := svg.New(&output)
	canvas.Start(20, 20)
	proj := projection{scale: 1}

	renderGeometry(canvas, &proj, 0, 0, orb.Point{1, 1})
	renderGeometry(canvas, &proj, 0, 0, orb.LineString{orb.Point{0, 0}, orb.Point{1, 1}})
	renderGeometry(canvas, &proj, 0, 0, orb.Polygon{orb.Ring{orb.Point{0, 0}, orb.Point{1, 0}, orb.Point{1, 1}}})
	renderGeometry(canvas, &proj, 0, 0, orb.MultiPoint{orb.Point{2, 2}})
	renderGeometry(canvas, &proj, 0, 0, orb.MultiLineString{orb.LineString{orb.Point{0, 1}, orb.Point{1, 2}}})
	renderGeometry(canvas, &proj, 0, 0, orb.MultiPolygon{orb.Polygon{orb.Ring{orb.Point{0, 0}, orb.Point{1, 0}, orb.Point{1, 1}}}})

	canvas.End()
	require.Contains(t, output.String(), "<path")
}

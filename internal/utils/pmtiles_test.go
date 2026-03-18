package utils

import (
	"context"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestStartTempPMTilesServerStartsAndStops(t *testing.T) {
	srv, port, err := StartTempPMTilesServer()
	require.NoError(t, err)
	require.NotNil(t, srv)
	require.NotZero(t, port)

	client := &http.Client{Timeout: 2 * time.Second}
	resp, reqErr := client.Get("http://127.0.0.1:" + fmt.Sprintf("%d/", port))
	require.NoError(t, reqErr)
	_ = resp.Body.Close()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	require.NoError(t, srv.Shutdown(shutdownCtx))
}

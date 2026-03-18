package utils

import (
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"time"

	"railyard/internal/paths"

	"github.com/protomaps/go-pmtiles/pmtiles"
)

// StartTempPMTilesServer starts a temporary PMTiles server on a random port
// and returns the server and port. The caller is responsible for calling
// server.Close() when done.
func StartTempPMTilesServer() (*http.Server, int, error) {
	listener, err := net.Listen("tcp4", "127.0.0.1:0")
	if err != nil {
		return nil, 0, err
	}
	port := listener.Addr().(*net.TCPAddr).Port

	pmtilesServer, err := pmtiles.NewServerWithBucket(
		pmtiles.NewFileBucket(paths.TilesPath()),
		"",
		log.New(io.Discard, "", log.LstdFlags),
		128,
		"",
	)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create PMTiles server: %w", err)
	}

	pmtilesServer.Start()

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		pmtilesServer.ServeHTTP(w, r)
	})

	srv := &http.Server{
		Handler: mux,
	}

	go func() {
		if err := srv.Serve(listener); err != nil && err != http.ErrServerClosed {
			log.Printf("PMTiles server error: %v\n", err)
		}
	}()

	// Give the server a moment to start listening
	time.Sleep(100 * time.Millisecond)

	return srv, port, nil
}

package testutil

import (
	"net"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

// NewLocalhostServer binds explicitly to 127.0.0.1 to avoid firewall prompts
// that can occur when test listeners bind to broader interfaces.
func NewLocalhostServer(t *testing.T, handler http.Handler) *httptest.Server {
	t.Helper()

	server := httptest.NewUnstartedServer(handler)
	listener, err := net.Listen("tcp4", "127.0.0.1:0")
	require.NoError(t, err)

	server.Listener = listener
	server.Start()
	return server
}

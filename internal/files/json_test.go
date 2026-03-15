package files

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

type testPayload struct {
	Name string `json:"name"`
}

func writeTestJSON(t *testing.T, path, content string) {
	t.Helper()
	require.NoError(t, os.WriteFile(path, []byte(content), 0o644))
}

func TestReadJSONValid(t *testing.T) {
	path := filepath.Join(t.TempDir(), "valid.json")
	writeTestJSON(t, path, `{"name":"railyard"}`)

	value, err := ReadJSON[testPayload](path, "test payload", JSONReadOptions{})
	require.NoError(t, err)
	require.Equal(t, "railyard", value.Name)
}

func TestReadJSONMissingAllowedReturnsZero(t *testing.T) {
	path := filepath.Join(t.TempDir(), "missing.json")

	value, err := ReadJSON[testPayload](path, "app config", JSONReadOptions{AllowMissing: true})
	require.NoError(t, err)
	require.Equal(t, testPayload{}, value)
}

func TestReadJsonEmptyAllowedReturnsZero(t *testing.T) {
	path := filepath.Join(t.TempDir(), "empty.json")
	writeTestJSON(t, path, "\n")

	value, err := ReadJSON[testPayload](path, "app config", JSONReadOptions{AllowEmpty: true})
	require.NoError(t, err)
	require.Equal(t, testPayload{}, value)
}

func TestReadJSONErrorsOnMissing(t *testing.T) {
	path := filepath.Join(t.TempDir(), "missing.json")

	_, err := ReadJSON[testPayload](path, "mods index", JSONReadOptions{})
	require.Error(t, err)
	require.ErrorContains(t, err, "failed to read mods index")
}

func TestReadJSONErrorsOnEmptyJSON(t *testing.T) {
	path := filepath.Join(t.TempDir(), "empty.json")
	writeTestJSON(t, path, "   \n\t  ") // content with only whitespace should be considered empty

	_, err := ReadJSON[testPayload](path, "maps index", JSONReadOptions{})
	require.Error(t, err)
	require.ErrorContains(t, err, "failed to parse maps index")
}

func TestReadJSONErrorsOnInvalidJSON(t *testing.T) {
	path := filepath.Join(t.TempDir(), "invalid.json")
	writeTestJSON(t, path, `{"name":`) // malformed JSON

	_, err := ReadJSON[testPayload](path, "app config", JSONReadOptions{})
	require.Error(t, err)
	require.ErrorContains(t, err, "failed to parse app config")
}

func TestWriteJSONWritesValidFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config", "app.json")
	input := testPayload{Name: "written"}

	require.NoError(t, WriteJSON(path, "app config", input))

	output, err := ReadJSON[testPayload](path, "app config", JSONReadOptions{})
	require.NoError(t, err)
	require.Equal(t, input, output)
}

func TestWriteJSONErrorsOnUnserializableValue(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config", "bad.json")
	input := map[string]any{"bad": func() {}} // functions cannot be serialized to JSON

	err := WriteJSON(path, "app config", input)
	require.Error(t, err)
	require.ErrorContains(t, err, "failed to serialize app config")
}

func TestWriteJSONErrorsWhenTargetPathIsDirectory(t *testing.T) {
	path := t.TempDir()

	err := WriteJSON(path, "app config", testPayload{Name: "x"})
	require.Error(t, err)
	require.ErrorContains(t, err, "failed to write app config")
}

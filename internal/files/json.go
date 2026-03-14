package files

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type JSONReadOptions struct {
	AllowMissing bool
	AllowEmpty   bool
}

// ReadJSON reads a JSON file at path into defined struct type T.
// The label is used for annotating error messages.
// Options on file existence and file content can be set with JSONReadOptions.
func ReadJSON[T any](path string, label string, opts JSONReadOptions) (T, error) {
	var zero T
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) && opts.AllowMissing {
			return zero, nil
		}
		return zero, fmt.Errorf("failed to read %s %q: %w", label, path, err)
	}

	if len(bytes.TrimSpace(data)) == 0 {
		if opts.AllowEmpty {
			return zero, nil
		}
		return zero, fmt.Errorf("failed to parse %s %q: file is empty", label, path)
	}

	var decoded T
	if err := json.Unmarshal(data, &decoded); err != nil {
		return zero, fmt.Errorf("failed to parse %s %q: %w", label, path, err)
	}

	return decoded, nil
}

// ParseJSON parses JSON data into defined struct type T.
// The label is used for annotating error messages.
func ParseJSON[T any](data []byte, label string) (T, error) {
	var zero T
	if len(bytes.TrimSpace(data)) == 0 {
		return zero, fmt.Errorf("failed to parse %s: data is empty", label)
	}

	var decoded T
	if err := json.Unmarshal(data, &decoded); err != nil {
		return zero, fmt.Errorf("failed to parse %s: %w", label, err)
	}
	return decoded, nil
}

// WriteJSON formats the value to JSON and writes it to path.
// The label is used for annotating error messages.
func WriteJSON[T any](path string, label string, value T) error {
	// TODO: Make writes crash-safe/atomic (write temp file + fsync + rename).
	// Current direct os.WriteFile can leave truncated/corrupt JSON on abrupt shutdown.
	// We must ensure the directory exists before writing the file
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return fmt.Errorf("failed to create directory for %s %q: %w", label, path, err)
	}

	// Format the JSON with indentation for readability
	formatted, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize %s: %w", label, err)
	}

	if err := os.WriteFile(path, formatted, 0o644); err != nil {
		return fmt.Errorf("failed to write %s %q: %w", label, path, err)
	}

	return nil
}

package files

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type AtomicFileWrite struct {
	Path  string
	Label string
	Data  []byte
	Perm  os.FileMode
}

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
	if os.IsNotExist(err) {
		if recoverErr := recoverAtomicBackup(path, label); recoverErr != nil {
			return zero, recoverErr
		}
		data, err = os.ReadFile(path)
	}
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
	// Format the JSON with indentation for readability
	formatted, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize %s: %w", label, err)
	}

	if err := WriteFilesAtomically([]AtomicFileWrite{
		{
			Path:  path,
			Label: label,
			Data:  formatted,
			Perm:  0o644,
		},
	}); err != nil {
		return fmt.Errorf("failed to write %s %q: %w", label, path, err)
	}

	return nil
}

type preparedAtomicWrite struct {
	spec         AtomicFileWrite
	tempPath     string
	backupPath   string
	hadOriginal  bool
	committed    bool
	backupActive bool
}

// WriteFilesAtomically writes a batch of files to disk with best-effort all-or-nothing semantics.
// It writes each file to a temp file first, then commits with backup/rollback to avoid partial update on errors.
func WriteFilesAtomically(writes []AtomicFileWrite) error {
	if len(writes) == 0 {
		return nil
	}

	prepared := make([]preparedAtomicWrite, 0, len(writes))
	for _, write := range writes {
		if write.Path == "" {
			return fmt.Errorf("atomic write path cannot be empty for %q", write.Label)
		}
		if write.Perm == 0 {
			write.Perm = 0o644
		}
		if err := recoverAtomicBackup(write.Path, write.Label); err != nil {
			return err
		}

		dir := filepath.Dir(write.Path)
		if err := os.MkdirAll(dir, 0o755); err != nil {
			cleanupPrepared(prepared)
			return fmt.Errorf("failed to create directory for %s %q: %w", write.Label, write.Path, err)
		}

		tempFile, err := os.CreateTemp(dir, "."+filepath.Base(write.Path)+".tmp-*")
		if err != nil {
			cleanupPrepared(prepared)
			return fmt.Errorf("failed to create temp file for %s %q: %w", write.Label, write.Path, err)
		}

		if err := tempFile.Chmod(write.Perm); err != nil {
			_ = tempFile.Close()
			_ = os.Remove(tempFile.Name())
			cleanupPrepared(prepared)
			return fmt.Errorf("failed to set temp file mode for %s %q: %w", write.Label, write.Path, err)
		}

		if _, err := tempFile.Write(write.Data); err != nil {
			_ = tempFile.Close()
			_ = os.Remove(tempFile.Name())
			cleanupPrepared(prepared)
			return fmt.Errorf("failed to write temp data for %s %q: %w", write.Label, write.Path, err)
		}

		if err := tempFile.Sync(); err != nil {
			_ = tempFile.Close()
			_ = os.Remove(tempFile.Name())
			cleanupPrepared(prepared)
			return fmt.Errorf("failed to fsync temp data for %s %q: %w", write.Label, write.Path, err)
		}

		if err := tempFile.Close(); err != nil {
			_ = os.Remove(tempFile.Name())
			cleanupPrepared(prepared)
			return fmt.Errorf("failed to close temp file for %s %q: %w", write.Label, write.Path, err)
		}

		prepared = append(prepared, preparedAtomicWrite{
			spec:     write,
			tempPath: tempFile.Name(),
		})
	}

	for i := range prepared {
		if err := commitPreparedWrite(&prepared[i]); err != nil {
			rollbackPrepared(prepared[:i+1])
			cleanupPrepared(prepared)
			return err
		}
	}

	cleanupBackups(prepared)
	cleanupPrepared(prepared)
	return nil
}

func recoverAtomicBackup(path string, label string) error {
	backupPath := path + ".bak"
	_, targetErr := os.Stat(path)
	_, backupErr := os.Stat(backupPath)

	if os.IsNotExist(targetErr) && backupErr == nil {
		if err := os.Rename(backupPath, path); err != nil {
			return fmt.Errorf("failed to recover backup for %s %q: %w", label, path, err)
		}
		return nil
	}

	if targetErr == nil && backupErr == nil {
		_ = os.Remove(backupPath)
	}

	if targetErr != nil && !os.IsNotExist(targetErr) {
		return fmt.Errorf("failed to inspect %s %q for backup recovery: %w", label, path, targetErr)
	}
	if backupErr != nil && !os.IsNotExist(backupErr) {
		return fmt.Errorf("failed to inspect backup for %s %q: %w", label, path, backupErr)
	}
	return nil
}

func commitPreparedWrite(write *preparedAtomicWrite) error {
	if info, err := os.Stat(write.spec.Path); err == nil {
		if info.IsDir() {
			return fmt.Errorf("%s target %q is a directory", write.spec.Label, write.spec.Path)
		}
		write.hadOriginal = true
		write.backupPath = write.spec.Path + ".bak"
		_ = os.Remove(write.backupPath)
		if err := os.Rename(write.spec.Path, write.backupPath); err != nil {
			return fmt.Errorf("failed to backup %s %q: %w", write.spec.Label, write.spec.Path, err)
		}
		write.backupActive = true
	} else if !os.IsNotExist(err) {
		return fmt.Errorf("failed to inspect %s %q before commit: %w", write.spec.Label, write.spec.Path, err)
	}

	if err := os.Rename(write.tempPath, write.spec.Path); err != nil {
		if write.backupActive {
			_ = os.Rename(write.backupPath, write.spec.Path)
			write.backupActive = false
		}
		return fmt.Errorf("failed to replace %s %q atomically: %w", write.spec.Label, write.spec.Path, err)
	}

	write.committed = true
	return nil
}

func cleanupBackups(prepared []preparedAtomicWrite) {
	for _, write := range prepared {
		if !write.backupActive || write.backupPath == "" {
			continue
		}
		_ = os.Remove(write.backupPath)
	}
}

func rollbackPrepared(prepared []preparedAtomicWrite) {
	for i := len(prepared) - 1; i >= 0; i-- {
		write := prepared[i]
		if !write.committed {
			continue
		}

		if write.hadOriginal && write.backupPath != "" {
			_ = os.Remove(write.spec.Path)
			_ = os.Rename(write.backupPath, write.spec.Path)
			continue
		}

		_ = os.Remove(write.spec.Path)
	}
}

func cleanupPrepared(prepared []preparedAtomicWrite) {
	for _, write := range prepared {
		if write.tempPath != "" {
			_ = os.Remove(write.tempPath)
		}
		if write.backupActive && write.backupPath != "" {
			_ = os.Remove(write.backupPath)
		}
	}
}

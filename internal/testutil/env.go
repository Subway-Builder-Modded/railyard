package testutil

import "testing"

type Harness struct {
	T    *testing.T
	Root string
}

func SetEnv(t *testing.T) string {
	t.Helper()

	root := t.TempDir()
	t.Setenv("APPDATA", root)
	t.Setenv("LOCALAPPDATA", root)
	t.Setenv("ProgramFiles", root)
	t.Setenv("ProgramFiles(x86)", root)
	t.Setenv("XDG_CONFIG_HOME", root)
	t.Setenv("HOME", root)

	return root
}

func NewHarness(t *testing.T) *Harness {
	t.Helper()
	return &Harness{
		T:    t,
		Root: SetEnv(t),
	}
}

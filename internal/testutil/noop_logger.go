package testutil

type NoopLogger struct{}

func (NoopLogger) Info(string, ...any)         {}
func (NoopLogger) Warn(string, ...any)         {}
func (NoopLogger) Error(string, error, ...any) {}

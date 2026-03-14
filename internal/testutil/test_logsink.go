package testutil

type TestLogSink struct{}

func (TestLogSink) Info(string, ...any)         {}
func (TestLogSink) Warn(string, ...any)         {}
func (TestLogSink) Error(string, error, ...any) {}

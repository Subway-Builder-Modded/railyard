package requests

import (
	"errors"
	"fmt"
	"net/http"

	"railyard/internal/types"
)

type APISource = types.APIErrorSource

const (
	APISourceGitHub APISource = types.APIErrorSourceGitHub
	// TODO: Add other external sources as needed
)

type APIError struct {
	Source     APISource
	StatusCode int
	Subject    string
	Cause      error
}

func (e APIError) Error() string {
	if e.StatusCode > 0 {
		base := fmt.Sprintf("%s API returned status %d for %q", e.Source, e.StatusCode, e.Subject)
		if IsAuthStatus(e.StatusCode) {
			return fmt.Sprintf(
				"%s. Add a GitHub token: %s",
				base,
				types.GitHubTokenDocsURL,
			)
		}
		return base
	}

	if e.Cause != nil {
		return fmt.Sprintf("failed to fetch %s data for %q: %v", e.Source, e.Subject, e.Cause)
	}
	return fmt.Sprintf("%s API error for %q", e.Source, e.Subject)
}

func (e APIError) Unwrap() error {
	return e.Cause
}

func IsAuthStatus(statusCode int) bool {
	return statusCode == http.StatusUnauthorized || statusCode == http.StatusForbidden
}

func ResolveAPIError(err error) (types.APIErrorType, types.APIErrorSource, bool) {
	var apiErr APIError
	if errors.As(err, &apiErr) {
		if apiErr.StatusCode > 0 {
			if IsAuthStatus(apiErr.StatusCode) {
				return types.APIErrorTypeAuth, apiErr.Source, true
			}
			return types.APIErrorTypeStatus, apiErr.Source, true
		}
		if apiErr.Cause != nil {
			return types.APIErrorTypeFetch, apiErr.Source, true
		}
	}

	return "", "", false
}

package requests

import (
	"context"
	"errors"
	"net"
	"net/http"
	neturl "net/url"

	"railyard/internal/types"
)

type APISource = types.APIErrorSource
type APIError = types.APIError

const (
	APISourceGitHub APISource = types.APIErrorSourceGitHub
	// TODO: Add other external sources as needed
)

func IsAuthStatus(statusCode int) bool {
	return statusCode == http.StatusUnauthorized || statusCode == http.StatusForbidden
}

func classifyAPIStatus(statusCode int) types.APIErrorType {
	switch {
	case statusCode == http.StatusUnauthorized:
		return types.APIErrorTypeAuthInvalidToken
	case statusCode == http.StatusTooManyRequests:
		return types.APIErrorTypeRateLimited
	case statusCode == http.StatusForbidden:
		return types.APIErrorTypeForbidden
	case statusCode == http.StatusBadRequest:
		return types.APIErrorTypeBadRequest
	case statusCode == http.StatusNotFound:
		return types.APIErrorTypeNotFound
	case statusCode >= 500 && statusCode <= 599:
		return types.APIErrorTypeUpstream5xx
	default:
		return types.APIErrorTypeStatus
	}
}

func classifyAPICause(cause error) types.APIErrorType {
	if cause == nil {
		return ""
	}
	if errors.Is(cause, context.DeadlineExceeded) {
		return types.APIErrorTypeTimeout
	}

	var urlErr *neturl.Error
	if errors.As(cause, &urlErr) {
		if urlErr.Timeout() {
			return types.APIErrorTypeTimeout
		}
	}

	var netErr net.Error
	if errors.As(cause, &netErr) {
		if netErr.Timeout() {
			return types.APIErrorTypeTimeout
		}
		return types.APIErrorTypeNetwork
	}

	var opErr *net.OpError
	if errors.As(cause, &opErr) {
		return types.APIErrorTypeNetwork
	}

	var dnsErr *net.DNSError
	if errors.As(cause, &dnsErr) {
		return types.APIErrorTypeNetwork
	}

	return types.APIErrorTypeFetch
}

func toResponseAPIError(err APIError) (types.APIError, bool) {
	resolvedType := err.Type
	if resolvedType == "" {
		switch {
		case err.StatusCode > 0:
			resolvedType = classifyAPIStatus(err.StatusCode)
		case err.Cause != nil:
			resolvedType = classifyAPICause(err.Cause)
		}
	}
	if resolvedType == "" {
		return types.APIError{}, false
	}
	return types.APIError{
		Type:       resolvedType,
		Source:     err.Source,
		StatusCode: err.StatusCode,
		Subject:    err.Subject,
	}, true
}

func ResolveAPIError(err error) (*types.APIError, bool) {
	var apiErr APIError
	if errors.As(err, &apiErr) {
		responseError, ok := toResponseAPIError(apiErr)
		if ok {
			return &responseError, true
		}
	}

	return nil, false
}

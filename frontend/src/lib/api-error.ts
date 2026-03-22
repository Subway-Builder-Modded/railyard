import { GITHUB_TOKEN_DOCS_URL } from '@/lib/constants';

interface APIErrorLike {
  apiErrorType?: string;
  apiErrorSource?: string;
}

function isGitHubSource(source: string | undefined): boolean {
  return (source ?? '').toLowerCase() === 'github';
}

export function apiErrorMessage(error: APIErrorLike): string | null {
  if (!isGitHubSource(error.apiErrorSource)) {
    return null;
  }

  switch (error.apiErrorType) {
    case 'api_auth_error':
      return `GitHub API authentication/rate limit issue. Add a GitHub token: ${GITHUB_TOKEN_DOCS_URL}`;
    case 'api_fetch_error':
      return `Failed to fetch GitHub API data. Check your network connection and try again. If needed, add a GitHub token: ${GITHUB_TOKEN_DOCS_URL}`;
    case 'api_status_error':
      return `GitHub API request failed. Check your token/permissions and retry: ${GITHUB_TOKEN_DOCS_URL}`;
    default:
      return null;
  }
}

export function firstAPIErrorMessage(
  errors: unknown[] | undefined | null,
): string | null {
  for (const error of errors ?? []) {
    const candidate = toAPIErrorLike(error);
    const message = apiErrorMessage(candidate);
    if (message) {
      return message;
    }
  }
  return null;
}

function toAPIErrorLike(value: unknown): APIErrorLike {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const record = value as Record<string, unknown>;
  return {
    apiErrorType:
      typeof record.apiErrorType === 'string' ? record.apiErrorType : undefined,
    apiErrorSource:
      typeof record.apiErrorSource === 'string'
        ? record.apiErrorSource
        : undefined,
  };
}

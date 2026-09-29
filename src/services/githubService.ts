import { GitHubUser, GitHubRepo } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubServiceError extends Error {
  status?: number;
  isRateLimit?: boolean;

  constructor(message: string, status?: number, isRateLimit: boolean = false) {
    super(message);
    this.name = 'GitHubServiceError';
    this.status = status;
    this.isRateLimit = isRateLimit;
  }
}

/**
 * Parses user input to extract either username or owner+repo
 */
export function parseGitHubInput(input: string): { type: 'repo' | 'user'; owner: string; repo?: string } {
  const trimmed = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const parts = trimmed.split('/');

  if (parts.length >= 2) {
    return { type: 'repo', owner: parts[0], repo: parts[1] };
  }
  return { type: 'user', owner: parts[0] };
}

/**
 * Fetches GitHub user profile
 */
export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 403 || response.status === 429) {
    throw new GitHubServiceError(
      'GitHub API rate limit reached. Please wait a moment or try again later.',
      response.status,
      true
    );
  }

  if (response.status === 404) {
    throw new GitHubServiceError(`GitHub user "${username}" was not found. Please verify the username.`, 404);
  }

  if (!response.ok) {
    throw new GitHubServiceError(`GitHub API error (${response.status}): ${response.statusText}`, response.status);
  }

  return response.json();
}

/**
 * Fetches public repositories for a user
 */
export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12&type=owner`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (response.status === 403 || response.status === 429) {
    throw new GitHubServiceError(
      'GitHub API rate limit reached. Please wait a moment or try again later.',
      response.status,
      true
    );
  }

  if (!response.ok) {
    throw new GitHubServiceError(`Failed to fetch repositories for "${username}"`, response.status);
  }

  return response.json();
}

/**
 * Fetches a single public repository by owner and repo name
 */
export async function fetchSingleRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 403 || response.status === 429) {
    throw new GitHubServiceError(
      'GitHub API rate limit reached. Please wait a moment or try again later.',
      response.status,
      true
    );
  }

  if (response.status === 404) {
    throw new GitHubServiceError(`Repository "${owner}/${repo}" was not found or is private.`, 404);
  }

  if (!response.ok) {
    throw new GitHubServiceError(`Failed to fetch repository "${owner}/${repo}"`, response.status);
  }

  return response.json();
}

/**
 * Fetches languages breakdown for a repository
 */
export async function fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

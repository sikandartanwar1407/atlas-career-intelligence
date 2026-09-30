import base64
import hashlib
import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.evidence import (
    EvidenceCreateRequest,
    EvidenceItemSchema,
    GitHubAnalysisCreateRequest,
    GitHubAnalysisSchema,
)
from app.services.evidence_service import (
    _extract_single,
    _resolve_candidate_id,
    create_candidate_evidence,
)

logger = logging.getLogger("atlas.github_service")

GITHUB_API_BASE = "https://api.github.com"
GITHUB_API_VERSION = "2026-03-10"
USER_AGENT = "ATLAS-Career-Intelligence"
MAX_README_CHARS = 12000
MAX_REPOS_TO_ANALYZE = 20


def normalize_github_input(identifier: str) -> Tuple[str, str, Optional[str]]:
    """Normalizes and validates GitHub user or repository input.

    Accepts:
      - Username: USERNAME, https://github.com/USERNAME, http://github.com/USERNAME, github.com/USERNAME
      - Repo: OWNER/REPO, https://github.com/OWNER/REPO, http://github.com/OWNER/REPO, github.com/OWNER/REPO

    Returns:
      ("user", username, None) or ("repo", owner, repo)

    Raises:
      HTTPException(400) if the input is malformed or targets a non-GitHub domain.
    """
    if not identifier or not isinstance(identifier, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid GitHub username or repository identifier is required.",
        )

    cleaned = identifier.strip()

    # Reject empty string
    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub identifier cannot be blank.",
        )

    # Check for scheme/domain
    if cleaned.startswith(("http://", "https://")):
        parsed = urlparse(cleaned)
        netloc = (parsed.netloc or "").lower().split(":")[0]
        if netloc not in ("github.com", "www.github.com"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid domain '{netloc}'. Only public GitHub URLs (https://github.com/...) are supported.",
            )
        path = parsed.path
    else:
        # Check if there is an unknown scheme like 'ftp://' or 'gitlab.com'
        if "://" in cleaned:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid URL scheme. Only public GitHub URLs (https://github.com/...) are supported.",
            )
        # Strip leading github.com/ or www.github.com/
        if cleaned.lower().startswith("github.com/"):
            path = cleaned[len("github.com/"):]
        elif cleaned.lower().startswith("www.github.com/"):
            path = cleaned[len("www.github.com/"):]
        else:
            path = cleaned

    # Strip query params / hashes if any remained in non-URL format
    path = path.split("?")[0].split("#")[0].strip("/")

    segments = [s.strip() for s in path.split("/") if s.strip()]
    if not segments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub path is empty. Please provide a username or repository path.",
        )

    # Single segment: Username
    if len(segments) == 1:
        username = segments[0]
        # GitHub username regex: 1-39 chars, alphanumeric or single hyphens, cannot start/end with hyphen
        if not re.match(r"^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$", username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid GitHub username '{username}'. GitHub usernames may only contain alphanumeric characters or single hyphens.",
            )
        return ("user", username, None)

    # Two or more segments: Owner / Repo
    owner = segments[0]
    repo = segments[1]
    if repo.endswith(".git"):
        repo = repo[:-4]

    # Validate owner & repo names safely
    if not re.match(r"^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$", owner):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid GitHub repository owner '{owner}'.",
        )
    if not re.match(r"^[a-zA-Z0-9_.-]{1,100}$", repo):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid GitHub repository name '{repo}'.",
        )

    return ("repo", owner, repo)


def _get_github_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        "User-Agent": USER_AGENT,
    }
    github_token = os.getenv("GITHUB_TOKEN") or os.getenv("GITHUB_API_TOKEN")
    if github_token:
        headers["Authorization"] = f"Bearer {github_token.strip()}"
    return headers


def _execute_github_get(
    client: httpx.Client,
    endpoint: str,
    params: Optional[Dict[str, Any]] = None,
    allow_404: bool = False,
) -> Tuple[Optional[Any], Dict[str, Any]]:
    """Executes a single GET request against the GitHub REST API and parses rate-limit and status metadata."""
    url = f"{GITHUB_API_BASE}{endpoint}"
    headers = _get_github_headers()

    try:
        response = client.get(url, headers=headers, params=params, timeout=12.0)
    except httpx.TimeoutException as exc:
        logger.warning(f"GitHub API timeout requesting {endpoint}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Timeout while communicating with the GitHub API. Please try again later.",
        ) from exc
    except httpx.RequestError as exc:
        logger.error(f"GitHub API connection error requesting {endpoint}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to establish a connection to the GitHub REST API.",
        ) from exc

    # Capture rate limit headers
    rate_limit_meta = {
        "limit": response.headers.get("x-ratelimit-limit"),
        "remaining": response.headers.get("x-ratelimit-remaining"),
        "reset": response.headers.get("x-ratelimit-reset"),
        "used": response.headers.get("x-ratelimit-used"),
    }

    # Handle Rate Limits (403 or 429)
    if response.status_code in (403, 429):
        msg = "GitHub API rate limit reached."
        try:
            body = response.json()
            if isinstance(body, dict) and "message" in body:
                msg = f"GitHub API rate limit or access restriction: {body['message']}"
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"{msg} Please wait before requesting additional analyses.",
        )

    # Handle 404 Not Found
    if response.status_code == 404:
        if allow_404:
            return None, rate_limit_meta
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GitHub resource not found at '{endpoint}'. Please verify that the profile or repository is public and spelled correctly.",
        )

    # Handle 422 Unprocessable Entity
    if response.status_code == 422:
        try:
            err_data = response.json()
            err_msg = err_data.get("message", "GitHub validation error.")
        except Exception:
            err_msg = "GitHub validation error."
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"GitHub API validation error: {err_msg}",
        )

    # Handle 5xx Upstream Server Errors
    if response.status_code >= 500:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub REST API service is currently unavailable. Please try again later.",
        )

    # Non-200 unhandled errors
    if not response.is_success:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub API returned unexpected status code {response.status_code}.",
        )

    try:
        data = response.json()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to parse JSON response from GitHub API.",
        ) from exc

    return data, rate_limit_meta


def fetch_github_profile_data(username: str, client: httpx.Client) -> Dict[str, Any]:
    """Fetches user profile and public repositories from GitHub."""
    user_data, user_rl = _execute_github_get(client, f"/users/{username}")
    repos_raw, repos_rl = _execute_github_get(
        client,
        f"/users/{username}/repos",
        params={"per_page": 100, "sort": "updated"},
    )

    if not isinstance(repos_raw, list):
        repos_raw = []

    # Filter and normalize repositories (up to 20)
    cleaned_repos = []
    for r in repos_raw[:MAX_REPOS_TO_ANALYZE]:
        cleaned_repos.append({
            "name": r.get("name"),
            "full_name": r.get("full_name"),
            "html_url": r.get("html_url"),
            "description": r.get("description"),
            "language": r.get("language"),
            "languages_url": r.get("languages_url"),
            "stargazers_count": r.get("stargazers_count", 0),
            "forks_count": r.get("forks_count", 0),
            "fork": r.get("fork", False),
            "archived": r.get("archived", False),
            "default_branch": r.get("default_branch", "main"),
            "pushed_at": r.get("pushed_at"),
            "created_at": r.get("created_at"),
            "updated_at": r.get("updated_at"),
            "topics": r.get("topics", []),
        })

    # Fetch language breakdown for top 3 repos sequentially
    for repo in cleaned_repos[:3]:
        owner = username
        r_name = repo["name"]
        lang_data, _ = _execute_github_get(client, f"/repos/{owner}/{r_name}/languages", allow_404=True)
        repo["languages"] = lang_data if isinstance(lang_data, dict) else {}

    return {
        "username": user_data.get("login", username),
        "name": user_data.get("name"),
        "avatar_url": user_data.get("avatar_url"),
        "bio": user_data.get("bio"),
        "public_repos": user_data.get("public_repos", len(cleaned_repos)),
        "followers": user_data.get("followers", 0),
        "following": user_data.get("following", 0),
        "profile_url": user_data.get("html_url"),
        "repositories": cleaned_repos,
        "rate_limit": repos_rl or user_rl,
    }


def fetch_github_repository_data(owner: str, repo: str, client: httpx.Client) -> Dict[str, Any]:
    """Fetches a single repository, language distribution, README summary, and commit telemetry."""
    repo_data, repo_rl = _execute_github_get(client, f"/repos/{owner}/{repo}")
    languages_data, _ = _execute_github_get(client, f"/repos/{owner}/{repo}/languages", allow_404=True)
    readme_data, _ = _execute_github_get(client, f"/repos/{owner}/{repo}/readme", allow_404=True)
    commits_data, _ = _execute_github_get(
        client,
        f"/repos/{owner}/{repo}/commits",
        params={"per_page": 30},
        allow_404=True,
    )

    # Process README content with strict character limits
    readme_text = None
    readme_present = False
    if readme_data and isinstance(readme_data, dict):
        readme_present = True
        raw_content = readme_data.get("content", "")
        encoding = readme_data.get("encoding", "")
        if encoding == "base64" and raw_content:
            try:
                decoded = base64.b64decode(raw_content).decode("utf-8", errors="replace")
                readme_text = decoded[:MAX_README_CHARS]
            except Exception:
                readme_text = None
        elif isinstance(raw_content, str):
            readme_text = raw_content[:MAX_README_CHARS]

    # Process Commits
    recent_commit_count = 0
    recent_commit_dates = []
    if isinstance(commits_data, list):
        recent_commit_count = len(commits_data)
        for c in commits_data[:10]:
            commit_obj = c.get("commit", {})
            committer = commit_obj.get("committer", {}) or commit_obj.get("author", {})
            date_str = committer.get("date")
            if date_str:
                recent_commit_dates.append(date_str)

    # User profile data from repo owner
    owner_info = repo_data.get("owner", {})
    user_summary = {
        "username": owner_info.get("login", owner),
        "name": owner_info.get("login", owner),
        "avatar_url": owner_info.get("avatar_url"),
        "bio": None,
        "public_repos": 1,
        "followers": 0,
        "following": 0,
        "profile_url": owner_info.get("html_url") or f"https://github.com/{owner}",
    }

    normalized_repo = {
        "name": repo_data.get("name"),
        "full_name": repo_data.get("full_name"),
        "html_url": repo_data.get("html_url"),
        "description": repo_data.get("description"),
        "language": repo_data.get("language"),
        "languages_url": repo_data.get("languages_url"),
        "stargazers_count": repo_data.get("stargazers_count", 0),
        "forks_count": repo_data.get("forks_count", 0),
        "fork": repo_data.get("fork", False),
        "archived": repo_data.get("archived", False),
        "default_branch": repo_data.get("default_branch", "main"),
        "pushed_at": repo_data.get("pushed_at"),
        "created_at": repo_data.get("created_at"),
        "updated_at": repo_data.get("updated_at"),
        "topics": repo_data.get("topics", []),
        "languages": languages_data if isinstance(languages_data, dict) else {},
        "readme_present": readme_present,
        "readme_summary": readme_text[:1000] if readme_text else None,
        "recent_commit_count": recent_commit_count,
        "recent_commit_dates": recent_commit_dates,
    }

    return {
        **user_summary,
        "repositories": [normalized_repo],
        "rate_limit": repo_rl,
    }


def _derive_evidence_signals(
    user_payload: Dict[str, Any],
    repos: List[Dict[str, Any]],
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[str], List[str]]:
    """Derives factual evidence signals from observable GitHub metrics without claiming skill mastery.

    Returns:
      - primary_languages: List[{"name": str, "percentage": int, "bytes": int}]
      - extracted_evidence: List[Dict[str, Any]] (records for candidate_evidence)
      - detected_topics: List[str]
      - demonstrated_skills_detected: List[str] (observed technology signals)
    """
    language_bytes: Dict[str, int] = {}
    all_topics: Set[str] = set()
    observed_skills: Set[str] = set()

    for repo in repos:
        # Check direct language
        lang = repo.get("language")
        if lang:
            language_bytes[lang] = language_bytes.get(lang, 0) + 1
            observed_skills.add(lang)

        # Check languages map
        langs_map = repo.get("languages") or {}
        for l_name, b_count in langs_map.items():
            language_bytes[l_name] = language_bytes.get(l_name, 0) + int(b_count)
            observed_skills.add(l_name)

        # Topics
        for t in repo.get("topics", []):
            all_topics.add(str(t).lower())

    total_bytes = sum(language_bytes.values()) or 1
    primary_languages = [
        {
            "name": name,
            "bytes": bytes_count,
            "percentage": round((bytes_count / total_bytes) * 100),
        }
        for name, bytes_count in sorted(language_bytes.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    # Generate Evidence Locker Artifacts (Factual, observable records)
    extracted_evidence_records = []
    for repo in repos[:5]:
        full_name = repo.get("full_name") or repo.get("name")
        repo_lang = repo.get("language") or (list(repo.get("languages", {}).keys())[0] if repo.get("languages") else "Source Code")
        stars = repo.get("stargazers_count", 0)
        forks = repo.get("forks_count", 0)
        pushed_date = (repo.get("pushed_at") or repo.get("updated_at") or datetime.now(timezone.utc).isoformat())[:10]

        # Generate a deterministic SHA hash seed based on repo full name and push date
        hash_seed = f"{full_name}:{pushed_date}:{stars}"
        sha_digest = hashlib.sha256(hash_seed.encode("utf-8")).hexdigest()
        sha_hash_formatted = f"SHA-256: {sha_digest[:4]}...{sha_digest[-4:]}"

        # Factual observable metrics text
        metrics_text = f"{stars} stars · {forks} forks · Observed language: {repo_lang}"

        # Observable evidence description (factual, avoiding mastery claims)
        desc_parts = [f"Public GitHub repository '{full_name}'"]
        if repo.get("description"):
            desc_parts.append(f"— {repo['description']}")
        else:
            desc_parts.append(f"containing observable {repo_lang} implementation files.")
        if repo.get("readme_present"):
            desc_parts.append("Includes repository documentation/README.")
        if repo.get("recent_commit_count", 0) > 0:
            desc_parts.append(f"Contains {repo['recent_commit_count']} recent commits in active branch.")

        evidence_description = " ".join(desc_parts)

        # Factual evaluator feedback signal
        evaluator_note = (
            f"Observable repository evidence ingested from public GitHub telemetry ({full_name}). "
            f"Observed signals: {repo_lang} implementation, {stars} public stars, documented version control history."
        )

        title = repo.get("name", "GitHub Project").replace("-", " ").replace("_", " ").title()

        extracted_evidence_records.append({
            "title": f"{title} (GitHub)",
            "skill_name": repo_lang,
            "evidence_type": "GitHub Repository",
            "description": evidence_description,
            "link": repo.get("html_url") or f"https://github.com/{full_name}",
            "date": pushed_date,
            "verification_status": "Submitted",
            "metrics": metrics_text,
            "sha_hash": sha_hash_formatted,
            "evaluator_feedback": evaluator_note,
            "is_public": True,
        })

    return primary_languages, extracted_evidence_records, sorted(list(all_topics))[:10], sorted(list(observed_skills))[:10]


def analyze_and_store_github_evidence(
    user_id: str,
    identifier: str,
) -> Dict[str, Any]:
    """Orchestrates end-to-end GitHub REST API ingestion, database persistence, and evidence record creation."""
    # 1. Normalize and validate input
    input_type, owner, repo = normalize_github_input(identifier)

    # 2. Fetch public GitHub data via REST API
    with httpx.Client() as http_client:
        if input_type == "repo" and repo:
            raw_payload = fetch_github_repository_data(owner=owner, repo=repo, client=http_client)
        else:
            raw_payload = fetch_github_profile_data(username=owner, client=http_client)

    # 3. Derive factual evidence signals
    repos_list = raw_payload.get("repositories", [])
    primary_langs, evidence_items_data, detected_topics, observed_skills = _derive_evidence_signals(
        user_payload=raw_payload,
        repos=repos_list,
    )

    supabase = get_supabase_client()
    candidate_id = _resolve_candidate_id(supabase, user_id)

    # 4. Persist analysis into github_analyses
    github_analysis_row = {
        "candidate_id": str(candidate_id),
        "github_username": raw_payload.get("username", owner),
        "github_user_data": {
            "name": raw_payload.get("name"),
            "avatar_url": raw_payload.get("avatar_url"),
            "bio": raw_payload.get("bio"),
            "public_repos": raw_payload.get("public_repos", 0),
            "followers": raw_payload.get("followers", 0),
            "following": raw_payload.get("following", 0),
            "profile_url": raw_payload.get("profile_url"),
        },
        "analyzed_repos_count": len(repos_list),
        "primary_languages": primary_langs,
        "detected_topics": detected_topics,
        "demonstrated_skills_detected": observed_skills,
        "evidence_readiness_boost": min(len(evidence_items_data) * 6, 24),
        "extracted_evidence_count": len(evidence_items_data),
        "raw_analysis_payload": {
            "rate_limit": raw_payload.get("rate_limit", {}),
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "target_identifier": identifier,
            "input_type": input_type,
        },
    }

    try:
        res = supabase.table("github_analyses").insert(github_analysis_row).execute()
    except Exception as exc:
        logger.error(f"Failed to persist GitHub analysis: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while saving GitHub analysis record.",
        ) from exc

    saved_analysis = _extract_single(res.data) if res else None
    if not saved_analysis:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist GitHub analysis record.",
        )

    # 5. Persist extracted evidence items into candidate_evidence
    created_evidence_items: List[EvidenceItemSchema] = []
    for ev_dict in evidence_items_data:
        try:
            ev_req = EvidenceCreateRequest(**ev_dict)
            created_item = create_candidate_evidence(user_id=user_id, req=ev_req)
            created_evidence_items.append(created_item)
        except Exception as exc:
            logger.warning(f"Error persisting extracted evidence item for candidate: {exc}")

    return {
        "success": True,
        "analysis": GitHubAnalysisSchema(**saved_analysis),
        "evidence": created_evidence_items,
    }

from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.evidence import (
    EvidenceCreateRequest,
    EvidenceItemSchema,
    EvidenceListResponse,
    EvidenceUpdateRequest,
    GitHubAnalysisCreateRequest,
    GitHubAnalysisSchema,
)


def _resolve_candidate_id(supabase, user_id: str):
    try:
        profile_res = (
            supabase.table("candidate_profiles")
            .select("id")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while resolving candidate profile.",
        ) from exc

    if not profile_res or not profile_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found.",
        )

    return profile_res.data["id"]


def _extract_single(data):
    if not data:
        return None
    if isinstance(data, list):
        return data[0] if len(data) > 0 else None
    if isinstance(data, dict):
        return data if len(data) > 0 else None
    return data


def get_candidate_evidence_list(user_id: str) -> EvidenceListResponse:
    """Retrieves all evidence records for the authenticated candidate."""
    supabase = get_supabase_client()
    candidate_id = _resolve_candidate_id(supabase, user_id)

    try:
        res = (
            supabase.table("candidate_evidence")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while querying candidate evidence.",
        ) from exc

    raw_list = res.data if isinstance(res.data, list) else ([res.data] if res.data else [])
    items = [EvidenceItemSchema(**row) for row in raw_list]
    verified_count = sum(1 for item in items if item.verification_status == "Verified")
    under_review_count = sum(1 for item in items if item.verification_status == "Under Review")

    return EvidenceListResponse(
        candidate_id=candidate_id,
        total_count=len(items),
        verified_count=verified_count,
        under_review_count=under_review_count,
        items=items,
    )


def create_candidate_evidence(user_id: str, req: EvidenceCreateRequest) -> EvidenceItemSchema:
    """Creates a new evidence record for the authenticated candidate."""
    supabase = get_supabase_client()
    candidate_id = _resolve_candidate_id(supabase, user_id)

    record_date = req.date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    payload = {
        "candidate_id": str(candidate_id),
        "title": req.title,
        "skill_name": req.skill_name,
        "evidence_type": req.evidence_type,
        "description": req.description,
        "link": req.link,
        "date": record_date,
        "verification_status": req.verification_status or "Submitted",
        "metrics": req.metrics,
        "sha_hash": req.sha_hash,
        "evaluator_feedback": req.evaluator_feedback,
        "is_public": req.is_public if req.is_public is not None else True,
    }

    try:
        res = supabase.table("candidate_evidence").insert(payload).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while creating candidate evidence.",
        ) from exc

    row = _extract_single(res.data) if res else None
    if not row:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist evidence record.",
        )

    return EvidenceItemSchema(**row)


def get_candidate_evidence_item(user_id: str, evidence_id: str) -> EvidenceItemSchema:
    """Retrieves a single evidence item if it belongs to the authenticated candidate."""
    supabase = get_supabase_client()
    candidate_id = _resolve_candidate_id(supabase, user_id)

    try:
        res = (
            supabase.table("candidate_evidence")
            .select("*")
            .eq("id", evidence_id)
            .eq("candidate_id", candidate_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while querying evidence item.",
        ) from exc

    row = _extract_single(res.data) if res else None
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence record not found or does not belong to the candidate.",
        )

    return EvidenceItemSchema(**row)


def update_candidate_evidence_item(
    user_id: str,
    evidence_id: str,
    req: EvidenceUpdateRequest,
) -> EvidenceItemSchema:
    """Updates an existing evidence record if it belongs to the authenticated candidate."""
    supabase = get_supabase_client()
    candidate_id = _resolve_candidate_id(supabase, user_id)

    # 1. Verify existence and ownership
    try:
        check_res = (
            supabase.table("candidate_evidence")
            .select("id")
            .eq("id", evidence_id)
            .eq("candidate_id", candidate_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while checking evidence ownership.",
        ) from exc

    if not check_res or not check_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidence record not found or does not belong to the candidate.",
        )

    # 2. Build update payload with only provided non-null fields
    update_data = req.model_dump(exclude_unset=True)
    if not update_data:
        # Nothing to update, re-fetch and return current item
        return get_candidate_evidence_item(user_id=user_id, evidence_id=evidence_id)

    try:
        upd_res = (
            supabase.table("candidate_evidence")
            .update(update_data)
            .eq("id", evidence_id)
            .eq("candidate_id", candidate_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while updating evidence record.",
        ) from exc

    row = _extract_single(upd_res.data) if upd_res else None
    if not row:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update evidence record.",
        )

    return EvidenceItemSchema(**row)


def get_candidate_github_analysis(user_id: str) -> Optional[GitHubAnalysisSchema]:
    """Retrieves the latest GitHub analysis telemetry record for the authenticated candidate."""
    supabase = get_supabase_client()
    candidate_id = _resolve_candidate_id(supabase, user_id)

    try:
        res = (
            supabase.table("github_analyses")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching GitHub analysis telemetry.",
        ) from exc

    if not res or not res.data or len(res.data) == 0:
        return None

    return GitHubAnalysisSchema(**res.data[0])


def create_candidate_github_analysis(
    user_id: str,
    req: GitHubAnalysisCreateRequest,
) -> GitHubAnalysisSchema:
    """Associates a GitHub analysis telemetry record with the authenticated candidate."""
    supabase = get_supabase_client()
    candidate_id = _resolve_candidate_id(supabase, user_id)

    payload = {
        "candidate_id": str(candidate_id),
        "github_username": req.github_username,
        "github_user_data": req.github_user_data or {},
        "analyzed_repos_count": req.analyzed_repos_count or 0,
        "primary_languages": req.primary_languages or [],
        "detected_topics": req.detected_topics or [],
        "demonstrated_skills_detected": req.demonstrated_skills_detected or [],
        "evidence_readiness_boost": req.evidence_readiness_boost or 0,
        "extracted_evidence_count": req.extracted_evidence_count or 0,
        "raw_analysis_payload": req.raw_analysis_payload or {},
    }

    try:
        res = supabase.table("github_analyses").insert(payload).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while storing GitHub analysis telemetry.",
        ) from exc

    row = _extract_single(res.data) if res else None
    if not row:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist GitHub analysis record.",
        )

    return GitHubAnalysisSchema(**row)

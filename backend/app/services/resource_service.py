from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.resource import (
    ResourceStatusItem,
    ResourceStatusListResponse,
    ResourceStatusUpdateRequest,
)


def get_candidate_resource_statuses(user_id: str) -> ResourceStatusListResponse:
    """Retrieves all tracked learning resource statuses for the authenticated candidate."""
    supabase = get_supabase_client()

    # 1. Resolve candidate profile
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

    candidate_id = profile_res.data["id"]

    # 2. Fetch resource status records
    try:
        res = (
            supabase.table("candidate_resource_status")
            .select("*")
            .eq("candidate_id", candidate_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching candidate resource status.",
        ) from exc

    data = res.data or []
    items = [ResourceStatusItem(**r) for r in data]
    started_count = sum(1 for item in items if item.is_started)
    completed_count = sum(1 for item in items if item.is_completed)

    return ResourceStatusListResponse(
        candidate_id=candidate_id,
        total_tracked=len(items),
        started_count=started_count,
        completed_count=completed_count,
        resources=items,
    )


def update_candidate_resource_status(
    user_id: str,
    resource_id: str,
    req: Optional[ResourceStatusUpdateRequest] = None,
) -> ResourceStatusItem:
    """Updates or toggles the progress status of a learning resource for the authenticated candidate."""
    supabase = get_supabase_client()

    # 1. Resolve candidate profile
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

    candidate_id = profile_res.data["id"]

    # 2. Fetch current record if existing
    try:
        curr_res = (
            supabase.table("candidate_resource_status")
            .select("*")
            .eq("candidate_id", candidate_id)
            .eq("resource_id", resource_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while querying existing resource status.",
        ) from exc

    existing = curr_res.data if curr_res else None
    now_iso = datetime.now(timezone.utc).isoformat()

    if existing:
        current_started = existing.get("is_started", False)
        current_completed = existing.get("is_completed", False)
        started_at = existing.get("started_at")
        completed_at = existing.get("completed_at")
    else:
        current_started = False
        current_completed = False
        started_at = None
        completed_at = None

    # Determine new values
    if req is not None and (req.is_started is not None or req.is_completed is not None):
        new_started = req.is_started if req.is_started is not None else current_started
        new_completed = req.is_completed if req.is_completed is not None else current_completed
    else:
        # Default toggle behavior when empty body is sent
        new_started = not current_started
        new_completed = current_completed

    if new_started and not started_at:
        started_at = now_iso
    elif not new_started:
        started_at = None

    if new_completed and not completed_at:
        completed_at = now_iso
    elif not new_completed:
        completed_at = None

    payload = {
        "candidate_id": str(candidate_id),
        "resource_id": resource_id,
        "is_started": new_started,
        "is_completed": new_completed,
        "started_at": started_at,
        "completed_at": completed_at,
    }

    try:
        upd_res = (
            supabase.table("candidate_resource_status")
            .upsert(payload, on_conflict="candidate_id,resource_id")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while updating resource status.",
        ) from exc

    if not upd_res or not upd_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist resource status update.",
        )

    return ResourceStatusItem(**upd_res.data[0])

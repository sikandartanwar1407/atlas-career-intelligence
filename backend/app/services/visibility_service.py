from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.visibility import (
    DiscoverableCandidatePublicItem,
    DiscoveryStatusResponse,
    VisibilitySettingsItem,
    VisibilityUpdateRequest,
)


def _resolve_candidate_profile(supabase, user_id: str) -> Dict[str, Any]:
    try:
        profile_res = (
            supabase.table("candidate_profiles")
            .select("id, full_name, college, degree, year, experience_level, target_role, has_completed_setup")
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

    return profile_res.data


def get_candidate_visibility_settings(user_id: str) -> VisibilitySettingsItem:
    """Retrieves the candidate's visibility and consent preferences.

    If not yet persisted, returns default settings (all preferences enabled).
    """
    supabase = get_supabase_client()
    profile = _resolve_candidate_profile(supabase, user_id)
    candidate_id = profile["id"]

    try:
        res = (
            supabase.table("candidate_visibility_settings")
            .select("*")
            .eq("candidate_id", candidate_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while querying candidate visibility settings.",
        ) from exc

    if res and res.data and isinstance(res.data, dict) and len(res.data) > 0:
        return VisibilitySettingsItem(**res.data)

    # Default fallback preferences
    return VisibilitySettingsItem(
        candidate_id=candidate_id,
        allow_discover=True,
        allow_contact=True,
        show_portfolio_evidence=True,
        show_skill_info=True,
    )


def update_candidate_visibility_settings(
    user_id: str,
    req: VisibilityUpdateRequest,
) -> VisibilitySettingsItem:
    """Updates the candidate's visibility and consent preferences.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    supabase = get_supabase_client()
    profile = _resolve_candidate_profile(supabase, user_id)
    candidate_id = profile["id"]

    # 1. Fetch current settings or defaults
    current = get_candidate_visibility_settings(user_id=user_id)

    # 2. Derive updated values
    updated_allow_discover = (
        req.allow_discover if req.allow_discover is not None else current.allow_discover
    )
    updated_allow_contact = (
        req.allow_contact if req.allow_contact is not None else current.allow_contact
    )
    updated_show_portfolio_evidence = (
        req.show_portfolio_evidence
        if req.show_portfolio_evidence is not None
        else current.show_portfolio_evidence
    )
    updated_show_skill_info = (
        req.show_skill_info if req.show_skill_info is not None else current.show_skill_info
    )

    payload = {
        "candidate_id": str(candidate_id),
        "allow_discover": updated_allow_discover,
        "allow_contact": updated_allow_contact,
        "show_portfolio_evidence": updated_show_portfolio_evidence,
        "show_skill_info": updated_show_skill_info,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        upd_res = (
            supabase.table("candidate_visibility_settings")
            .upsert(payload, on_conflict="candidate_id")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while saving candidate visibility settings.",
        ) from exc

    if not upd_res or not upd_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist visibility settings.",
        )

    row = upd_res.data[0] if isinstance(upd_res.data, list) else upd_res.data
    return VisibilitySettingsItem(**row)


def get_candidate_discovery_status(user_id: str) -> DiscoveryStatusResponse:
    """Returns the candidate's discoverability status, contact permissions, and setup status."""
    supabase = get_supabase_client()
    profile = _resolve_candidate_profile(supabase, user_id)
    candidate_id = profile["id"]
    target_role = profile.get("target_role") or "Not Set"
    profile_complete = profile.get("has_completed_setup", False)

    settings = get_candidate_visibility_settings(user_id=user_id)

    # Discovery requires both consent flag AND completed setup
    is_discoverable = settings.allow_discover and profile_complete

    if is_discoverable:
        status_message = f"Discoverable to prospective employers for {target_role} opportunities."
    elif not profile_complete:
        status_message = "Discoverability inactive. Complete profile setup to enable employer discovery."
    else:
        status_message = "Employer discoverability paused by candidate preference."

    return DiscoveryStatusResponse(
        candidate_id=candidate_id,
        is_discoverable=is_discoverable,
        allow_contact=settings.allow_contact,
        show_portfolio_evidence=settings.show_portfolio_evidence,
        show_skill_info=settings.show_skill_info,
        profile_complete=profile_complete,
        target_role=target_role,
        status_message=status_message,
    )


def get_discoverable_candidates(
    target_role: Optional[str] = None,
) -> List[DiscoverableCandidatePublicItem]:
    """Reusable service function for the employer matching system.

    Returns only candidates who have employer discovery enabled,
    sanitizing all private account/authentication fields.
    """
    supabase = get_supabase_client()

    try:
        # Fetch profiles with completed setup
        query = (
            supabase.table("candidate_profiles")
            .select("id, full_name, college, degree, year, experience_level, target_role, has_completed_setup")
            .eq("has_completed_setup", True)
        )
        if target_role:
            query = query.eq("target_role", target_role)

        profiles_res = query.execute()
        profiles = profiles_res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error querying discoverable candidate profiles.",
        ) from exc

    if not profiles:
        return []

    candidate_ids = [str(p["id"]) for p in profiles]

    # Fetch visibility settings for these candidates
    visibility_map: Dict[str, Dict[str, Any]] = {}
    try:
        vis_res = (
            supabase.table("candidate_visibility_settings")
            .select("*")
            .in_("candidate_id", candidate_ids)
            .execute()
        )
        for v in (vis_res.data or []):
            visibility_map[str(v["candidate_id"])] = v
    except Exception as exc:
        print(f"[VisibilityService] Warning fetching visibility preferences: {exc}")

    # Fetch demonstrated skills and evidence counts
    skills_map: Dict[str, List[str]] = {}
    evidence_count_map: Dict[str, int] = {}
    try:
        diag_res = (
            supabase.table("candidate_skill_diagnostics")
            .select("candidate_id, skill_name, demonstrated_score")
            .in_("candidate_id", candidate_ids)
            .execute()
        )
        for d in (diag_res.data or []):
            c_id = str(d["candidate_id"])
            if d.get("demonstrated_score", 0) >= 60:
                if c_id not in skills_map:
                    skills_map[c_id] = []
                skills_map[c_id].append(d["skill_name"])

        ev_res = (
            supabase.table("candidate_evidence")
            .select("candidate_id")
            .in_("candidate_id", candidate_ids)
            .execute()
        )
        for e in (ev_res.data or []):
            c_id = str(e["candidate_id"])
            evidence_count_map[c_id] = evidence_count_map.get(c_id, 0) + 1
    except Exception as exc:
        print(f"[VisibilityService] Warning fetching public skills/evidence telemetry: {exc}")

    discoverable: List[DiscoverableCandidatePublicItem] = []

    for p in profiles:
        c_id = str(p["id"])
        vis = visibility_map.get(c_id, {})
        # Default allow_discover is True if not explicitly turned off
        allow_discover = vis.get("allow_discover", True)
        if not allow_discover:
            continue

        allow_contact = vis.get("allow_contact", True)
        show_portfolio_evidence = vis.get("show_portfolio_evidence", True)
        show_skill_info = vis.get("show_skill_info", True)

        public_item = DiscoverableCandidatePublicItem(
            candidate_id=p["id"],
            full_name=p.get("full_name") or "Anonymous Candidate",
            college=p.get("college") or "",
            degree=p.get("degree") or "",
            year=p.get("year") or "",
            experience_level=p.get("experience_level") or "Entry",
            target_role=p.get("target_role") or "Undecided",
            allow_contact=allow_contact,
            show_portfolio_evidence=show_portfolio_evidence,
            show_skill_info=show_skill_info,
            demonstrated_skills=skills_map.get(c_id, []) if show_skill_info else [],
            evidence_count=evidence_count_map.get(c_id, 0) if show_portfolio_evidence else 0,
        )
        discoverable.append(public_item)

    return discoverable

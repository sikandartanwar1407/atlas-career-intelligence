from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.reassessment import (
    ReassessmentHistoryResponse,
    ReassessmentItem,
    ReassessmentResponse,
    ReassessmentSubmitRequest,
)
from app.services import roadmap_service


def _resolve_candidate_profile(supabase, user_id: str) -> Dict[str, Any]:
    try:
        profile_res = (
            supabase.table("candidate_profiles")
            .select("id, target_role, availability_hours_per_week")
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


def submit_reassessment(
    user_id: str,
    req: ReassessmentSubmitRequest,
) -> ReassessmentResponse:
    """Evaluates reassessment skill ratings, updates diagnostics and evidence telemetry,

    persists longitudinal history to candidate_reassessments, and regenerates the roadmap.
    """
    supabase = get_supabase_client()
    profile = _resolve_candidate_profile(supabase, user_id)
    candidate_id = profile["id"]

    # 1. Validate rating values (0-100)
    for skill, val in req.skill_ratings.items():
        if not (0 <= val <= 100):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Rating score for '{skill}' must be an integer between 0 and 100.",
            )

    # 2. Fetch existing diagnostics
    try:
        diag_res = (
            supabase.table("candidate_skill_diagnostics")
            .select("*")
            .eq("candidate_id", candidate_id)
            .execute()
        )
        existing_diags = {r["skill_name"]: r for r in (diag_res.data or [])}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while retrieving existing skill diagnostics.",
        ) from exc

    # Derive previous overall score
    if existing_diags:
        prev_scores = [d.get("demonstrated_score", 50) for d in existing_diags.values()]
        previous_overall_score = round(sum(prev_scores) / max(len(prev_scores), 1))
    else:
        previous_overall_score = 50

    # 3. Calculate current overall score & skill deltas
    curr_scores = list(req.skill_ratings.values())
    current_overall_score = round(sum(curr_scores) / max(len(curr_scores), 1))
    improvement = current_overall_score - previous_overall_score

    skill_deltas: Dict[str, Any] = {}
    for skill_name, curr_val in req.skill_ratings.items():
        prev_d = existing_diags.get(skill_name)
        prev_val = prev_d.get("demonstrated_score", 50) if prev_d else 50
        change = curr_val - prev_val
        skill_deltas[skill_name] = {
            "previous": prev_val,
            "current": curr_val,
            "change": change,
        }

    # 4. Fetch candidate evidence records to calibrate evidence_status
    evidence_by_skill: Dict[str, List[str]] = {}
    try:
        ev_res = (
            supabase.table("candidate_evidence")
            .select("skill_name, verification_status")
            .eq("candidate_id", candidate_id)
            .execute()
        )
        if ev_res and ev_res.data:
            for ev in ev_res.data:
                s_k = ev["skill_name"]
                if s_k not in evidence_by_skill:
                    evidence_by_skill[s_k] = []
                evidence_by_skill[s_k].append(ev.get("verification_status", "Submitted"))
    except Exception as exc:
        print(f"[ReassessmentService] Warning querying evidence records: {exc}")

    # 5. Build and upsert updated candidate_skill_diagnostics
    now_iso = datetime.now(timezone.utc).isoformat()
    updated_diagnostics_to_upsert: List[Dict[str, Any]] = []

    for skill_name, curr_val in req.skill_ratings.items():
        existing = existing_diags.get(skill_name, {})
        role_threshold = existing.get("role_threshold", 80)
        baseline_score = existing.get("baseline_score", 50)
        display_name = existing.get("display_name", skill_name)
        gap = max(role_threshold - curr_val, 0)

        # Priority calculation
        if gap >= 25:
            priority_level = "HIGH PRIORITY"
        elif gap >= 10:
            priority_level = "MEDIUM PRIORITY"
        else:
            priority_level = "LOW PRIORITY"

        # Evidence status calibration
        skill_evidence = evidence_by_skill.get(skill_name, [])
        if "Verified" in skill_evidence:
            evidence_status = "Strong"
        elif "Under Review" in skill_evidence or "Submitted" in skill_evidence:
            evidence_status = "Moderate" if curr_val >= 60 else "Unverified"
        elif curr_val >= role_threshold:
            evidence_status = "Moderate"
        else:
            evidence_status = "Missing"

        description = (
            f"Demonstrated competency in {skill_name} calibrated at {curr_val}% "
            f"(threshold: {role_threshold}%)."
        )
        strategic_note = (
            f"Sprint velocity prioritized for {skill_name} with deficit of {gap} points."
            if gap > 0
            else f"Competency threshold met for {skill_name}. Focus on evidence defense."
        )

        diag_record = {
            "candidate_id": str(candidate_id),
            "skill_name": skill_name,
            "display_name": display_name,
            "baseline_score": baseline_score,
            "demonstrated_score": curr_val,
            "role_threshold": role_threshold,
            "gap": gap,
            "priority_level": priority_level,
            "evidence_status": evidence_status,
            "description": description,
            "strategic_note": strategic_note,
            "calculated_at": now_iso,
        }
        updated_diagnostics_to_upsert.append(diag_record)

    try:
        if updated_diagnostics_to_upsert:
            supabase.table("candidate_skill_diagnostics").upsert(
                updated_diagnostics_to_upsert,
                on_conflict="candidate_id,skill_name",
            ).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while updating skill diagnostics.",
        ) from exc

    # 6. Insert reassessment record into candidate_reassessments
    reassessment_payload = {
        "candidate_id": str(candidate_id),
        "previous_overall_score": previous_overall_score,
        "current_overall_score": current_overall_score,
        "improvement": improvement,
        "skill_deltas": skill_deltas,
    }

    try:
        reassess_res = (
            supabase.table("candidate_reassessments")
            .insert(reassessment_payload)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while saving reassessment history.",
        ) from exc

    if not reassess_res or not reassess_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist reassessment record.",
        )

    saved_row = reassess_res.data[0] if isinstance(reassess_res.data, list) else reassess_res.data

    # 7. Adapt roadmap dynamically from updated skill gaps
    roadmap_regenerated = True
    try:
        roadmap_service.generate_candidate_roadmap(user_id=user_id)
    except Exception as exc:
        print(f"[ReassessmentService] Warning adapting roadmap: {exc}")
        roadmap_regenerated = False

    return ReassessmentResponse(
        id=saved_row["id"],
        candidate_id=saved_row["candidate_id"],
        previous_overall_score=saved_row["previous_overall_score"],
        current_overall_score=saved_row["current_overall_score"],
        improvement=saved_row["improvement"],
        skill_deltas=saved_row["skill_deltas"],
        created_at=saved_row.get("created_at") or now_iso,
        skills_reassessed_count=len(req.skill_ratings),
        roadmap_regenerated=roadmap_regenerated,
    )


def get_reassessment_history(user_id: str) -> ReassessmentHistoryResponse:
    """Retrieves all longitudinal reassessment records for the authenticated candidate in chronological order."""
    supabase = get_supabase_client()
    profile = _resolve_candidate_profile(supabase, user_id)
    candidate_id = profile["id"]

    try:
        res = (
            supabase.table("candidate_reassessments")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("created_at", desc=False)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching reassessment history.",
        ) from exc

    data = res.data or []
    items = [ReassessmentItem(**r) for r in data]
    cumulative_improvement = sum(item.improvement for item in items)

    return ReassessmentHistoryResponse(
        candidate_id=candidate_id,
        total_reassessments=len(items),
        cumulative_improvement=cumulative_improvement,
        history=items,
    )


def get_latest_reassessment(user_id: str) -> ReassessmentItem:
    """Retrieves the candidate's latest reassessment item, or returns 404 if none exist."""
    supabase = get_supabase_client()
    profile = _resolve_candidate_profile(supabase, user_id)
    candidate_id = profile["id"]

    try:
        res = (
            supabase.table("candidate_reassessments")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching latest reassessment.",
        ) from exc

    if not res or not res.data or len(res.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reassessment history found for this candidate.",
        )

    row = res.data[0] if isinstance(res.data, list) else res.data
    return ReassessmentItem(**row)

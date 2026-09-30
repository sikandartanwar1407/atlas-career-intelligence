from typing import Any, Dict, List
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.diagnosis import DiagnosisResponse, DiagnosisSkillItem


def get_latest_diagnosis(user_id: str) -> DiagnosisResponse:
    """Retrieves the latest structured skill diagnosis for the authenticated candidate."""
    supabase = get_supabase_client()

    # 1. Resolve candidate profile
    try:
        profile_res = (
            supabase.table("candidate_profiles")
            .select("id, target_role")
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
    target_role = profile_res.data.get("target_role") or "Data Analyst"

    # 2. Fetch diagnostics
    try:
        diag_res = (
            supabase.table("candidate_skill_diagnostics")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("gap", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while retrieving skill diagnostics.",
        ) from exc

    if not diag_res or not diag_res.data or len(diag_res.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No skill diagnostics found for this candidate. Please complete an assessment first.",
        )

    diagnostics = [DiagnosisSkillItem(**row) for row in diag_res.data]
    total_skills = len(diagnostics)
    career_readiness = (
        round(sum(d.demonstrated_score for d in diagnostics) / total_skills)
        if total_skills > 0
        else 0
    )
    largest_gap_skill = diagnostics[0].skill_name
    largest_gap = diagnostics[0].gap
    high_priority_gaps = sum(1 for d in diagnostics if d.priority_level == "HIGH PRIORITY")

    return DiagnosisResponse(
        candidate_id=candidate_id,
        target_role=target_role,
        career_readiness=career_readiness,
        largest_gap_skill=largest_gap_skill,
        largest_gap=largest_gap,
        total_skills=total_skills,
        high_priority_gaps=high_priority_gaps,
        diagnostics=diagnostics,
    )

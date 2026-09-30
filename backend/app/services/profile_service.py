from typing import Any, Dict
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.profile import ProfileCreate


def get_profile_service_status() -> Dict[str, str]:
    """Placeholder function for testing profile service readiness."""
    return {
        "status": "ok",
        "message": "Profile API is ready",
    }


def create_or_update_profile(user_id: str, profile_data: ProfileCreate) -> Dict[str, Any]:
    """Upserts a candidate profile for the authenticated user_id.

    The user_id is strictly derived from the validated JWT and cannot be overridden by request payload.
    """
    supabase = get_supabase_client()
    payload = {
        "user_id": user_id,
        "full_name": profile_data.full_name,
        "email": str(profile_data.email),
        "college": profile_data.college,
        "degree": profile_data.degree,
        "year": profile_data.year,
        "experience_level": profile_data.experience_level,
        "target_role": profile_data.target_role,
        "custom_role": profile_data.custom_role,
        "availability_hours_per_week": profile_data.availability_hours_per_week,
        "has_completed_setup": profile_data.has_completed_setup,
    }

    try:
        response = (
            supabase.table("candidate_profiles")
            .upsert(payload, on_conflict="user_id")
            .execute()
        )
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save candidate profile.",
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while saving candidate profile.",
        ) from exc


def get_profile(user_id: str) -> Dict[str, Any]:
    """Retrieves the candidate profile belonging to the authenticated user_id.

    Raises HTTP 404 if no profile exists for this user.
    """
    supabase = get_supabase_client()
    try:
        response = (
            supabase.table("candidate_profiles")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate profile not found.",
            )
        return response.data
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while retrieving candidate profile.",
        ) from exc

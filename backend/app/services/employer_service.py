from datetime import datetime, timezone
from typing import Any, Dict
from uuid import UUID
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.employer import (
    EmployerProfileCreate,
    EmployerProfileResponse,
    EmployerProfileUpdate,
)


def resolve_employer_profile(supabase, user_id: str) -> Dict[str, Any]:
    """Helper to retrieve the employer profile dict for the authenticated user_id.

    Raises 404 if not found.
    """
    try:
        res = (
            supabase.table("employer_profiles")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while resolving employer profile.",
        ) from exc

    if not res or not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found. Please complete employer onboarding first.",
        )

    return res.data


def get_employer_profile(user_id: str) -> EmployerProfileResponse:
    """Retrieves the authenticated employer's profile."""
    supabase = get_supabase_client()
    data = resolve_employer_profile(supabase, user_id)
    return EmployerProfileResponse(**data)


def create_employer_profile(
    user_id: str, req: EmployerProfileCreate
) -> EmployerProfileResponse:
    """Creates a new employer profile for the authenticated user.

    If a profile already exists for this user_id, raises 400.
    """
    supabase = get_supabase_client()

    # Check for existing profile
    try:
        existing = (
            supabase.table("employer_profiles")
            .select("id")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if existing and existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employer profile already exists for this account.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error checking existing employer profile.",
        ) from exc

    logo_text = req.company_logo_text
    if not logo_text and req.company_name:
        parts = req.company_name.strip().split()
        logo_text = "".join([p[0].upper() for p in parts[:2]])

    payload = {
        "user_id": user_id,
        "company_name": req.company_name.strip(),
        "company_website": req.company_website.strip(),
        "company_email": req.company_email.strip(),
        "industry": req.industry.strip(),
        "company_size": req.company_size.strip(),
        "company_location": req.company_location.strip(),
        "company_description": req.company_description.strip(),
        "company_logo_text": logo_text,
        "verification_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        insert_res = supabase.table("employer_profiles").insert(payload).execute()
        if not insert_res or not insert_res.data:
            # Fallback re-fetch
            data = resolve_employer_profile(supabase, user_id)
            return EmployerProfileResponse(**data)
        return EmployerProfileResponse(**insert_res.data[0])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create employer profile: {str(exc)}",
        ) from exc


def update_employer_profile(
    user_id: str, req: EmployerProfileUpdate
) -> EmployerProfileResponse:
    """Updates only the fields provided in the request for the authenticated employer."""
    supabase = get_supabase_client()
    profile = resolve_employer_profile(supabase, user_id)
    employer_id = profile["id"]

    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if req.company_name is not None:
        updates["company_name"] = req.company_name.strip()
    if req.company_website is not None:
        updates["company_website"] = req.company_website.strip()
    if req.company_email is not None:
        updates["company_email"] = req.company_email.strip()
    if req.industry is not None:
        updates["industry"] = req.industry.strip()
    if req.company_size is not None:
        updates["company_size"] = req.company_size.strip()
    if req.company_location is not None:
        updates["company_location"] = req.company_location.strip()
    if req.company_description is not None:
        updates["company_description"] = req.company_description.strip()
    if req.company_logo_text is not None:
        updates["company_logo_text"] = req.company_logo_text.strip()

    try:
        update_res = (
            supabase.table("employer_profiles")
            .update(updates)
            .eq("id", employer_id)
            .execute()
        )
        if not update_res or not update_res.data:
            data = resolve_employer_profile(supabase, user_id)
            return EmployerProfileResponse(**data)
        return EmployerProfileResponse(**update_res.data[0])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update employer profile: {str(exc)}",
        ) from exc

from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileTestResponse
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["Profiles"])


@router.get("/test", response_model=ProfileTestResponse, summary="Profile API Test Endpoint")
def test_profile_endpoint():
    """Temporary development endpoint for verifying profile API readiness."""
    return profile_service.get_profile_service_status()


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Create or Update Candidate Profile",
)
def create_or_update_candidate_profile(
    profile_data: ProfileCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Creates or updates the authenticated candidate's profile.

    The user identity is extracted strictly from the validated Bearer token.
    """
    return profile_service.create_or_update_profile(user_id=user_id, profile_data=profile_data)


@router.get(
    "",
    response_model=ProfileResponse,
    summary="Get Candidate Profile",
)
def get_candidate_profile(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the candidate profile belonging to the authenticated user.

    Returns 404 if no candidate profile has been created yet.
    """
    return profile_service.get_profile(user_id=user_id)

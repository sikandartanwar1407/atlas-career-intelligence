from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.employer import (
    EmployerProfileCreate,
    EmployerProfileResponse,
    EmployerProfileUpdate,
)
from app.services import employer_service

router = APIRouter(prefix="/employer", tags=["Employer Profile"])


@router.get(
    "/profile",
    response_model=EmployerProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Authenticated Employer Profile",
)
def get_profile(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the profile of the authenticated employer."""
    return employer_service.get_employer_profile(user_id=user_id)


@router.post(
    "/profile",
    response_model=EmployerProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Employer Profile",
)
def create_profile(
    req: EmployerProfileCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Creates a new employer profile for the authenticated user."""
    return employer_service.create_employer_profile(user_id=user_id, req=req)


@router.patch(
    "/profile",
    response_model=EmployerProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Employer Profile",
)
def update_profile(
    req: EmployerProfileUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Updates fields on the authenticated employer's profile."""
    return employer_service.update_employer_profile(user_id=user_id, req=req)

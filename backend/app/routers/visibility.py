from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.visibility import (
    DiscoveryStatusResponse,
    VisibilitySettingsItem,
    VisibilityUpdateRequest,
)
from app.services import visibility_service

router = APIRouter(tags=["Visibility & Discovery"])


@router.get(
    "/visibility",
    response_model=VisibilitySettingsItem,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Visibility Settings",
)
def get_visibility_settings(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the authenticated candidate's current visibility and consent settings.

    Returns default settings (all enabled) if no explicit settings have been saved yet.
    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return visibility_service.get_candidate_visibility_settings(user_id=user_id)


@router.patch(
    "/visibility",
    response_model=VisibilitySettingsItem,
    status_code=status.HTTP_200_OK,
    summary="Update Candidate Visibility Settings",
)
def update_visibility_settings(
    req: VisibilityUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Updates the authenticated candidate's visibility and consent settings.

    Only fields present in the request are updated; existing values are preserved.
    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return visibility_service.update_candidate_visibility_settings(
        user_id=user_id, req=req
    )


@router.get(
    "/discovery/status",
    response_model=DiscoveryStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Discovery Status",
)
def get_discovery_status(
    user_id: str = Depends(get_current_user_id),
):
    """Returns the authenticated candidate's discoverability status, contact permissions,

    and platform readiness for employer matching.
    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return visibility_service.get_candidate_discovery_status(user_id=user_id)

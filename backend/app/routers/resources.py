from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.resource import (
    ResourceStatusItem,
    ResourceStatusListResponse,
    ResourceStatusUpdateRequest,
)
from app.services import resource_service

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get(
    "/status",
    response_model=ResourceStatusListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Learning Resource Statuses",
)
def get_resource_statuses(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves all tracked learning resource statuses for the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return resource_service.get_candidate_resource_statuses(user_id=user_id)


@router.patch(
    "/status/{resource_id}",
    response_model=ResourceStatusItem,
    status_code=status.HTTP_200_OK,
    summary="Update / Toggle Learning Resource Status",
)
def update_resource_status(
    resource_id: str,
    req: ResourceStatusUpdateRequest = None,
    user_id: str = Depends(get_current_user_id),
):
    """Updates or toggles the progress status (started / completed) of a learning resource.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return resource_service.update_candidate_resource_status(
        user_id=user_id,
        resource_id=resource_id,
        req=req,
    )

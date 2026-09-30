from fastapi import APIRouter, Depends, status
from app.dependencies.auth import get_current_user_id
from app.schemas.diagnosis import DiagnosisResponse
from app.services import diagnosis_service

router = APIRouter(prefix="/diagnosis", tags=["Diagnosis"])


@router.get(
    "/latest",
    response_model=DiagnosisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Latest Skill Diagnosis",
)
def get_candidate_latest_diagnosis(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the latest structured skill diagnosis for the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return diagnosis_service.get_latest_diagnosis(user_id=user_id)

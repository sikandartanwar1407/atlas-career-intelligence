from typing import Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies.auth import get_current_user_id
from app.schemas.evidence import (
    EvidenceCreateRequest,
    EvidenceItemSchema,
    EvidenceListResponse,
    EvidenceUpdateRequest,
    GitHubAnalysisCreateRequest,
    GitHubAnalysisIngestRequest,
    GitHubAnalysisResponse,
    GitHubAnalysisSchema,
)
from app.services import evidence_service, github_service

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get(
    "",
    response_model=EvidenceListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Evidence Records",
)
def get_evidence_list(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves all portfolio evidence records belonging to the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.get_candidate_evidence_list(user_id=user_id)


@router.post(
    "",
    response_model=EvidenceItemSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create Candidate Evidence Record",
)
def create_evidence(
    req: EvidenceCreateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Creates a new portfolio evidence record for the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.create_candidate_evidence(user_id=user_id, req=req)


@router.get(
    "/github",
    response_model=Optional[GitHubAnalysisSchema],
    status_code=status.HTTP_200_OK,
    summary="Get Latest Candidate GitHub Analysis Telemetry",
)
def get_github_analysis(
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves the latest stored GitHub analysis telemetry for the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.get_candidate_github_analysis(user_id=user_id)


@router.post(
    "/github",
    response_model=Union[GitHubAnalysisResponse, GitHubAnalysisSchema],
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Real GitHub Evidence / Save GitHub Analysis",
)
def save_or_ingest_github_analysis(
    req: GitHubAnalysisIngestRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Ingests real GitHub profile/repo evidence via REST API or saves candidate GitHub analysis telemetry.

    Supports:
      - {"source": "github", "identifier": "https://github.com/USERNAME"}
      - {"source": "github", "identifier": "https://github.com/OWNER/REPO"}
      - Legacy telemetry format: {"github_username": "...", ...}
    """
    if req.identifier:
        return github_service.analyze_and_store_github_evidence(
            user_id=user_id,
            identifier=req.identifier,
        )
    elif req.github_username and req.analyzed_repos_count is not None and req.analyzed_repos_count > 0:
        # Legacy telemetry creation path
        legacy_req = GitHubAnalysisCreateRequest(
            github_username=req.github_username,
            github_user_data=req.github_user_data or {},
            analyzed_repos_count=req.analyzed_repos_count or 0,
            primary_languages=req.primary_languages or [],
            detected_topics=req.detected_topics or [],
            demonstrated_skills_detected=req.demonstrated_skills_detected or [],
            evidence_readiness_boost=req.evidence_readiness_boost or 0,
            extracted_evidence_count=req.extracted_evidence_count or 0,
            raw_analysis_payload=req.raw_analysis_payload or {},
        )
        return evidence_service.create_candidate_github_analysis(user_id=user_id, req=legacy_req)
    elif req.github_username:
        # If identifier was not supplied, but username was supplied as identifier
        return github_service.analyze_and_store_github_evidence(
            user_id=user_id,
            identifier=req.github_username,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'identifier' or 'github_username' must be provided for GitHub analysis.",
        )



@router.get(
    "/{evidence_id}",
    response_model=EvidenceItemSchema,
    status_code=status.HTTP_200_OK,
    summary="Get Single Candidate Evidence Item",
)
def get_evidence_item(
    evidence_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves a single portfolio evidence item only if owned by the authenticated candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.get_candidate_evidence_item(user_id=user_id, evidence_id=evidence_id)


@router.patch(
    "/{evidence_id}",
    response_model=EvidenceItemSchema,
    status_code=status.HTTP_200_OK,
    summary="Update Candidate Evidence Item",
)
def update_evidence_item(
    evidence_id: str,
    req: EvidenceUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Updates fields of an existing portfolio evidence record if owned by the candidate.

    Security: candidate identity is extracted strictly from the verified JWT access token.
    """
    return evidence_service.update_candidate_evidence_item(
        user_id=user_id,
        evidence_id=evidence_id,
        req=req,
    )

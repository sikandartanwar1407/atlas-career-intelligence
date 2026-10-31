"""FastAPI Router for AI Resume Parsing, Semantic Matching, and Recommendations.

Endpoints:
- POST /api/ml/parse-resume (Multipart file upload or direct text)
- POST /api/ml/compare-jd (Semantic Matcher: Sentence-BERT / TF-IDF)
- POST /api/ml/recommend-pathway (Content-based Recommender for courses & custom projects)
"""

from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.ml.recommender import PathwayRecommender
from app.ml.resume_parser import ResumeParser
from app.ml.semantic_matcher import SemanticMatcher
from app.schemas.matching_ai import (
    JDMatchRequest,
    JDMatchResponse,
    PathwayRecommendRequest,
    PathwayRecommendResponse,
    ResumeParseResponse,
    ResumeParseTextRequest,
)

router = APIRouter(prefix="/ml", tags=["AI & Machine Learning"])

parser = ResumeParser()
matcher = SemanticMatcher()
recommender = PathwayRecommender()


@router.post("/parse-resume", response_model=ResumeParseResponse, summary="Parse Resume Text or Document")
async def parse_resume(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
):
    """Parses a resume from an uploaded file (.pdf, .docx, .txt) or direct form text."""
    try:
        if file is not None:
            content_bytes = await file.read()
            parsed = parser.parse(content_bytes, filename=file.filename or "resume.pdf")
        elif resume_text:
            parsed = parser.parse(resume_text)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'file' or 'resume_text' must be provided.",
            )
        return ResumeParseResponse(**parsed)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing resume: {str(exc)}",
        ) from exc


@router.post("/parse-resume-text", response_model=ResumeParseResponse, summary="Parse Direct Resume JSON Payload")
def parse_resume_text(payload: ResumeParseTextRequest):
    """Direct JSON payload parsing for seamless frontend integration."""
    try:
        parsed = parser.parse(payload.resume_text)
        return ResumeParseResponse(**parsed)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing text: {str(exc)}",
        ) from exc


@router.post("/compare-jd", response_model=JDMatchResponse, summary="Compare Resume against Job Description")
def compare_job_description(payload: JDMatchRequest):
    """Computes dense Sentence-BERT semantic similarity and detects competency deficits."""
    try:
        skills = payload.resume_skills
        # If no skills provided, parse from resume text on the fly
        if not skills and payload.resume_text:
            parsed = parser.parse(payload.resume_text)
            skills = parsed.get("detected_skills", [])

        match_result = matcher.compute_match(
            resume_skills=skills,
            resume_text=payload.resume_text or "",
            jd_text=payload.job_description_text,
        )
        return JDMatchResponse(**match_result)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error computing semantic match: {str(exc)}",
        ) from exc


@router.post("/recommend-pathway", response_model=PathwayRecommendResponse, summary="Recommend Courses & Custom Projects")
def recommend_pathway(payload: PathwayRecommendRequest):
    """Ranks educational resources and synthesizes 4-pillar project milestones for missing skills."""
    try:
        rec_result = recommender.recommend_pathway(
            missing_skills=payload.missing_skills,
            target_role=payload.target_role or "Software Developer",
            available_hours_per_week=payload.available_hours_per_week or 10,
        )
        return PathwayRecommendResponse(**rec_result)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error recommending pathway: {str(exc)}",
        ) from exc


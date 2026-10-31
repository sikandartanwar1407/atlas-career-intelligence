"""Pydantic schemas for AI Resume Parsing, Semantic Matching, and Recommendations."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ResumeParseTextRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text of the resume")


class ResumeParseResponse(BaseModel):
    full_name: str
    email: str
    phone: str
    college: str
    degree: str
    year: str
    experience_level: str
    detected_skills: List[str]
    skills_by_category: Dict[str, List[str]]
    raw_text_length: int
    clean_text_preview: str


class JDMatchRequest(BaseModel):
    resume_text: Optional[str] = Field(default="", description="Full resume text")
    resume_skills: List[str] = Field(default_factory=list, description="List of verified or extracted skills")
    job_description_text: str = Field(..., description="Target job description text")
    target_role: Optional[str] = Field(default="Software Developer")


class JDMatchResponse(BaseModel):
    match_percentage: int
    engine_used: str
    direct_matches: List[str]
    semantic_matches: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    detailed_comparison: List[Dict[str, Any]]
    total_requirements_analyzed: int


class PathwayRecommendRequest(BaseModel):
    missing_skills: List[Any] = Field(..., description="List of missing skills or skill objects")
    target_role: Optional[str] = Field(default="Software Developer")
    available_hours_per_week: Optional[int] = Field(default=10, ge=1, le=80)


class PathwayRecommendResponse(BaseModel):
    summary: str
    target_role: str
    weekly_study_hours: int
    total_estimated_weeks: int
    missing_competencies_count: int
    recommended_courses: List[Dict[str, Any]]
    custom_projects: List[Dict[str, Any]]
    milestones: List[Dict[str, Any]]


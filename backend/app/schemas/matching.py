from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SkillComparisonItem(BaseModel):
    skill: str
    candidate_level: int
    required_level: int
    is_met: bool
    is_preferred: bool
    deficit: int


class SkillGapItem(BaseModel):
    skill: str
    candidate_level: int
    required_level: int
    deficit: int


class CandidateMatchItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: UUID
    opportunity_id: UUID
    full_name: str
    target_role: str
    experience_level: str
    college: str
    degree: str
    year: str
    overall_match: int  # 0 to 100
    matched_skills: List[str] = Field(default_factory=list)
    skill_gaps: List[SkillGapItem] = Field(default_factory=list)
    skill_comparisons: List[SkillComparisonItem] = Field(default_factory=list)
    evidence_count: int = 0
    demonstrated_skills: List[str] = Field(default_factory=list)
    is_discoverable: bool = True
    allow_contact: bool = True
    has_applied: bool = False
    application_status: Optional[str] = None


class OpportunityMatchesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    opportunity_id: UUID
    job_title: str
    target_role_category: str
    total_matches: int
    matches: List[CandidateMatchItem] = Field(default_factory=list)


class JobApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    opportunity_id: UUID
    candidate_id: UUID
    status: str
    submitted_at: datetime
    updated_at: datetime
    opportunity_title: Optional[str] = None
    company_name: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_target_role: Optional[str] = None
    allow_contact: Optional[bool] = None

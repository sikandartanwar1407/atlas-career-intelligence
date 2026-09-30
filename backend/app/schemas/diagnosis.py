from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class DiagnosisSkillItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    skill_name: str
    display_name: str
    baseline_score: int
    demonstrated_score: int
    role_threshold: int
    gap: int
    priority_level: str
    evidence_status: str
    description: Optional[str] = None
    strategic_note: Optional[str] = None
    calculated_at: Optional[datetime] = None


class DiagnosisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: UUID
    target_role: str
    career_readiness: int
    largest_gap_skill: str
    largest_gap: int
    total_skills: int
    high_priority_gaps: int
    diagnostics: List[DiagnosisSkillItem] = Field(default_factory=list)

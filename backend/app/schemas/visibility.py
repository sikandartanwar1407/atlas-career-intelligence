from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class VisibilitySettingsItem(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    candidate_id: UUID
    allow_discover: bool = True
    allow_contact: bool = True
    show_portfolio_evidence: bool = True
    show_skill_info: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class VisibilityUpdateRequest(BaseModel):
    allow_discover: Optional[bool] = None
    allow_contact: Optional[bool] = None
    show_portfolio_evidence: Optional[bool] = None
    show_skill_info: Optional[bool] = None


class DiscoveryStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: UUID
    is_discoverable: bool
    allow_contact: bool
    show_portfolio_evidence: bool
    show_skill_info: bool
    profile_complete: bool
    target_role: str
    status_message: str


class DiscoverableCandidatePublicItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: UUID
    full_name: str
    college: str
    degree: str
    year: str
    experience_level: str
    target_role: str
    allow_contact: bool
    show_portfolio_evidence: bool
    show_skill_info: bool
    demonstrated_skills: List[str] = Field(default_factory=list)
    evidence_count: int = 0

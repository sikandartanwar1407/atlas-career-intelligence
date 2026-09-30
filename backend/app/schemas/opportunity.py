from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class RequirementCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    requirement_type: Literal["required", "preferred"] = "required"
    min_level: int = Field(..., ge=0, le=100)


class RequirementItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    opportunity_id: UUID
    skill_name: str
    requirement_type: str
    min_level: int
    created_at: Optional[datetime] = None


class OpportunityCreate(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=200)
    company: Optional[str] = Field(None, max_length=200)
    company_logo_text: Optional[str] = Field(None, max_length=10)
    location: str = Field(..., min_length=1, max_length=200)
    employment_type: Literal["Full-time", "Part-time", "Contract", "Internship"]
    target_role_category: str = Field(..., min_length=1, max_length=100)
    experience_level: Literal["Beginner", "Student", "Fresher", "Early Career", "Experienced"]
    short_description: str = Field(..., min_length=1, max_length=500)
    full_description: str = Field(..., min_length=1, max_length=5000)
    salary_range: Optional[str] = Field(None, max_length=100)
    status: Literal["active", "closed"] = "active"
    required_evidence_types: List[str] = Field(default_factory=list)
    requirements: List[RequirementCreate] = Field(default_factory=list)


class OpportunityUpdate(BaseModel):
    job_title: Optional[str] = Field(None, min_length=1, max_length=200)
    company: Optional[str] = Field(None, max_length=200)
    company_logo_text: Optional[str] = Field(None, max_length=10)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    employment_type: Optional[Literal["Full-time", "Part-time", "Contract", "Internship"]] = None
    target_role_category: Optional[str] = Field(None, min_length=1, max_length=100)
    experience_level: Optional[Literal["Beginner", "Student", "Fresher", "Early Career", "Experienced"]] = None
    short_description: Optional[str] = Field(None, min_length=1, max_length=500)
    full_description: Optional[str] = Field(None, min_length=1, max_length=5000)
    salary_range: Optional[str] = Field(None, max_length=100)
    status: Optional[Literal["active", "closed"]] = None
    required_evidence_types: Optional[List[str]] = None


class OpportunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employer_id: UUID
    job_title: str
    company: str
    company_logo_text: Optional[str] = None
    location: str
    employment_type: str
    target_role_category: str
    experience_level: str
    short_description: str
    full_description: str
    salary_range: Optional[str] = None
    status: str
    required_evidence_types: List[str] = Field(default_factory=list)
    is_employer_posted: bool = True
    posted_date: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    requirements: List[RequirementItem] = Field(default_factory=list)
    matched_count: Optional[int] = 0
    interested_count: Optional[int] = 0

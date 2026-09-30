from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class EmployerProfileCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    company_website: str = Field(..., min_length=1, max_length=300)
    company_email: str = Field(..., min_length=1, max_length=200)
    industry: str = Field(..., min_length=1, max_length=100)
    company_size: str = Field(..., min_length=1, max_length=100)
    company_location: str = Field(..., min_length=1, max_length=200)
    company_description: str = Field(..., min_length=1, max_length=3000)
    company_logo_text: Optional[str] = Field(None, max_length=10)


class EmployerProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    company_website: Optional[str] = Field(None, min_length=1, max_length=300)
    company_email: Optional[str] = Field(None, min_length=1, max_length=200)
    industry: Optional[str] = Field(None, min_length=1, max_length=100)
    company_size: Optional[str] = Field(None, min_length=1, max_length=100)
    company_location: Optional[str] = Field(None, min_length=1, max_length=200)
    company_description: Optional[str] = Field(None, min_length=1, max_length=3000)
    company_logo_text: Optional[str] = Field(None, max_length=10)


class EmployerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_name: str
    company_website: str
    company_email: str
    industry: str
    company_size: str
    company_location: str
    company_description: str
    company_logo_text: Optional[str] = None
    verification_status: str = "pending"
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

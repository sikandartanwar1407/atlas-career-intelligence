import { getApiUrl } from './profileService';
import {
  EmployerProfile,
  Opportunity,
  OpportunityRequirement,
  OpportunityMatchResult,
} from '../types/opportunities';

export interface RemoteEmployerProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_website: string;
  company_email: string;
  industry: string;
  company_size: string;
  company_location: string;
  company_description: string;
  company_logo_text?: string;
  verification_status: 'pending' | 'verified';
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RemoteOpportunityItem {
  id: string;
  employer_id: string;
  job_title: string;
  company: string;
  company_logo_text?: string;
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  target_role_category: string;
  experience_level: 'Beginner' | 'Student' | 'Fresher' | 'Early Career' | 'Experienced';
  short_description: string;
  full_description: string;
  salary_range?: string;
  status: 'active' | 'closed';
  required_evidence_types: string[];
  is_employer_posted: boolean;
  posted_date: string;
  created_at?: string;
  updated_at?: string;
  requirements: Array<{
    id: string;
    opportunity_id: string;
    skill_name: string;
    requirement_type: 'required' | 'preferred';
    min_level: number;
  }>;
  matched_count?: number;
  interested_count?: number;
}

export interface RemoteMatchItem {
  candidate_id: string;
  opportunity_id: string;
  full_name: string;
  target_role: string;
  experience_level: string;
  college: string;
  degree: string;
  year: string;
  overall_match: number;
  matched_skills: string[];
  skill_gaps: Array<{ skill: string; candidate_level: number; required_level: number; deficit: number }>;
  evidence_count: number;
  demonstrated_skills: string[];
  is_discoverable: boolean;
  allow_contact: boolean;
  has_applied: boolean;
  application_status?: string;
}

export interface RemoteOpportunityMatchesResponse {
  opportunity_id: string;
  job_title: string;
  target_role_category: string;
  total_matches: number;
  matches: RemoteMatchItem[];
}

export interface RemoteJobApplication {
  id: string;
  opportunity_id: string;
  candidate_id: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  opportunity_title?: string;
  company_name?: string;
  candidate_name?: string;
  candidate_target_role?: string;
  allow_contact?: boolean;
}

export class EmployerApiService {
  /**
   * Fetches the authenticated employer's profile from GET /api/employer/profile
   */
  static async getProfile(
    token: string
  ): Promise<{ success: boolean; data?: RemoteEmployerProfile; error?: string }> {
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/employer/profile`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: json.detail || 'Failed to fetch employer profile.' };
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Creates an employer profile via POST /api/employer/profile
   */
  static async createProfile(
    profile: Omit<EmployerProfile, 'id' | 'verificationStatus'>,
    token: string
  ): Promise<{ success: boolean; data?: RemoteEmployerProfile; error?: string }> {
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const apiUrl = getApiUrl();
      const body = {
        company_name: profile.companyName,
        company_website: profile.companyWebsite,
        company_email: profile.companyEmail,
        industry: profile.industry,
        company_size: profile.companySize,
        company_location: profile.companyLocation,
        company_description: profile.companyDescription,
        company_logo_text: profile.companyLogoText,
      };
      const res = await fetch(`${apiUrl}/api/employer/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: json.detail || 'Failed to create employer profile.' };
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Creates an opportunity via POST /api/opportunities
   */
  static async createOpportunity(
    opp: Omit<Opportunity, 'id' | 'postedDate' | 'matchedCount' | 'interestedCount'>,
    token: string
  ): Promise<{ success: boolean; data?: RemoteOpportunityItem; error?: string }> {
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const apiUrl = getApiUrl();
      const body = {
        job_title: opp.jobTitle,
        company: opp.company,
        company_logo_text: opp.companyLogoText,
        location: opp.location,
        employment_type: opp.employmentType,
        target_role_category: opp.targetRoleCategory,
        experience_level: opp.experienceLevel,
        short_description: opp.shortDescription,
        full_description: opp.fullDescription,
        salary_range: opp.salaryRange,
        status: opp.status || 'active',
        required_evidence_types: opp.requiredEvidenceTypes || [],
        requirements: (opp.requirements || []).map((r) => ({
          skill_name: r.skill,
          requirement_type: r.type,
          min_level: r.minLevel,
        })),
      };
      const res = await fetch(`${apiUrl}/api/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: json.detail || 'Failed to create opportunity.' };
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Fetches opportunities from GET /api/opportunities
   */
  static async getOpportunities(
    myOpportunities: boolean = false,
    token?: string
  ): Promise<{ success: boolean; data?: RemoteOpportunityItem[]; error?: string }> {
    try {
      const apiUrl = getApiUrl();
      const url = new URL(`${apiUrl}/api/opportunities`);
      if (myOpportunities) url.searchParams.set('my_opportunities', 'true');

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url.toString(), { headers });
      const json = await res.json().catch(() => []);
      if (!res.ok) return { success: false, error: json.detail || 'Failed to list opportunities.' };
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Fetches candidate matches for an opportunity from GET /api/opportunities/{id}/matches
   */
  static async getOpportunityMatches(
    opportunityId: string,
    token: string
  ): Promise<{ success: boolean; data?: RemoteOpportunityMatchesResponse; error?: string }> {
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/opportunities/${opportunityId}/matches`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: json.detail || 'Failed to fetch candidate matches.' };
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Candidate applies to an opportunity via POST /api/opportunities/{id}/apply
   */
  static async applyToOpportunity(
    opportunityId: string,
    token: string
  ): Promise<{ success: boolean; data?: RemoteJobApplication; error?: string }> {
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: json.detail || 'Failed to apply.' };
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Candidate fetches their applications from GET /api/applications
   */
  static async getCandidateApplications(
    token: string
  ): Promise<{ success: boolean; data?: RemoteJobApplication[]; error?: string }> {
    if (!token) return { success: false, error: 'Authentication required.' };
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/applications`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const json = await res.json().catch(() => []);
      if (!res.ok) return { success: false, error: json.detail || 'Failed to fetch applications.' };
      return { success: true, data: json };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  }
}

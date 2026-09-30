import { EvidenceItem, EvidenceType } from '../types/atlas';
import { getApiUrl } from './profileService';

export interface RemoteEvidenceItem {
  id: string;
  candidate_id: string;
  title: string;
  skill_name: string;
  evidence_type: EvidenceType;
  description: string;
  link: string;
  date: string;
  verification_status: 'Verified' | 'Under Review' | 'Submitted';
  metrics?: string;
  sha_hash?: string;
  evaluator_feedback?: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RemoteEvidenceListResponse {
  candidate_id: string;
  total_count: number;
  verified_count: number;
  under_review_count: number;
  items: RemoteEvidenceItem[];
}

export interface RemoteGitHubAnalysis {
  id?: string;
  candidate_id: string;
  github_username: string;
  github_user_data: Record<string, any>;
  analyzed_repos_count: number;
  primary_languages: any[];
  detected_topics: string[];
  demonstrated_skills_detected: string[];
  evidence_readiness_boost: number;
  extracted_evidence_count: number;
  raw_analysis_payload: Record<string, any>;
  created_at?: string;
}

export class EvidenceApiService {
  /**
   * Fetches candidate evidence records from GET /api/evidence
   */
  static async fetchEvidenceList(
    token: string
  ): Promise<{ success: boolean; data?: RemoteEvidenceListResponse | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/evidence`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        return { success: true, data: null };
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to fetch evidence records.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[EvidenceApiService] Error fetching evidence:', err);
      return { success: false, error: err.message || 'Network error fetching evidence.' };
    }
  }

  /**
   * Creates a new evidence record via POST /api/evidence
   */
  static async createEvidence(
    item: Omit<EvidenceItem, 'id'>,
    token: string
  ): Promise<{ success: boolean; data?: RemoteEvidenceItem; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const payload = {
        title: item.title,
        skill_name: item.skill,
        evidence_type: item.type,
        description: item.description,
        link: item.link,
        date: item.date,
        verification_status: item.verificationStatus,
        metrics: item.metrics,
        sha_hash: item.shaHash,
        evaluator_feedback: item.evaluatorFeedback,
        is_public: true,
      };

      const response = await fetch(`${apiUrl}/api/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to create evidence record.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[EvidenceApiService] Error creating evidence:', err);
      return { success: false, error: err.message || 'Network error creating evidence.' };
    }
  }

  /**
   * Updates an existing evidence record via PATCH /api/evidence/{evidence_id}
   */
  static async updateEvidence(
    evidenceId: string,
    updates: Partial<EvidenceItem>,
    token: string
  ): Promise<{ success: boolean; data?: RemoteEvidenceItem; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.skill !== undefined) payload.skill_name = updates.skill;
      if (updates.type !== undefined) payload.evidence_type = updates.type;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.link !== undefined) payload.link = updates.link;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.verificationStatus !== undefined) payload.verification_status = updates.verificationStatus;
      if (updates.metrics !== undefined) payload.metrics = updates.metrics;
      if (updates.shaHash !== undefined) payload.sha_hash = updates.shaHash;
      if (updates.evaluatorFeedback !== undefined) payload.evaluator_feedback = updates.evaluatorFeedback;

      const response = await fetch(`${apiUrl}/api/evidence/${evidenceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to update evidence record.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[EvidenceApiService] Error updating evidence:', err);
      return { success: false, error: err.message || 'Network error updating evidence.' };
    }
  }

  /**
   * Triggers real GitHub REST API ingestion & analysis on FastAPI backend via POST /api/evidence/github
   */
  static async analyzeGitHub(
    identifier: string,
    token: string
  ): Promise<{
    success: boolean;
    data?: {
      analysis: RemoteGitHubAnalysis;
      evidence: RemoteEvidenceItem[];
    };
    error?: string;
  }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token. Please sign in.' };
    }
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter a valid GitHub username or public repository URL.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/evidence/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          source: 'github',
          identifier: identifier.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'GitHub analysis failed.',
        };
      }

      if (data.analysis && data.evidence) {
        return { success: true, data: { analysis: data.analysis, evidence: data.evidence } };
      }

      return { success: true, data: { analysis: data, evidence: [] } };
    } catch (err: any) {
      console.warn('[EvidenceApiService] Error analyzing GitHub:', err);
      return { success: false, error: err.message || 'Network error connecting to backend GitHub service.' };
    }
  }

  /**
   * Fetches latest stored GitHub analysis for the candidate via GET /api/evidence/github
   */
  static async fetchGitHubAnalysis(
    token: string
  ): Promise<{ success: boolean; data?: RemoteGitHubAnalysis | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/evidence/github`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        return { success: true, data: null };
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to fetch GitHub analysis.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[EvidenceApiService] Error fetching GitHub analysis:', err);
      return { success: false, error: err.message || 'Network error fetching GitHub analysis.' };
    }
  }

  /**
   * Stores GitHub analysis telemetry associated with candidate via POST /api/evidence/github
   */
  static async saveGitHubAnalysis(
    payload: {
      github_username: string;
      github_user_data?: Record<string, any>;
      analyzed_repos_count?: number;
      primary_languages?: any[];
      detected_topics?: string[];
      demonstrated_skills_detected?: string[];
      evidence_readiness_boost?: number;
      extracted_evidence_count?: number;
      raw_analysis_payload?: Record<string, any>;
    },
    token: string
  ): Promise<{ success: boolean; data?: RemoteGitHubAnalysis; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/evidence/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to save GitHub analysis.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[EvidenceApiService] Error saving GitHub analysis:', err);
      return { success: false, error: err.message || 'Network error saving GitHub analysis.' };
    }
  }
}


import { getApiUrl } from './profileService';

export interface SkillDiagnosisDetail {
  id?: string;
  skill_name: string;
  display_name: string;
  baseline_score: number;
  demonstrated_score: number;
  role_threshold: number;
  gap: number;
  priority_level: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  evidence_status: 'Missing' | 'Moderate' | 'Strong' | 'Unverified';
  description?: string;
  strategic_note?: string;
  calculated_at?: string;
}

export interface LatestDiagnosisResponse {
  candidate_id: string;
  target_role: string;
  career_readiness: number;
  largest_gap_skill: string;
  largest_gap: number;
  total_skills: number;
  high_priority_gaps: number;
  diagnostics: SkillDiagnosisDetail[];
}

export class DiagnosisApiService {
  /**
   * Fetches the latest skill diagnosis for the authenticated candidate from GET /api/diagnosis/latest
   */
  static async fetchLatestDiagnosis(
    token: string
  ): Promise<{ success: boolean; data?: LatestDiagnosisResponse | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/diagnosis/latest`, {
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
          error: data.detail || 'Failed to fetch latest skill diagnosis.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[DiagnosisApiService] Error fetching latest diagnosis:', err);
      return { success: false, error: err.message || 'Network error fetching diagnosis.' };
    }
  }
}

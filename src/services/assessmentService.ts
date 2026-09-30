import { AssessmentQuestion } from '../types/atlas';
import { getApiUrl } from './profileService';

export interface RemoteSkillDiagnostic {
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
}

export interface RemoteAssessmentResponse {
  id: string;
  candidate_id: string;
  role_id: string;
  overall_demonstrated: number;
  largest_gap_skill: string;
  completed_at: string;
  skill_diagnostics: RemoteSkillDiagnostic[];
  answers_count: number;
}

export class AssessmentApiService {
  /**
   * Submits candidate assessment answers to POST /api/assessment/submit
   */
  static async submitAssessment(
    roleId: string,
    answers: Record<string, number>,
    questions: AssessmentQuestion[],
    selfRatings: Record<string, number>,
    token: string
  ): Promise<{ success: boolean; data?: RemoteAssessmentResponse; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();

      // Map answer dict to array format expected by backend
      const answersPayload = questions
        .filter((q) => answers[q.id] !== undefined)
        .map((q) => ({
          question_id: q.id,
          skill_name: q.skill,
          selected_option: answers[q.id],
          is_correct: answers[q.id] === q.correctAnswer,
        }));

      if (answersPayload.length === 0) {
        return { success: false, error: 'No assessment answers to submit.' };
      }

      const body = {
        role_id: roleId,
        answers: answersPayload,
        self_ratings: selfRatings,
      };

      const response = await fetch(`${apiUrl}/api/assessment/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to submit assessment to backend.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[AssessmentApiService] Error submitting assessment:', err);
      return { success: false, error: err.message || 'Network error submitting assessment.' };
    }
  }

  /**
   * Fetches latest assessment submission and diagnostics from GET /api/assessment/latest
   */
  static async fetchLatestAssessment(
    token: string
  ): Promise<{ success: boolean; data?: RemoteAssessmentResponse | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/assessment/latest`, {
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
          error: data.detail || 'Failed to fetch latest assessment.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[AssessmentApiService] Error fetching latest assessment:', err);
      return { success: false, error: err.message || 'Network error fetching assessment.' };
    }
  }
}

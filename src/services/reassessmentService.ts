import { getApiUrl } from './profileService';

export interface RemoteReassessmentItem {
  id?: string;
  candidate_id: string;
  previous_overall_score: number;
  current_overall_score: number;
  improvement: number;
  skill_deltas: Record<string, { previous: number; current: number; change: number }>;
  created_at?: string;
}

export interface RemoteReassessmentResponse extends RemoteReassessmentItem {
  id: string;
  skills_reassessed_count: number;
  roadmap_regenerated: boolean;
}

export interface RemoteReassessmentHistoryResponse {
  candidate_id: string;
  total_reassessments: number;
  cumulative_improvement: number;
  history: RemoteReassessmentItem[];
}

export class ReassessmentApiService {
  /**
   * Submits candidate reassessment to POST /api/reassessment
   */
  static async submitReassessment(
    skillRatings: Record<string, number>,
    token: string
  ): Promise<{ success: boolean; data?: RemoteReassessmentResponse; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/reassessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({ skill_ratings: skillRatings }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to submit reassessment.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[ReassessmentApiService] Error submitting reassessment:', err);
      return { success: false, error: err.message || 'Network error submitting reassessment.' };
    }
  }

  /**
   * Fetches latest reassessment from GET /api/reassessment/latest
   */
  static async fetchLatestReassessment(
    token: string
  ): Promise<{ success: boolean; data?: RemoteReassessmentItem | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/reassessment/latest`, {
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
          error: data.detail || 'Failed to fetch latest reassessment.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[ReassessmentApiService] Error fetching latest reassessment:', err);
      return { success: false, error: err.message || 'Network error fetching latest reassessment.' };
    }
  }

  /**
   * Fetches longitudinal reassessment history from GET /api/reassessment/history
   */
  static async fetchReassessmentHistory(
    token: string
  ): Promise<{ success: boolean; data?: RemoteReassessmentHistoryResponse | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/reassessment/history`, {
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
          error: data.detail || 'Failed to fetch reassessment history.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[ReassessmentApiService] Error fetching reassessment history:', err);
      return { success: false, error: err.message || 'Network error fetching reassessment history.' };
    }
  }
}

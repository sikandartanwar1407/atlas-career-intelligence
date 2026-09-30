import { getApiUrl } from './profileService';

export interface RemoteRoadmapAction {
  id?: string;
  roadmap_step_id?: string;
  action_id: string;
  title: string;
  description?: string;
  action_type: 'Learn' | 'Practice' | 'Build' | 'Defend';
  estimated_minutes: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface RemoteRoadmapStep {
  id?: string;
  candidate_id?: string;
  step_id: string;
  step_number: number;
  skill_name: string;
  priority: string;
  gap: number;
  allocated_hours: number;
  estimated_duration_weeks: string;
  title: string;
  description: string;
  is_completed: boolean;
  actions: RemoteRoadmapAction[];
}

export interface RemoteRoadmapResponse {
  candidate_id: string;
  target_role: string;
  total_steps: number;
  completed_steps: number;
  total_allocated_hours: number;
  steps: RemoteRoadmapStep[];
}

export class RoadmapApiService {
  /**
   * Fetches candidate roadmap from GET /api/roadmap
   */
  static async fetchRoadmap(
    token: string
  ): Promise<{ success: boolean; data?: RemoteRoadmapResponse | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/roadmap`, {
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
          error: data.detail || 'Failed to fetch candidate roadmap.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[RoadmapApiService] Error fetching roadmap:', err);
      return { success: false, error: err.message || 'Network error fetching roadmap.' };
    }
  }

  /**
   * Generates or regenerates candidate roadmap via POST /api/roadmap/generate
   */
  static async generateRoadmap(
    token: string
  ): Promise<{ success: boolean; data?: RemoteRoadmapResponse; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/roadmap/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to generate candidate roadmap.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[RoadmapApiService] Error generating roadmap:', err);
      return { success: false, error: err.message || 'Network error generating roadmap.' };
    }
  }

  /**
   * Updates completion status of a roadmap action via PATCH /api/roadmap/actions/{action_id}
   */
  static async updateRoadmapAction(
    actionId: string,
    isCompleted: boolean,
    token: string
  ): Promise<{ success: boolean; data?: RemoteRoadmapAction; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/roadmap/actions/${actionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({ is_completed: isCompleted }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to update roadmap action status.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[RoadmapApiService] Error updating roadmap action:', err);
      return { success: false, error: err.message || 'Network error updating roadmap action.' };
    }
  }
}

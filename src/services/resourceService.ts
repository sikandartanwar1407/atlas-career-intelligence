import { getApiUrl } from './profileService';

export interface RemoteResourceStatusItem {
  id?: string;
  candidate_id: string;
  resource_id: string;
  is_started: boolean;
  is_completed: boolean;
  started_at?: string;
  completed_at?: string;
  updated_at?: string;
}

export interface RemoteResourceStatusListResponse {
  candidate_id: string;
  total_tracked: number;
  started_count: number;
  completed_count: number;
  resources: RemoteResourceStatusItem[];
}

export class ResourceApiService {
  /**
   * Fetches learning resource statuses from GET /api/resources/status
   */
  static async fetchResourceStatuses(
    token: string
  ): Promise<{ success: boolean; data?: RemoteResourceStatusListResponse | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/resources/status`, {
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
          error: data.detail || 'Failed to fetch resource statuses.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[ResourceApiService] Error fetching resource statuses:', err);
      return { success: false, error: err.message || 'Network error fetching resource statuses.' };
    }
  }

  /**
   * Updates or toggles learning resource progress via PATCH /api/resources/status/{resource_id}
   */
  static async updateResourceStatus(
    resourceId: string,
    isStarted: boolean,
    token: string
  ): Promise<{ success: boolean; data?: RemoteResourceStatusItem; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/resources/status/${resourceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({ is_started: isStarted }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to update resource status.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[ResourceApiService] Error updating resource status:', err);
      return { success: false, error: err.message || 'Network error updating resource status.' };
    }
  }
}

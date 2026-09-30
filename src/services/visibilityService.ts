import { getApiUrl } from './profileService';
import { CandidateVisibilitySettings } from '../types/opportunities';

export interface RemoteVisibilitySettings {
  candidate_id: string;
  allow_discover: boolean;
  allow_contact: boolean;
  show_portfolio_evidence: boolean;
  show_skill_info: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RemoteDiscoveryStatus {
  candidate_id: string;
  is_discoverable: boolean;
  allow_contact: boolean;
  show_portfolio_evidence: boolean;
  show_skill_info: boolean;
  profile_complete: boolean;
  target_role: string;
  status_message: string;
}

export class VisibilityApiService {
  /**
   * Fetches the candidate's visibility and consent settings from GET /api/visibility
   */
  static async getVisibilitySettings(
    token: string
  ): Promise<{ success: boolean; data?: CandidateVisibilitySettings; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/visibility`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: json.detail || 'Failed to fetch visibility settings.',
        };
      }

      const settings: CandidateVisibilitySettings = {
        allowDiscover: json.allow_discover ?? true,
        allowContact: json.allow_contact ?? true,
        showPortfolioEvidence: json.show_portfolio_evidence ?? true,
        showSkillInfo: json.show_skill_info ?? true,
      };

      return { success: true, data: settings };
    } catch (err: any) {
      console.warn('[VisibilityApiService] Error fetching visibility settings:', err);
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Updates candidate visibility and consent settings via PATCH /api/visibility
   */
  static async updateVisibilitySettings(
    updates: Partial<CandidateVisibilitySettings>,
    token: string
  ): Promise<{ success: boolean; data?: CandidateVisibilitySettings; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const body: Record<string, boolean | undefined> = {};
      if (updates.allowDiscover !== undefined) body.allow_discover = updates.allowDiscover;
      if (updates.allowContact !== undefined) body.allow_contact = updates.allowContact;
      if (updates.showPortfolioEvidence !== undefined)
        body.show_portfolio_evidence = updates.showPortfolioEvidence;
      if (updates.showSkillInfo !== undefined) body.show_skill_info = updates.showSkillInfo;

      const response = await fetch(`${apiUrl}/api/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: json.detail || 'Failed to update visibility settings.',
        };
      }

      const settings: CandidateVisibilitySettings = {
        allowDiscover: json.allow_discover ?? true,
        allowContact: json.allow_contact ?? true,
        showPortfolioEvidence: json.show_portfolio_evidence ?? true,
        showSkillInfo: json.show_skill_info ?? true,
      };

      return { success: true, data: settings };
    } catch (err: any) {
      console.warn('[VisibilityApiService] Error updating visibility settings:', err);
      return { success: false, error: err.message || 'Network error.' };
    }
  }

  /**
   * Retrieves candidate discovery status from GET /api/discovery/status
   */
  static async getDiscoveryStatus(
    token: string
  ): Promise<{ success: boolean; data?: RemoteDiscoveryStatus; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/discovery/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: json.detail || 'Failed to fetch discovery status.',
        };
      }

      return { success: true, data: json };
    } catch (err: any) {
      console.warn('[VisibilityApiService] Error fetching discovery status:', err);
      return { success: false, error: err.message || 'Network error.' };
    }
  }
}

import { UserProfile, AtlasAppState, RoleDefinition } from '../types/atlas';
import { StorageService, STORAGE_KEYS } from './storageService';
import { getRoleDefinition } from '../data/rolesData';
import { calculateSkillGaps, calculateResourceAllocation, generateRoadmap } from './scoringService';

export const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-01',
  fullName: 'Demo User',
  email: 'demo@atlas.edu',
  college: 'ATLAS Demo University',
  degree: 'B.S. in Data & Information Systems',
  year: '3rd Year',
  experienceLevel: 'Fresher',
  targetRole: 'Data Analyst',
  hasCompletedSetup: true
};

export const EMPTY_PROFILE: UserProfile = {
  id: '',
  fullName: '',
  email: '',
  college: '',
  degree: '',
  year: '1st Year',
  experienceLevel: 'Student',
  targetRole: '',
  hasCompletedSetup: false
};

const DEFAULT_API_URL = 'http://localhost:8000';

export function getApiUrl(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    DEFAULT_API_URL
  );
}

export class ProfileService {
  /**
   * Reads profile from storage or returns unconfigured empty profile
   */
  static getProfile(): UserProfile {
    return StorageService.getItem<UserProfile>(STORAGE_KEYS.PROFILE, EMPTY_PROFILE);
  }

  /**
   * Saves profile to storage
   */
  static saveProfile(profile: UserProfile): void {
    StorageService.setItem(STORAGE_KEYS.PROFILE, profile);
  }

  /**
   * Saves candidate profile remotely via POST /api/profile using authenticated Bearer token.
   */
  static async saveRemoteProfile(
    profile: UserProfile,
    token: string,
    availabilityHours: number = 10
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const payload = {
        full_name: profile.fullName,
        email: profile.email,
        college: profile.college,
        degree: profile.degree,
        year: profile.year,
        experience_level: profile.experienceLevel,
        target_role: profile.targetRole,
        custom_role: profile.customRole || null,
        availability_hours_per_week: availabilityHours,
        has_completed_setup: profile.hasCompletedSetup ?? true,
      };

      const response = await fetch(`${apiUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to save candidate profile to backend.',
        };
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn('[ProfileService] Error saving remote profile:', err);
      return { success: false, error: err.message || 'Network error connecting to backend API.' };
    }
  }

  /**
   * Fetches the candidate profile remotely via GET /api/profile using authenticated Bearer token.
   */
  static async fetchRemoteProfile(
    token: string
  ): Promise<{ success: boolean; profile?: UserProfile | null; error?: string }> {
    if (!token) {
      return { success: false, error: 'Missing authentication token.' };
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        return { success: true, profile: null };
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Failed to fetch candidate profile from backend.',
        };
      }

      const userProfile: UserProfile = {
        id: data.id || `usr-${data.user_id}`,
        fullName: data.full_name || '',
        email: data.email || '',
        college: data.college || '',
        degree: data.degree || '',
        year: data.year || '1st Year',
        experienceLevel: data.experience_level || 'Student',
        targetRole: data.target_role || '',
        customRole: data.custom_role || undefined,
        hasCompletedSetup: Boolean(data.has_completed_setup),
      };

      return { success: true, profile: userProfile };
    } catch (err: any) {
      console.warn('[ProfileService] Error fetching remote profile:', err);
      return { success: false, error: err.message || 'Network error connecting to backend API.' };
    }
  }

  /**
   * Creates calibrated initial state for a given profile and target role
   */
  static createCalibratedStateForProfile(
    profile: UserProfile,
    customSelfRatings?: Record<string, number>,
    availabilityHours: number = 10
  ): AtlasAppState {
    const roleDef = getRoleDefinition(profile.targetRole || 'Data Analyst');
    const selfRatings: Record<string, number> = {};

    roleDef.skills.forEach((skill) => {
      selfRatings[skill.name] = customSelfRatings?.[skill.name] ?? skill.defaultBaseline;
    });

    const initialGaps = calculateSkillGaps(roleDef, selfRatings, selfRatings);
    const initialAllocations = calculateResourceAllocation(availabilityHours, initialGaps);
    const initialRoadmap = generateRoadmap(roleDef, initialGaps, initialAllocations);

    // Initial default scores
    const skillScores: Record<string, { baseline: number; demonstrated: number; threshold: number; gap: number }> = {};
    roleDef.skills.forEach((skill) => {
      const baseline = selfRatings[skill.name] ?? skill.defaultBaseline;
      const threshold = skill.targetThreshold;
      const gap = Math.max(threshold - baseline, 0);
      skillScores[skill.name] = {
        baseline,
        demonstrated: baseline,
        threshold,
        gap
      };
    });

    const largestGapSkill = initialGaps[0]?.skill || roleDef.skills[0].name;
    const overallDemonstrated = Math.round(
      Object.values(skillScores).reduce((acc, curr) => acc + curr.demonstrated, 0) / roleDef.skills.length
    );

    return {
      version: STORAGE_KEYS.APP_STATE,
      profile,
      targetRole: profile.targetRole || roleDef.name,
      availability: availabilityHours,
      selfRatings,
      assessmentAnswers: {},
      assessmentCompleted: false,
      assessmentResult: {
        overallDemonstrated,
        largestGapSkill,
        skillScores
      },
      resourceStatus: {},
      roadmapSteps: initialRoadmap,
      evidence: [],
      reassessment: {
        completed: false,
        previousOverallScore: overallDemonstrated,
        currentOverallScore: overallDemonstrated,
        improvement: 0,
        skillDeltas: Object.fromEntries(
          roleDef.skills.map((s) => [
            s.name,
            { previous: s.defaultBaseline, current: s.defaultBaseline, change: 0 }
          ])
        )
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generates state pre-configured for the demo user
   */
  static getDemoState(): AtlasAppState {
    const state = this.createCalibratedStateForProfile(DEMO_PROFILE, {
      'SQL': 62,
      'Power BI': 48,
      'Excel': 76,
      'Python': 40,
      'Data Storytelling': 55
    }, 10);

    // Seed realistic demo assessment answers
    state.assessmentAnswers = {
      'data-analyst-sql-q1': 0,
      'data-analyst-sql-q2': 1,
      'data-analyst-power-bi-q1': 0,
      'data-analyst-excel-q1': 0,
      'data-analyst-excel-q2': 1,
      'data-analyst-excel-q3': 2
    };

    return state;
  }
}

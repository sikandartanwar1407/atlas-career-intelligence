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

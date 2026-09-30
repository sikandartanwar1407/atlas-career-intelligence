import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AtlasAppState,
  SkillKey,
  UserProfile,
  SkillGapDetail,
  SkillAllocation,
  EvidenceItem,
  RoadmapStep,
  RoleDefinition
} from '../types/atlas';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { getRoleDefinition } from '../data/rolesData';
import { ProfileService, EMPTY_PROFILE } from '../services/profileService';
import {
  calculateSkillGaps,
  calculateResourceAllocation,
  generateRoadmap,
  scoreAssessmentAnswers
} from '../services/scoringService';

import { SupabaseAuthService } from '../services/supabaseAuth';
import { AssessmentApiService } from '../services/assessmentService';
import { RoadmapApiService } from '../services/roadmapService';
import { ResourceApiService } from '../services/resourceService';
import { EvidenceApiService } from '../services/evidenceService';
import { ReassessmentApiService } from '../services/reassessmentService';

export function loadInitialState(): AtlasAppState {
  const storedProfile = StorageService.getItem<UserProfile>(STORAGE_KEYS.PROFILE, EMPTY_PROFILE);
  const storedState = StorageService.getItem<AtlasAppState | null>(STORAGE_KEYS.APP_STATE, null);

  if (storedState && storedState.profile && storedState.targetRole) {
    // Sync profile if stored separately
    return {
      ...storedState,
      profile: {
        ...storedState.profile,
        ...storedProfile
      }
    };
  }

  if (storedProfile && storedProfile.hasCompletedSetup) {
    return ProfileService.createCalibratedStateForProfile(storedProfile);
  }

  // Brand new unconfigured user state
  return ProfileService.createCalibratedStateForProfile(EMPTY_PROFILE);
}

interface AtlasContextType {
  state: AtlasAppState;
  roleDefinition: RoleDefinition;
  hasProfile: boolean;
  skillGaps: SkillGapDetail[];
  allocations: SkillAllocation[];
  careerReadiness: number;
  largestGap: SkillGapDetail;
  createProfile: (profile: UserProfile, initialRatings?: Record<string, number>, availabilityHours?: number) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  changeTargetRole: (newRole: string, customTitle?: string) => void;
  updateTargetRole: (role: string) => void;
  loadDemoProfile: () => void;
  updateAvailability: (hours: number) => void;
  updateSelfRatings: (ratings: Record<SkillKey, number>) => void;
  recordAssessmentAnswer: (questionId: string, answerIndex: number) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  toggleResourceStarted: (resourceId: string) => void;
  toggleRoadmapAction: (stepId: string, actionId: string) => void;
  completeRoadmapStep: (stepId: string) => void;
  addEvidence: (item: Omit<EvidenceItem, 'id'>) => void;
  updateEvidence: (item: EvidenceItem) => void;
  deleteEvidence: (id: string) => void;
  submitReassessment: (newRatings: Record<SkillKey, number>) => void;
  resetAtlas: () => void;
}

const AtlasContext = createContext<AtlasContextType | undefined>(undefined);

export const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AtlasAppState>(() => loadInitialState());

  // Derive current role definition dynamically
  const roleDefinition = useMemo(() => {
    return getRoleDefinition(state.targetRole || 'Data Analyst');
  }, [state.targetRole]);

  // Save to persistent storage whenever state changes
  useEffect(() => {
    StorageService.setItem(STORAGE_KEYS.APP_STATE, state);
    if (state.profile?.hasCompletedSetup) {
      StorageService.setItem(STORAGE_KEYS.PROFILE, state.profile);
    }
  }, [state]);

  // Hydrate profile and latest assessment from backend if user is authenticated with Supabase
  useEffect(() => {
    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      ProfileService.fetchRemoteProfile(token).then((result) => {
        if (result.success && result.profile && result.profile.hasCompletedSetup) {
          setState((prev) => {
            // Only update if current state was empty or matches the authenticated email
            if (!prev.profile?.hasCompletedSetup || prev.profile.email === result.profile!.email) {
              return ProfileService.createCalibratedStateForProfile(
                result.profile!,
                undefined,
                prev.availability
              );
            }
            return prev;
          });

          // Fetch latest assessment
          AssessmentApiService.fetchLatestAssessment(token).then((assessRes) => {
            if (assessRes.success && assessRes.data) {
              const latest = assessRes.data;
              const skillScores: Record<string, { baseline: number; demonstrated: number; threshold: number; gap: number }> = {};
              for (const diag of latest.skill_diagnostics) {
                skillScores[diag.skill_name] = {
                  baseline: diag.baseline_score,
                  demonstrated: diag.demonstrated_score,
                  threshold: diag.role_threshold,
                  gap: diag.gap,
                };
              }
              setState((prev) => ({
                ...prev,
                assessmentCompleted: true,
                assessmentResult: {
                  overallDemonstrated: latest.overall_demonstrated,
                  largestGapSkill: latest.largest_gap_skill,
                  skillScores,
                },
                lastUpdated: latest.completed_at || new Date().toISOString(),
              }));
            }
          });

          // Fetch candidate roadmap
          RoadmapApiService.fetchRoadmap(token).then((roadmapRes) => {
            if (roadmapRes.success && roadmapRes.data && roadmapRes.data.steps.length > 0) {
              const remoteSteps: RoadmapStep[] = roadmapRes.data.steps.map((s) => ({
                id: s.step_id,
                stepNumber: s.step_number,
                skill: s.skill_name as SkillKey,
                priority: s.priority as any,
                gap: s.gap,
                allocatedHours: s.allocated_hours,
                estimatedDurationWeeks: s.estimated_duration_weeks,
                title: s.title,
                description: s.description,
                completed: s.is_completed,
                completedActionIds: s.actions.filter((a) => a.is_completed).map((a) => a.action_id),
                actions: s.actions.map((a) => ({
                  id: a.action_id,
                  title: a.title,
                  description: a.description || '',
                  estimatedMinutes: a.estimated_minutes,
                  type: a.action_type,
                })),
              }));
              setState((prev) => ({
                ...prev,
                roadmapSteps: remoteSteps,
              }));
            }
          });

          // Fetch candidate resources
          ResourceApiService.fetchResourceStatuses(token).then((resRes) => {
            if (resRes.success && resRes.data && resRes.data.resources.length > 0) {
              const resMap: Record<string, { started: boolean; completed: boolean }> = {};
              for (const r of resRes.data.resources) {
                resMap[r.resource_id] = { started: r.is_started, completed: r.is_completed };
              }
              setState((prev) => ({
                ...prev,
                resourceStatus: { ...prev.resourceStatus, ...resMap },
              }));
            }
          });

          // Fetch candidate evidence
          EvidenceApiService.fetchEvidenceList(token).then((evRes) => {
            if (evRes.success && evRes.data && evRes.data.items.length > 0) {
              const remoteEvidence: EvidenceItem[] = evRes.data.items.map((e) => ({
                id: e.id,
                title: e.title,
                skill: e.skill_name as SkillKey,
                type: e.evidence_type,
                description: e.description,
                link: e.link,
                date: e.date,
                verificationStatus: e.verification_status,
                metrics: e.metrics,
                shaHash: e.sha_hash,
                evaluatorFeedback: e.evaluator_feedback,
              }));
              setState((prev) => ({
                ...prev,
                evidence: remoteEvidence,
              }));
            }
          });

          // Fetch latest candidate reassessment
          ReassessmentApiService.fetchLatestReassessment(token).then((reassessRes) => {
            if (reassessRes.success && reassessRes.data) {
              const r = reassessRes.data;
              setState((prev) => ({
                ...prev,
                reassessment: {
                  completed: true,
                  timestamp: r.created_at || new Date().toISOString(),
                  previousOverallScore: r.previous_overall_score,
                  currentOverallScore: r.current_overall_score,
                  improvement: r.improvement,
                  skillDeltas: r.skill_deltas,
                },
              }));
            }
          });
        }
      });
    }
  }, []);

  const hasProfile = Boolean(state.profile?.hasCompletedSetup && state.profile?.fullName);

  // Dynamically derive demonstrated scores from assessment result or self ratings
  const demonstratedMap = useMemo(() => {
    const map: Record<SkillKey, number> = {};
    const scores = state.assessmentResult?.skillScores;
    if (scores) {
      for (const k of Object.keys(scores)) {
        map[k] = scores[k].demonstrated;
      }
    }
    return map;
  }, [state.assessmentResult]);

  // Dynamic skill gaps calculated for the active role
  const skillGaps = useMemo(() => {
    return calculateSkillGaps(roleDefinition, state.selfRatings, demonstratedMap);
  }, [roleDefinition, state.selfRatings, demonstratedMap]);

  // Dynamic resource allocation weighted by deficits
  const allocations = useMemo(() => {
    return calculateResourceAllocation(state.availability, skillGaps);
  }, [state.availability, skillGaps]);

  // Career readiness percentage
  const careerReadiness = useMemo(() => {
    if (!state.assessmentCompleted) {
      // Average of baseline self-ratings vs threshold
      const sumBaseline = Object.values(state.selfRatings).reduce((a, b) => a + b, 0);
      const count = Math.max(Object.keys(state.selfRatings).length, 1);
      return Math.round(sumBaseline / count);
    }
    return state.assessmentResult?.overallDemonstrated ?? 0;
  }, [state.assessmentCompleted, state.assessmentResult, state.selfRatings]);

  // Largest competency gap detail
  const largestGap = useMemo(() => {
    if (skillGaps.length > 0) return skillGaps[0];
    const defaultSkill = roleDefinition.skills[0]?.name || 'Core Skill';
    return {
      skill: defaultSkill,
      displayName: defaultSkill,
      baseline: 50,
      demonstrated: 50,
      roleThreshold: 80,
      gap: 30,
      priority: 'HIGH PRIORITY' as const,
      description: 'Primary competency deficit under active calibration.',
      strategicNote: 'Focus initial sprints here.',
      evidenceStatus: 'Missing' as const
    };
  }, [skillGaps, roleDefinition]);

  // Actions
  const createProfile = useCallback(
    (profile: UserProfile, initialRatings?: Record<string, number>, availabilityHours: number = 10) => {
      const updatedProfile = { ...profile, hasCompletedSetup: true };
      const newState = ProfileService.createCalibratedStateForProfile(
        updatedProfile,
        initialRatings,
        availabilityHours
      );
      setState(newState);

      // Persist to backend if authenticated
      const token = SupabaseAuthService.getAccessToken();
      if (token) {
        ProfileService.saveRemoteProfile(updatedProfile, token, availabilityHours).catch((err) => {
          console.warn('[AtlasContext] Remote profile sync failed:', err);
        });
      }
    },
    []
  );

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => {
      const updatedProfile = { ...prev.profile, ...updates };

      if (updatedProfile.hasCompletedSetup) {
        const token = SupabaseAuthService.getAccessToken();
        if (token) {
          ProfileService.saveRemoteProfile(updatedProfile, token, prev.availability).catch((err) => {
            console.warn('[AtlasContext] Remote profile update sync failed:', err);
          });
        }
      }

      return {
        ...prev,
        profile: updatedProfile,
        targetRole: updatedProfile.targetRole || prev.targetRole,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const changeTargetRole = useCallback((newRole: string, customTitle?: string) => {
    setState((prev) => {
      const targetRoleName = customTitle || newRole;
      const updatedProfile = {
        ...prev.profile,
        targetRole: targetRoleName,
        customRole: customTitle
      };
      // Recalibrate state for the new role
      return ProfileService.createCalibratedStateForProfile(updatedProfile, undefined, prev.availability);
    });
  }, []);

  const loadDemoProfile = useCallback(() => {
    const demoState = ProfileService.getDemoState();
    setState(demoState);
  }, []);

  const updateAvailability = useCallback((hours: number) => {
    setState((prev) => {
      const newAllocations = calculateResourceAllocation(hours, skillGaps);
      const newRoadmap = generateRoadmap(roleDefinition, skillGaps, newAllocations);
      return {
        ...prev,
        availability: hours,
        roadmapSteps: newRoadmap,
        lastUpdated: new Date().toISOString()
      };
    });
  }, [skillGaps, roleDefinition]);

  const updateSelfRatings = useCallback((ratings: Record<SkillKey, number>) => {
    setState((prev) => {
      const merged = { ...prev.selfRatings, ...ratings };
      const updatedGaps = calculateSkillGaps(roleDefinition, merged, demonstratedMap);
      const updatedAlloc = calculateResourceAllocation(prev.availability, updatedGaps);
      const updatedRoadmap = generateRoadmap(roleDefinition, updatedGaps, updatedAlloc);
      return {
        ...prev,
        selfRatings: merged,
        roadmapSteps: updatedRoadmap,
        lastUpdated: new Date().toISOString()
      };
    });
  }, [roleDefinition, demonstratedMap]);

  const recordAssessmentAnswer = useCallback((questionId: string, answerIndex: number) => {
    setState((prev) => ({
      ...prev,
      assessmentAnswers: {
        ...prev.assessmentAnswers,
        [questionId]: answerIndex
      },
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const completeAssessment = useCallback(() => {
    setState((prev) => {
      const result = scoreAssessmentAnswers(roleDefinition, prev.assessmentAnswers, prev.selfRatings);
      const demonstrated: Record<SkillKey, number> = {};
      for (const k of Object.keys(result.skillScores)) {
        demonstrated[k] = result.skillScores[k].demonstrated;
      }

      const calculatedGaps = calculateSkillGaps(roleDefinition, prev.selfRatings, demonstrated);
      const newAllocations = calculateResourceAllocation(prev.availability, calculatedGaps);
      const newRoadmap = generateRoadmap(roleDefinition, calculatedGaps, newAllocations);

      return {
        ...prev,
        assessmentCompleted: true,
        assessmentResult: result,
        roadmapSteps: newRoadmap,
        lastUpdated: new Date().toISOString()
      };
    });
  }, [roleDefinition]);

  const resetAssessment = useCallback(() => {
    setState((prev) => ({
      ...prev,
      assessmentAnswers: {},
      assessmentCompleted: false,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const toggleResourceStarted = useCallback((resourceId: string) => {
    setState((prev) => {
      const current = prev.resourceStatus[resourceId] || { started: false, completed: false };
      const newStarted = !current.started;

      const token = SupabaseAuthService.getAccessToken();
      if (token) {
        ResourceApiService.updateResourceStatus(resourceId, newStarted, token).catch((err) => {
          console.warn('[AtlasContext] Error syncing resource status to backend:', err);
        });
      }

      return {
        ...prev,
        resourceStatus: {
          ...prev.resourceStatus,
          [resourceId]: { ...current, started: newStarted }
        },
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const toggleRoadmapAction = useCallback((stepId: string, actionId: string) => {
    setState((prev) => {
      let isNowCompleted = false;
      const updatedSteps = prev.roadmapSteps.map((step) => {
        if (step.id !== stepId) return step;

        const isCompleted = step.completedActionIds.includes(actionId);
        isNowCompleted = !isCompleted;
        const newCompletedIds = isCompleted
          ? step.completedActionIds.filter((id) => id !== actionId)
          : [...step.completedActionIds, actionId];

        const allDone = newCompletedIds.length === step.actions.length && step.actions.length > 0;

        return {
          ...step,
          completedActionIds: newCompletedIds,
          completed: allDone
        };
      });

      const token = SupabaseAuthService.getAccessToken();
      if (token) {
        RoadmapApiService.updateRoadmapAction(actionId, isNowCompleted, token).catch((err) => {
          console.warn('[AtlasContext] Error syncing roadmap action status to backend:', err);
        });
      }

      return {
        ...prev,
        roadmapSteps: updatedSteps,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const completeRoadmapStep = useCallback((stepId: string) => {
    setState((prev) => {
      const updatedSteps = prev.roadmapSteps.map((step) => {
        if (step.id !== stepId) return step;
        return {
          ...step,
          completed: true,
          completedActionIds: step.actions.map((a) => a.id)
        };
      });

      return {
        ...prev,
        roadmapSteps: updatedSteps,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const addEvidence = useCallback((item: Omit<EvidenceItem, 'id'>) => {
    const newItem: EvidenceItem = {
      ...item,
      id: `ev-${Date.now().toString(36)}`
    };

    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      EvidenceApiService.createEvidence(item, token).then((res) => {
        if (res.success && res.data) {
          setState((prev) => ({
            ...prev,
            evidence: prev.evidence.map((e) => (e.id === newItem.id ? { ...e, id: res.data!.id } : e)),
          }));
        }
      }).catch((err) => {
        console.warn('[AtlasContext] Error creating evidence on backend:', err);
      });
    }

    setState((prev) => ({
      ...prev,
      evidence: [newItem, ...prev.evidence],
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const updateEvidence = useCallback((updated: EvidenceItem) => {
    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      EvidenceApiService.updateEvidence(updated.id, updated, token).catch((err) => {
        console.warn('[AtlasContext] Error updating evidence on backend:', err);
      });
    }

    setState((prev) => ({
      ...prev,
      evidence: prev.evidence.map((e) => (e.id === updated.id ? updated : e)),
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const deleteEvidence = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((e) => e.id !== id),
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  const submitReassessment = useCallback((newRatings: Record<SkillKey, number>) => {
    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      ReassessmentApiService.submitReassessment(newRatings, token).then((res) => {
        if (res.success && res.data) {
          // Re-fetch adapted roadmap
          RoadmapApiService.fetchRoadmap(token).then((roadmapRes) => {
            if (roadmapRes.success && roadmapRes.data && roadmapRes.data.steps.length > 0) {
              const remoteSteps: RoadmapStep[] = roadmapRes.data.steps.map((s) => ({
                id: s.step_id,
                stepNumber: s.step_number,
                skill: s.skill_name as SkillKey,
                priority: s.priority as any,
                gap: s.gap,
                allocatedHours: s.allocated_hours,
                estimatedDurationWeeks: s.estimated_duration_weeks,
                title: s.title,
                description: s.description,
                completed: s.is_completed,
                completedActionIds: s.actions.filter((a) => a.is_completed).map((a) => a.action_id),
                actions: s.actions.map((a) => ({
                  id: a.action_id,
                  title: a.title,
                  description: a.description || '',
                  estimatedMinutes: a.estimated_minutes,
                  type: a.action_type,
                })),
              }));
              setState((prev) => ({
                ...prev,
                roadmapSteps: remoteSteps,
              }));
            }
          });
        }
      }).catch((err) => {
        console.warn('[AtlasContext] Error submitting reassessment to backend:', err);
      });
    }

    setState((prev) => {
      const prevScore = prev.assessmentResult.overallDemonstrated;
      const sum = Object.values(newRatings).reduce((a, b) => a + b, 0);
      const newScore = Math.round(sum / Math.max(Object.keys(newRatings).length, 1));
      const uplift = newScore - prevScore;

      const deltas: Record<string, { previous: number; current: number; change: number }> = {};
      for (const skill of Object.keys(newRatings)) {
        const previousVal = prev.selfRatings[skill] ?? 50;
        deltas[skill] = {
          previous: previousVal,
          current: newRatings[skill],
          change: newRatings[skill] - previousVal
        };
      }

      return {
        ...prev,
        selfRatings: { ...prev.selfRatings, ...newRatings },
        reassessment: {
          completed: true,
          timestamp: new Date().toISOString(),
          previousOverallScore: prevScore,
          currentOverallScore: newScore,
          improvement: uplift,
          skillDeltas: deltas
        },
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const resetAtlas = useCallback(() => {
    StorageService.clearAll();
    const fresh = ProfileService.createCalibratedStateForProfile(EMPTY_PROFILE);
    setState(fresh);
  }, []);

  const value = {
    state,
    roleDefinition,
    hasProfile,
    skillGaps,
    allocations,
    careerReadiness,
    largestGap,
    createProfile,
    updateProfile,
    changeTargetRole,
    updateTargetRole: changeTargetRole,
    loadDemoProfile,
    updateAvailability,
    updateSelfRatings,
    recordAssessmentAnswer,
    completeAssessment,
    resetAssessment,
    toggleResourceStarted,
    toggleRoadmapAction,
    completeRoadmapStep,
    addEvidence,
    updateEvidence,
    deleteEvidence,
    submitReassessment,
    resetAtlas
  };

  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
};

export const useAtlas = (): AtlasContextType => {
  const context = useContext(AtlasContext);
  if (!context) {
    throw new Error('useAtlas must be used within an AtlasProvider');
  }
  return context;
};

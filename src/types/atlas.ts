export type SkillKey = string;

export type ExperienceLevel = 'Beginner' | 'Student' | 'Fresher' | 'Early Career' | 'Experienced';

export type CurrentYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Final Year' | 'Graduated';

export type PriorityLevel = 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  college: string;
  degree: string;
  year: CurrentYear;
  experienceLevel: ExperienceLevel;
  targetRole: string;
  customRole?: string;
  hasCompletedSetup: boolean;
}

export interface SkillRating {
  skill: SkillKey;
  score: number; // 0 - 100
}

export type QuestionDifficulty = 'Foundation' | 'Applied' | 'Advanced';

export type QuestionType = 'theory' | 'coding';

export interface AssessmentQuestion {
  id: string;
  skill: SkillKey;
  difficulty: QuestionDifficulty;
  domain: string;
  type?: QuestionType;
  // Theory specific fields
  question?: string;
  options?: string[];
  correctAnswer?: number;
  // Coding specific fields
  title?: string;
  prompt?: string;
  code?: string;
  expectedOutput?: string;
  // Common
  scenarioContext?: string;
  explanation: string;
}

export interface SkillGapDetail {
  skill: SkillKey;
  displayName: string;
  baseline: number;
  demonstrated: number;
  roleThreshold: number;
  gap: number;
  priority: PriorityLevel;
  description: string;
  strategicNote: string;
  evidenceStatus: 'Missing' | 'Moderate' | 'Strong' | 'Unverified';
}

export type ResourceType = 'Course' | 'Tutorial' | 'Practice' | 'Project' | 'Documentation';

export interface LearningResource {
  id: string;
  title: string;
  skill: SkillKey;
  type: ResourceType;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  description: string;
  provider: string;
  url?: string;
}

export interface SkillAllocation {
  skill: SkillKey;
  gap: number;
  priority: PriorityLevel;
  allocatedHours: number;
  percentage: number;
}

export interface RoadmapAction {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  type: 'Learn' | 'Practice' | 'Build' | 'Defend';
}

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  skill: SkillKey;
  priority: PriorityLevel;
  gap: number;
  allocatedHours: number;
  estimatedDurationWeeks: string;
  title: string;
  description: string;
  actions: RoadmapAction[];
  completed: boolean;
  completedActionIds: string[];
}

export type EvidenceType = 'Project' | 'Dashboard' | 'Certificate' | 'GitHub Repository' | 'Presentation' | 'Case Study';

export interface EvidenceItem {
  id: string;
  title: string;
  skill: SkillKey;
  type: EvidenceType;
  description: string;
  link: string;
  date: string;
  verificationStatus: 'Verified' | 'Under Review' | 'Submitted';
  metrics?: string;
  shaHash?: string;
  evaluatorFeedback?: string;
}

export interface ReassessmentResult {
  completed: boolean;
  timestamp?: string;
  previousOverallScore: number;
  currentOverallScore: number;
  improvement: number;
  skillDeltas: Record<SkillKey, {
    previous: number;
    current: number;
    change: number;
  }>;
}

export interface RoleSkillConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  targetThreshold: number;
  defaultBaseline: number;
  assessmentTopics: string[];
  resourceTopics: string[];
  rolePrerequisite: string;
  criticalDeficitDescription: string;
  onTrackDescription: string;
  learningActions: {
    title: string;
    description: string;
    type: 'Learn' | 'Practice' | 'Build' | 'Defend';
    estimatedMinutes: number;
  }[];
  learningResources: LearningResource[];
  assessmentQuestions: AssessmentQuestion[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  roleThreshold: number;
  requiredSkills: string[];
  skills: RoleSkillConfig[];
}

export interface AtlasAppState {
  version: string;
  profile: UserProfile;
  targetRole: string;
  availability: number; // hours per week
  selfRatings: Record<SkillKey, number>;
  assessmentAnswers: Record<string, number>;
  codingAnswers?: Record<string, { submittedText: string; status: 'correct' | 'incorrect' | 'skipped' }>;
  assessmentCompleted: boolean;
  assessmentResult: {
    overallDemonstrated: number;
    largestGapSkill: SkillKey;
    theoryScore?: number;
    codingScore?: number;
    theoryCorrectCount?: number;
    theoryTotalCount?: number;
    codingCorrectCount?: number;
    codingSkippedCount?: number;
    codingTotalCount?: number;
    theoryPerformance?: Record<string, 'demonstrated' | 'not_demonstrated'>;
    codingPerformance?: Record<string, 'demonstrated' | 'not_demonstrated' | 'skipped'>;
    competencyStatus?: Record<string, 'demonstrated' | 'not_demonstrated' | 'skipped'>;
    skillScores: Record<SkillKey, {
      baseline: number;
      demonstrated: number;
      threshold: number;
      gap: number;
      theoryPerformance?: string;
      codingPerformance?: string;
      competencyStatus?: 'demonstrated' | 'gap_signal' | 'skipped';
    }>;
  };
  resourceStatus: Record<string, { started: boolean; completed: boolean }>;
  roadmapSteps: RoadmapStep[];
  evidence: EvidenceItem[];
  reassessment: ReassessmentResult;
  lastUpdated: string;
}

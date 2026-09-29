export type AccountType = 'candidate' | 'employer';

export type EmployerVerificationStatus = 'pending' | 'verified';

export type OpportunityStatus = 'active' | 'closed';

export interface EmployerProfile {
  id: string;
  companyName: string;
  companyWebsite: string;
  companyEmail: string;
  industry: string;
  companySize: string;
  companyLocation: string;
  companyDescription: string;
  companyLogoText?: string;
  verificationStatus: EmployerVerificationStatus;
  verifiedAt?: string;
}

export interface OpportunityRequirement {
  skill: string;
  type: 'required' | 'preferred';
  minLevel: number; // 0 - 100
}

export interface Opportunity {
  id: string;
  jobTitle: string;
  company: string;
  companyLogoText?: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  targetRoleCategory: string; // e.g. 'Data Analyst', 'Frontend Developer', etc.
  experienceLevel: 'Beginner' | 'Student' | 'Fresher' | 'Early Career' | 'Experienced';
  shortDescription: string;
  fullDescription: string;
  salaryRange?: string;
  postedDate: string;
  requirements: OpportunityRequirement[];
  requiredEvidenceTypes: string[];
  isEmployerPosted?: boolean;
  status?: OpportunityStatus;
  matchedCount?: number;
  interestedCount?: number;
}

export interface SkillMatchComparison {
  skill: string;
  candidateLevel: number;
  requiredLevel: number;
  isMet: boolean;
  isPreferred: boolean;
  deficit: number;
}

export interface EvidenceMatchItem {
  title: string;
  hasEvidence: boolean;
  matchedSkill?: string;
}

export interface OpportunityMatchResult {
  overallMatch: number;
  compatibilityLabel: string;
  skillMatches: SkillMatchComparison[];
  matchedRequirements: string[];
  developmentGaps: {
    skill: string;
    candidateLevel: number;
    requiredLevel: number;
    deficit: number;
  }[];
  evidenceMatches: EvidenceMatchItem[];
  careerAlignment: number;
  primaryGapSkill: string;
  recommendationSummary: string;
}

export interface CandidateVisibilitySettings {
  allowDiscover: boolean;
  allowContact: boolean;
  showPortfolioEvidence: boolean;
  showSkillInfo: boolean;
}

export interface EmployerCandidate {
  id: string;
  name: string;
  targetRole: string;
  experienceLevel: string;
  overallMatch: number;
  keySkills: string[];
  evidenceCount: number;
  primaryDevelopmentGap: string;
  demonstratedSkills: { skill: string; level: number }[];
  verifiedEvidence: {
    id: string;
    title: string;
    skill: string;
    type: string;
    date: string;
    isPublic: boolean;
  }[];
  roadmapProgress: {
    currentMilestone: string;
    progressPercent: number;
    completedSprints: number;
    totalSprints: number;
  };
  isDiscoverable: boolean;
}

export interface ApplicationInterest {
  opportunityId: string;
  candidateId: string;
  submittedAt: string;
  status: 'submitted' | 'reviewed' | 'shortlisted';
}

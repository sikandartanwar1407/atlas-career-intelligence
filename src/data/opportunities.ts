import {
  Opportunity,
  OpportunityMatchResult,
  SkillMatchComparison,
  EvidenceMatchItem,
  CandidateVisibilitySettings,
  EmployerCandidate,
  ApplicationInterest
} from '../types/opportunities';
import { UserProfile, EvidenceItem } from '../types/atlas';

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-acme-da',
    jobTitle: 'Junior Data Analyst',
    company: 'Acme Analytics',
    companyLogoText: 'AA',
    location: 'Remote',
    employmentType: 'Full-time',
    targetRoleCategory: 'Data Analyst',
    experienceLevel: 'Fresher',
    salaryRange: '$65,000 – $80,000',
    postedDate: '2 days ago',
    status: 'active',
    matchedCount: 24,
    interestedCount: 5,
    shortDescription: 'Strong alignment across SQL, Excel and data analysis with verified portfolio evidence.',
    fullDescription:
      'Acme Analytics is looking for a Junior Data Analyst to partner with client delivery teams. You will write robust SQL queries to transform raw data, maintain cross-functional dashboards in Power BI and Excel, and present synthesized business insights to departmental leads.',
    requirements: [
      { skill: 'SQL', type: 'required', minLevel: 70 },
      { skill: 'Power BI', type: 'required', minLevel: 65 },
      { skill: 'Excel', type: 'required', minLevel: 60 },
      { skill: 'Data Storytelling', type: 'required', minLevel: 65 },
      { skill: 'Python', type: 'preferred', minLevel: 50 },
    ],
    requiredEvidenceTypes: [
      'SQL Portfolio Project',
      'Sales Analytics Project',
      'Excel Dashboard',
    ],
  },
  {
    id: 'opp-vanguard-ba',
    jobTitle: 'Associate Business Analyst',
    company: 'Vanguard Horizon',
    companyLogoText: 'VH',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Full-time',
    targetRoleCategory: 'Business Analyst',
    experienceLevel: 'Fresher',
    salaryRange: '$72,000 – $88,000',
    postedDate: '3 days ago',
    status: 'active',
    matchedCount: 31,
    interestedCount: 7,
    shortDescription: 'Collaborate with product and operations to translate ambiguous operational needs into actionable engineering specs.',
    fullDescription:
      'Vanguard Horizon seeks an Associate Business Analyst to bridge technology and operations. You will elicit stakeholder requirements, document As-Is and To-Be workflows in BPMN, run SQL queries for validation, and present executive business cases.',
    requirements: [
      { skill: 'Requirements Elicitation', type: 'required', minLevel: 65 },
      { skill: 'SQL', type: 'required', minLevel: 60 },
      { skill: 'Process Modeling', type: 'required', minLevel: 60 },
      { skill: 'Data Storytelling', type: 'required', minLevel: 65 },
      { skill: 'Excel', type: 'preferred', minLevel: 70 },
    ],
    requiredEvidenceTypes: [
      'Process Re-engineering Case',
      'User Story Spec',
      'SQL Validation Script',
    ],
  },
  {
    id: 'opp-loomis-fe',
    jobTitle: 'Junior Frontend Developer',
    company: 'Loomis Media Labs',
    companyLogoText: 'LM',
    location: 'Remote',
    employmentType: 'Full-time',
    targetRoleCategory: 'Frontend Developer',
    experienceLevel: 'Early Career',
    salaryRange: '$78,000 – $92,000',
    postedDate: '5 days ago',
    status: 'active',
    matchedCount: 18,
    interestedCount: 4,
    shortDescription: 'Build reactive, accessible user interfaces using TypeScript, modern React, and responsive Tailwind CSS.',
    fullDescription:
      'We are expanding our consumer web products and need a Junior Frontend Developer with an eye for design fidelity, component reusability, and clean state management. You will work alongside senior engineers building scalable user journeys.',
    requirements: [
      { skill: 'React', type: 'required', minLevel: 70 },
      { skill: 'JavaScript / TypeScript', type: 'required', minLevel: 70 },
      { skill: 'CSS / Tailwind', type: 'required', minLevel: 65 },
      { skill: 'Web Accessibility', type: 'preferred', minLevel: 55 },
      { skill: 'Git & Code Review', type: 'required', minLevel: 60 },
    ],
    requiredEvidenceTypes: [
      'Responsive Web Application',
      'Interactive Design System Library',
    ],
  },
  {
    id: 'opp-kestrel-ds',
    jobTitle: 'Junior Data Scientist',
    company: 'Kestrel Applied AI',
    companyLogoText: 'KA',
    location: 'Boston, MA (Hybrid)',
    employmentType: 'Full-time',
    targetRoleCategory: 'Data Scientist',
    experienceLevel: 'Fresher',
    salaryRange: '$85,000 – $105,000',
    postedDate: '1 day ago',
    status: 'active',
    matchedCount: 15,
    interestedCount: 3,
    shortDescription: 'Statistical modeling, exploratory data analysis, and predictive feature engineering on high-volume production datasets.',
    fullDescription:
      'Join our research and product analytics team to evaluate machine learning prototypes. You will manipulate multi-terabyte datasets using Python, test statistical hypotheses, build validated regression models, and communicate findings to machine learning engineers.',
    requirements: [
      { skill: 'Python', type: 'required', minLevel: 75 },
      { skill: 'Machine Learning', type: 'required', minLevel: 65 },
      { skill: 'SQL', type: 'required', minLevel: 70 },
      { skill: 'Statistics & Probability', type: 'required', minLevel: 70 },
      { skill: 'Data Visualization', type: 'preferred', minLevel: 60 },
    ],
    requiredEvidenceTypes: [
      'Predictive Modeling Notebook',
      'Feature Engineering Pipeline',
    ],
  },
  {
    id: 'opp-aether-fs',
    jobTitle: 'Junior Full Stack Engineer',
    company: 'Aether Cloud Systems',
    companyLogoText: 'AC',
    location: 'San Francisco, CA',
    employmentType: 'Full-time',
    targetRoleCategory: 'Full Stack Developer',
    experienceLevel: 'Fresher',
    salaryRange: '$88,000 – $110,000',
    postedDate: '4 days ago',
    status: 'active',
    matchedCount: 21,
    interestedCount: 6,
    shortDescription: 'End-to-end feature delivery across TypeScript REST APIs, relational PostgreSQL databases, and modern React interfaces.',
    fullDescription:
      'Aether is building next-generation developer tooling. In this role, you will implement client components, extend backend endpoint contracts, optimize database indexes, and deploy automated test suites.',
    requirements: [
      { skill: 'TypeScript', type: 'required', minLevel: 68 },
      { skill: 'Node.js', type: 'required', minLevel: 65 },
      { skill: 'SQL', type: 'required', minLevel: 65 },
      { skill: 'React', type: 'required', minLevel: 65 },
      { skill: 'API Architecture', type: 'preferred', minLevel: 55 },
    ],
    requiredEvidenceTypes: [
      'Full Stack Web Application',
      'REST API Documentation',
    ],
  },
  {
    id: 'opp-crestline-pm',
    jobTitle: 'Associate Product Manager',
    company: 'Crestline Financial',
    companyLogoText: 'CF',
    location: 'Chicago, IL (Hybrid)',
    employmentType: 'Full-time',
    targetRoleCategory: 'Product Manager',
    experienceLevel: 'Early Career',
    salaryRange: '$80,000 – $96,000',
    postedDate: 'Just now',
    status: 'active',
    matchedCount: 14,
    interestedCount: 2,
    shortDescription: 'Own product telemetry, prioritize sprint backlogs, define user stories, and track product adoption metrics.',
    fullDescription:
      'We are looking for an Associate PM who thrives on data-informed decision making. You will interview customers, track sprint velocity, analyze funnel drop-offs with SQL, and deliver crisp PRDs to engineering leads.',
    requirements: [
      { skill: 'Product Discovery', type: 'required', minLevel: 65 },
      { skill: 'Data Storytelling', type: 'required', minLevel: 70 },
      { skill: 'User Research', type: 'required', minLevel: 60 },
      { skill: 'SQL', type: 'preferred', minLevel: 55 },
      { skill: 'Sprint Planning', type: 'required', minLevel: 65 },
    ],
    requiredEvidenceTypes: [
      'Product Requirements Document (PRD)',
      'Funnel Analysis & Metrics Brief',
    ],
  },
];

export const DEFAULT_VISIBILITY_SETTINGS: CandidateVisibilitySettings = {
  allowDiscover: true,
  allowContact: true,
  showPortfolioEvidence: true,
  showSkillInfo: true,
};

export const MOCK_EMPLOYER_CANDIDATES: EmployerCandidate[] = [
  {
    id: 'cand-001',
    name: 'Candidate A',
    targetRole: 'Data Analyst',
    experienceLevel: 'Fresher',
    overallMatch: 94,
    keySkills: ['SQL', 'Excel', 'Power BI', 'Data Storytelling'],
    evidenceCount: 3,
    primaryDevelopmentGap: 'Advanced Power BI DAX formulas',
    demonstratedSkills: [
      { skill: 'SQL', level: 86 },
      { skill: 'Excel', level: 82 },
      { skill: 'Power BI', level: 74 },
      { skill: 'Data Storytelling', level: 78 },
      { skill: 'Python', level: 62 },
    ],
    verifiedEvidence: [
      {
        id: 'ev-1',
        title: 'Executive Sales Pipeline Dashboard',
        skill: 'Power BI',
        type: 'Dashboard Project',
        date: '2025-02-14',
        isPublic: true,
      },
      {
        id: 'ev-2',
        title: 'E-commerce Cohort Retention Analysis',
        skill: 'SQL',
        type: 'Analysis Script',
        date: '2025-02-02',
        isPublic: true,
      },
      {
        id: 'ev-3',
        title: 'Dynamic Financial Planning Model',
        skill: 'Excel',
        type: 'Workbook Model',
        date: '2025-01-20',
        isPublic: true,
      },
    ],
    roadmapProgress: {
      currentMilestone: 'Sprint 04: Production DAX & Data Modelling',
      progressPercent: 78,
      completedSprints: 5,
      totalSprints: 7,
    },
    isDiscoverable: true,
  },
  {
    id: 'cand-002',
    name: 'Candidate B',
    targetRole: 'Data Analyst',
    experienceLevel: 'Student',
    overallMatch: 88,
    keySkills: ['SQL', 'Python', 'Excel'],
    evidenceCount: 2,
    primaryDevelopmentGap: 'Power BI Service Administration',
    demonstratedSkills: [
      { skill: 'SQL', level: 80 },
      { skill: 'Excel', level: 75 },
      { skill: 'Python', level: 72 },
      { skill: 'Power BI', level: 58 },
      { skill: 'Data Storytelling', level: 68 },
    ],
    verifiedEvidence: [
      {
        id: 'ev-4',
        title: 'Healthcare Patient Flow Pipeline',
        skill: 'SQL',
        type: 'ETL Pipeline',
        date: '2025-02-10',
        isPublic: true,
      },
      {
        id: 'ev-5',
        title: 'Marketing Spend Attribution Notebook',
        skill: 'Python',
        type: 'Jupyter Analysis',
        date: '2025-01-15',
        isPublic: true,
      },
    ],
    roadmapProgress: {
      currentMilestone: 'Sprint 03: Interactive Dashboarding',
      progressPercent: 65,
      completedSprints: 4,
      totalSprints: 7,
    },
    isDiscoverable: true,
  },
  {
    id: 'cand-003',
    name: 'Candidate C',
    targetRole: 'Data Analyst',
    experienceLevel: 'Early Career',
    overallMatch: 82,
    keySkills: ['Excel', 'Data Storytelling', 'SQL'],
    evidenceCount: 2,
    primaryDevelopmentGap: 'Relational Database Schema Design',
    demonstratedSkills: [
      { skill: 'Excel', level: 85 },
      { skill: 'Data Storytelling', level: 79 },
      { skill: 'SQL', level: 66 },
      { skill: 'Power BI', level: 60 },
      { skill: 'Python', level: 48 },
    ],
    verifiedEvidence: [
      {
        id: 'ev-6',
        title: 'Quarterly Executive Business Review Deck',
        skill: 'Data Storytelling',
        type: 'Slide Deck',
        date: '2025-02-08',
        isPublic: true,
      },
      {
        id: 'ev-7',
        title: 'Inventory Forecasting Model',
        skill: 'Excel',
        type: 'Spreadsheet',
        date: '2025-01-25',
        isPublic: true,
      },
    ],
    roadmapProgress: {
      currentMilestone: 'Sprint 02: Advanced Window Functions in SQL',
      progressPercent: 52,
      completedSprints: 3,
      totalSprints: 7,
    },
    isDiscoverable: true,
  },
  {
    id: 'cand-004',
    name: 'Candidate D',
    targetRole: 'Business Analyst',
    experienceLevel: 'Fresher',
    overallMatch: 79,
    keySkills: ['Requirements Elicitation', 'Process Modeling', 'SQL'],
    evidenceCount: 2,
    primaryDevelopmentGap: 'Power BI Data Modeling',
    demonstratedSkills: [
      { skill: 'Requirements Elicitation', level: 75 },
      { skill: 'Process Modeling', level: 70 },
      { skill: 'SQL', level: 64 },
      { skill: 'Excel', level: 68 },
    ],
    verifiedEvidence: [
      {
        id: 'ev-8',
        title: 'BPMN As-Is to To-Be Banking Workflow',
        skill: 'Process Modeling',
        type: 'Process Map',
        date: '2025-02-01',
        isPublic: true,
      },
    ],
    roadmapProgress: {
      currentMilestone: 'Sprint 02: Stakeholder Interview Frameworks',
      progressPercent: 48,
      completedSprints: 2,
      totalSprints: 6,
    },
    isDiscoverable: true,
  },
];

// LocalStorage helpers to simulate future Supabase/Firebase queries
const STORAGE_KEYS = {
  OPPORTUNITIES: 'atlas_opportunities_v1',
  VISIBILITY: 'atlas_candidate_visibility_v1',
  INTERESTS: 'atlas_application_interests_v1',
};

export function getOpportunities(): Opportunity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
    if (!raw) return INITIAL_OPPORTUNITIES;
    const custom = JSON.parse(raw);
    return [...INITIAL_OPPORTUNITIES, ...custom];
  } catch {
    return INITIAL_OPPORTUNITIES;
  }
}

export function getOpportunityById(id: string): Opportunity | undefined {
  const all = getOpportunities();
  return all.find((o) => o.id === id);
}

export function saveOpportunity(
  newOpp: Omit<Opportunity, 'id' | 'postedDate' | 'isEmployerPosted'>
): Opportunity {
  const allCustom = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const created: Opportunity = {
    ...newOpp,
    id: `opp-${Date.now()}`,
    postedDate: 'Just now',
    isEmployerPosted: true,
    status: 'active',
    matchedCount: Math.floor(Math.random() * 15) + 12,
    interestedCount: 0,
  };

  allCustom.unshift(created);
  localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(allCustom));
  return created;
}

export function toggleOpportunityStatus(id: string): Opportunity | undefined {
  const allCustom = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const existingCustom = allCustom.find((o: Opportunity) => o.id === id);
  if (existingCustom) {
    existingCustom.status = existingCustom.status === 'closed' ? 'active' : 'closed';
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(allCustom));
    return existingCustom;
  }

  // If it is in INITIAL_OPPORTUNITIES, create an overridden entry in custom
  const initialOpp = INITIAL_OPPORTUNITIES.find((o) => o.id === id);
  if (initialOpp) {
    const newStatus = initialOpp.status === 'closed' ? 'active' : 'closed';
    const modified: Opportunity = {
      ...initialOpp,
      status: newStatus,
    };
    allCustom.unshift(modified);
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(allCustom));
    return modified;
  }

  return undefined;
}

export function getCandidateVisibility(): CandidateVisibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISIBILITY);
    return raw ? JSON.parse(raw) : DEFAULT_VISIBILITY_SETTINGS;
  } catch {
    return DEFAULT_VISIBILITY_SETTINGS;
  }
}

export function saveCandidateVisibility(settings: CandidateVisibilitySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VISIBILITY, JSON.stringify(settings));
  } catch {
    // silent fallback
  }
}

export function getSubmittedInterests(): ApplicationInterest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordApplicationInterest(opportunityId: string, candidateId = 'self'): void {
  try {
    const existing = getSubmittedInterests();
    if (!existing.some((item) => item.opportunityId === opportunityId)) {
      existing.push({
        opportunityId,
        candidateId,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      });
      localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(existing));
    }
  } catch {
    // silent fallback
  }
}

export function hasExpressedInterest(opportunityId: string): boolean {
  const existing = getSubmittedInterests();
  return existing.some((item) => item.opportunityId === opportunityId);
}

/**
 * Deterministic Opportunity Matching Engine
 * Compares candidate profile, skill ratings, and evidence against role requirements.
 */
export function calculateOpportunityMatch(
  candidateProfile: UserProfile | null,
  candidateSkills: Record<string, number>, // skill name -> level 0..100
  candidateEvidence: EvidenceItem[] = [],
  opportunity: Opportunity
): OpportunityMatchResult {
  // If candidate has no scores yet, baseline defaults
  const effectiveCandidateSkills: Record<string, number> = { ...candidateSkills };
  
  // Standard defaults if unassessed candidate to demonstrate real comparison
  if (Object.keys(effectiveCandidateSkills).length === 0) {
    effectiveCandidateSkills['SQL'] = 82;
    effectiveCandidateSkills['Power BI'] = 48;
    effectiveCandidateSkills['Excel'] = 76;
    effectiveCandidateSkills['Data Storytelling'] = 71;
    effectiveCandidateSkills['Python'] = 55;
    effectiveCandidateSkills['React'] = 65;
    effectiveCandidateSkills['JavaScript / TypeScript'] = 60;
  }

  // 1. Role Category Alignment (0 - 100)
  const targetRole = candidateProfile?.targetRole || 'Data Analyst';
  const roleMatches =
    opportunity.targetRoleCategory.toLowerCase().trim() === targetRole.toLowerCase().trim() ||
    targetRole.toLowerCase().includes(opportunity.targetRoleCategory.toLowerCase()) ||
    opportunity.targetRoleCategory.toLowerCase().includes(targetRole.toLowerCase());
  const careerAlignment = roleMatches ? 100 : 60;

  // 2. Skill Comparisons
  const skillMatches: SkillMatchComparison[] = [];
  const developmentGaps: {
    skill: string;
    candidateLevel: number;
    requiredLevel: number;
    deficit: number;
  }[] = [];
  const matchedRequirements: string[] = [];

  let requiredSkillsWeight = 0;
  let requiredSkillsScore = 0;
  let preferredSkillsWeight = 0;
  let preferredSkillsScore = 0;

  opportunity.requirements.forEach((req) => {
    // Find skill level by exact or fuzzy name match
    let candLevel = effectiveCandidateSkills[req.skill];
    if (candLevel === undefined) {
      const foundKey = Object.keys(effectiveCandidateSkills).find(
        (k) =>
          k.toLowerCase().includes(req.skill.toLowerCase()) ||
          req.skill.toLowerCase().includes(k.toLowerCase())
      );
      candLevel = foundKey !== undefined ? effectiveCandidateSkills[foundKey] : 45;
    }

    const isMet = candLevel >= req.minLevel;
    const deficit = isMet ? 0 : req.minLevel - candLevel;

    skillMatches.push({
      skill: req.skill,
      candidateLevel: candLevel,
      requiredLevel: req.minLevel,
      isMet,
      isPreferred: req.type === 'preferred',
      deficit,
    });

    if (isMet) {
      matchedRequirements.push(req.skill);
    } else {
      developmentGaps.push({
        skill: req.skill,
        candidateLevel: candLevel,
        requiredLevel: req.minLevel,
        deficit,
      });
    }

    // Scoring weights
    const weight = req.type === 'required' ? 1.0 : 0.4;
    const ratio = Math.min(candLevel / req.minLevel, 1.25); // cap at 1.25 for mastery bonus

    if (req.type === 'required') {
      requiredSkillsWeight += weight;
      requiredSkillsScore += ratio * weight;
    } else {
      preferredSkillsWeight += weight;
      preferredSkillsScore += ratio * weight;
    }
  });

  // 3. Evidence Match
  const evidenceMatches: EvidenceMatchItem[] = opportunity.requiredEvidenceTypes.map((evidenceTitle) => {
    // Check if candidate has evidence related to this evidence type or skill
    const hasEvidence =
      candidateEvidence.length > 0
        ? candidateEvidence.some(
            (e) =>
              evidenceTitle.toLowerCase().includes(e.skill.toLowerCase()) ||
              evidenceTitle.toLowerCase().includes(e.title.toLowerCase()) ||
              e.title.toLowerCase().includes(evidenceTitle.toLowerCase())
          )
        : // default realistic mock presence
          evidenceTitle.includes('SQL') || evidenceTitle.includes('Excel');

    return {
      title: evidenceTitle,
      hasEvidence,
      matchedSkill: opportunity.requirements.find((r) => evidenceTitle.toLowerCase().includes(r.skill.toLowerCase()))?.skill,
    };
  });

  const verifiedEvidenceCount = evidenceMatches.filter((e) => e.hasEvidence).length;
  const evidenceRatio =
    evidenceMatches.length > 0 ? verifiedEvidenceCount / evidenceMatches.length : 0.8;

  // 4. Calculate Overall Compatibility (0 - 100)
  const reqNormalized =
    requiredSkillsWeight > 0 ? requiredSkillsScore / requiredSkillsWeight : 0.8;
  const prefNormalized =
    preferredSkillsWeight > 0 ? preferredSkillsScore / preferredSkillsWeight : 0.8;

  // Formula: 50% required skills + 15% preferred + 20% career alignment + 15% evidence
  const rawOverall =
    reqNormalized * 50 + prefNormalized * 15 + (careerAlignment / 100) * 20 + evidenceRatio * 15;
  const overallMatch = Math.min(Math.max(Math.round(rawOverall), 35), 98);

  // Compatibility label
  let compatibilityLabel = 'Growth Match';
  if (overallMatch >= 85) compatibilityLabel = 'Strong Alignment';
  else if (overallMatch >= 70) compatibilityLabel = 'Qualified Match';

  // Sort development gaps descending by deficit
  developmentGaps.sort((a, b) => b.deficit - a.deficit);
  const primaryGapSkill = developmentGaps.length > 0 ? developmentGaps[0].skill : 'Advanced Projects';

  const recommendationSummary =
    developmentGaps.length > 0
      ? `You already meet most of this role's core requirements. Your primary development gap is ${primaryGapSkill}.`
      : `You fully satisfy the core technical requirements for this role. Accelerate by verifying your project evidence.`;

  return {
    overallMatch,
    compatibilityLabel,
    skillMatches,
    matchedRequirements,
    developmentGaps,
    evidenceMatches,
    careerAlignment,
    primaryGapSkill,
    recommendationSummary,
  };
}

export function getEmployerMatches(opportunityId: string): EmployerCandidate[] {
  // Return candidates tailored for this opportunity
  const opp = getOpportunityById(opportunityId);
  if (!opp) return MOCK_EMPLOYER_CANDIDATES;

  return MOCK_EMPLOYER_CANDIDATES.map((cand) => {
    // If target role matches, give a slight boost
    const roleFactor = cand.targetRole === opp.targetRoleCategory ? 1 : 0.85;
    return {
      ...cand,
      overallMatch: Math.round(cand.overallMatch * roleFactor),
    };
  }).sort((a, b) => b.overallMatch - a.overallMatch);
}

export function getCandidateById(candidateId: string): EmployerCandidate | undefined {
  return MOCK_EMPLOYER_CANDIDATES.find((c) => c.id === candidateId);
}

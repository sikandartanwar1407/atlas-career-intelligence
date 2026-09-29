export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  topics?: string[];
  created_at: string;
  updated_at: string;
  default_branch: string;
  languages?: Record<string, number>;
}

export type GitHubAnalysisPhase =
  | 'idle'
  | 'preparing'
  | 'fetching'
  | 'analyzing'
  | 'mapping'
  | 'results'
  | 'error';

export interface ExtractedEvidence {
  id: string;
  title: string;
  skill: string;
  type: 'GitHub Repository' | 'Project' | 'Dashboard';
  description: string;
  link: string;
  date: string;
  metrics: string;
  shaHash: string;
  verificationStatus: 'Verified' | 'Under Review' | 'Submitted';
  evaluatorFeedback: string;
  detectedLanguages: string[];
  stars: number;
  forks: number;
}

export interface GitHubAnalysisResult {
  username: string;
  user: GitHubUser;
  analyzedReposCount: number;
  primaryLanguages: { name: string; percentage: number }[];
  detectedTopics: string[];
  extractedEvidence: ExtractedEvidence[];
  demonstratedSkillsDetected: string[];
  evidenceReadinessBoost: number;
}

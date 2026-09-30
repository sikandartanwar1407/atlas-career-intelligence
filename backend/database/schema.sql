-- ==============================================================================
-- ATLAS CAREER ARCHITECTURE PLATFORM
-- PostgreSQL / Supabase Database Schema
-- ==============================================================================
-- Purpose:
--   This schema defines the relational persistence layer for the ATLAS application.
--   It mirrors the exact frontend TypeScript types, state shapes, and domain
--   workflows discovered during inspection of the frontend codebase:
--     - Candidate Profiles, Target Goals & Availability
--     - Baseline Skill Ratings & Diagnostic Skill Gaps
--     - Assessment Submissions & Question-Level Responses
--     - Dynamic Roadmap Milestones & Granular Action Progress
--     - Learning Resource Tracking
--     - Portfolio Evidence & Public GitHub Analysis Telemetry
--     - Longitudinal Reassessment Tracking
--     - Candidate Discoverability & Contact Visibility Preferences
--     - Employer Profiles, Open Opportunities & Required Competencies
--     - Candidate Job Applications / Expressions of Interest
--
-- Security & Design Standards:
--   - Integrates with Supabase Auth (auth.users) via user_id foreign keys.
--   - No passwords, API keys, or secret tokens stored.
--   - Standardized on UUID primary keys with gen_random_uuid().
--   - Uses TIMESTAMPTZ for all date/time tracking.
--   - JSONB used strictly for genuinely variable structures (e.g. GitHub raw metadata, skill deltas).
--   - Foreign keys, cascading behaviors, and query indexes defined for all relations.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for automated updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. CANDIDATE PROFILES & CONFIGURATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT NOT NULL,
    degree TEXT NOT NULL,
    year TEXT NOT NULL CHECK (year IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Graduated')),
    experience_level TEXT NOT NULL CHECK (experience_level IN ('Beginner', 'Student', 'Fresher', 'Early Career', 'Experienced')),
    target_role TEXT NOT NULL,
    custom_role TEXT,
    availability_hours_per_week INT NOT NULL DEFAULT 10 CHECK (availability_hours_per_week >= 1 AND availability_hours_per_week <= 80),
    has_completed_setup BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_candidate_profiles_updated_at
BEFORE UPDATE ON candidate_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_target_role ON candidate_profiles(target_role);

-- ==============================================================================
-- 2. CANDIDATE BASELINE SKILL RATINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_skill_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    baseline_score INT NOT NULL CHECK (baseline_score >= 0 AND baseline_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidate_skill_ratings UNIQUE (candidate_id, skill_name)
);

CREATE TRIGGER set_candidate_skill_ratings_updated_at
BEFORE UPDATE ON candidate_skill_ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_candidate_skill_ratings_candidate_id ON candidate_skill_ratings(candidate_id);

-- ==============================================================================
-- 3. ASSESSMENT SUBMISSIONS & ANSWERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL,
    overall_demonstrated INT NOT NULL CHECK (overall_demonstrated >= 0 AND overall_demonstrated <= 100),
    largest_gap_skill TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_candidate_id ON assessment_submissions(candidate_id);

CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    selected_option INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_submission_question UNIQUE (submission_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_submission_id ON assessment_answers(submission_id);

-- ==============================================================================
-- 4. CANDIDATE SKILL DIAGNOSTICS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_skill_diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    baseline_score INT NOT NULL CHECK (baseline_score >= 0 AND baseline_score <= 100),
    demonstrated_score INT NOT NULL CHECK (demonstrated_score >= 0 AND demonstrated_score <= 100),
    role_threshold INT NOT NULL CHECK (role_threshold >= 0 AND role_threshold <= 100),
    gap INT NOT NULL CHECK (gap >= 0),
    priority_level TEXT NOT NULL CHECK (priority_level IN ('HIGH PRIORITY', 'MEDIUM PRIORITY', 'LOW PRIORITY')),
    evidence_status TEXT NOT NULL CHECK (evidence_status IN ('Missing', 'Moderate', 'Strong', 'Unverified')),
    description TEXT,
    strategic_note TEXT,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidate_skill_diagnostics UNIQUE (candidate_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_candidate_skill_diagnostics_candidate_id ON candidate_skill_diagnostics(candidate_id);

-- ==============================================================================
-- 5. LEARNING RESOURCE STATUS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_resource_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    resource_id TEXT NOT NULL,
    is_started BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidate_resource UNIQUE (candidate_id, resource_id)
);

CREATE TRIGGER set_candidate_resource_status_updated_at
BEFORE UPDATE ON candidate_resource_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_candidate_resource_status_candidate_id ON candidate_resource_status(candidate_id);

-- ==============================================================================
-- 6. CAREER ROADMAP & GRANULAR STEP ACTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    step_number INT NOT NULL,
    skill_name TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('HIGH PRIORITY', 'MEDIUM PRIORITY', 'LOW PRIORITY')),
    gap INT NOT NULL CHECK (gap >= 0),
    allocated_hours NUMERIC(4,1) NOT NULL CHECK (allocated_hours >= 0),
    estimated_duration_weeks TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_candidate_roadmap_step UNIQUE (candidate_id, step_id)
);

CREATE TRIGGER set_candidate_roadmaps_updated_at
BEFORE UPDATE ON candidate_roadmaps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_candidate_roadmaps_candidate_id ON candidate_roadmaps(candidate_id);

CREATE TABLE IF NOT EXISTS candidate_roadmap_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_step_id UUID NOT NULL REFERENCES candidate_roadmaps(id) ON DELETE CASCADE,
    action_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN ('Learn', 'Practice', 'Build', 'Defend')),
    estimated_minutes INT NOT NULL DEFAULT 45,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_roadmap_step_action UNIQUE (roadmap_step_id, action_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_roadmap_actions_step_id ON candidate_roadmap_actions(roadmap_step_id);

-- ==============================================================================
-- 7. CANDIDATE PORTFOLIO EVIDENCE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('Project', 'Dashboard', 'Certificate', 'GitHub Repository', 'Presentation', 'Case Study')),
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    date TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Submitted' CHECK (verification_status IN ('Verified', 'Under Review', 'Submitted')),
    metrics TEXT,
    sha_hash TEXT,
    evaluator_feedback TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_candidate_evidence_updated_at
BEFORE UPDATE ON candidate_evidence
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_candidate_evidence_candidate_id ON candidate_evidence(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_evidence_skill_name ON candidate_evidence(skill_name);

-- ==============================================================================
-- 8. GITHUB ANALYSES & AUTOMATED ARTIFACTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS github_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    github_user_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    analyzed_repos_count INT NOT NULL DEFAULT 0,
    primary_languages JSONB NOT NULL DEFAULT '[]'::jsonb,
    detected_topics TEXT[] NOT NULL DEFAULT '{}',
    demonstrated_skills_detected TEXT[] NOT NULL DEFAULT '{}',
    evidence_readiness_boost INT NOT NULL DEFAULT 0,
    extracted_evidence_count INT NOT NULL DEFAULT 0,
    raw_analysis_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_analyses_candidate_id ON github_analyses(candidate_id);

-- ==============================================================================
-- 9. CANDIDATE REASSESSMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_reassessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    previous_overall_score INT NOT NULL CHECK (previous_overall_score >= 0 AND previous_overall_score <= 100),
    current_overall_score INT NOT NULL CHECK (current_overall_score >= 0 AND current_overall_score <= 100),
    improvement INT NOT NULL,
    skill_deltas JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_reassessments_candidate_id ON candidate_reassessments(candidate_id);

-- ==============================================================================
-- 10. CANDIDATE VISIBILITY & DISCOVERY PREFERENCES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS candidate_visibility_settings (
    candidate_id UUID PRIMARY KEY REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    allow_discover BOOLEAN NOT NULL DEFAULT TRUE,
    allow_contact BOOLEAN NOT NULL DEFAULT TRUE,
    show_portfolio_evidence BOOLEAN NOT NULL DEFAULT TRUE,
    show_skill_info BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_candidate_visibility_settings_updated_at
BEFORE UPDATE ON candidate_visibility_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 11. EMPLOYER PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_website TEXT NOT NULL,
    company_email TEXT NOT NULL,
    industry TEXT NOT NULL,
    company_size TEXT NOT NULL,
    company_location TEXT NOT NULL,
    company_description TEXT NOT NULL,
    company_logo_text TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_employer_profiles_updated_at
BEFORE UPDATE ON employer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON employer_profiles(user_id);

-- ==============================================================================
-- 12. EMPLOYER OPPORTUNITIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_logo_text TEXT,
    location TEXT NOT NULL,
    employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
    target_role_category TEXT NOT NULL,
    experience_level TEXT NOT NULL CHECK (experience_level IN ('Beginner', 'Student', 'Fresher', 'Early Career', 'Experienced')),
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    salary_range TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    required_evidence_types TEXT[] NOT NULL DEFAULT '{}',
    is_employer_posted BOOLEAN NOT NULL DEFAULT TRUE,
    posted_date TEXT NOT NULL DEFAULT 'Just now',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_opportunities_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_opportunities_employer_id ON opportunities(employer_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_target_role ON opportunities(target_role_category);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);

-- ==============================================================================
-- 13. OPPORTUNITY REQUIREMENTS (SKILL THRESHOLDS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS opportunity_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('required', 'preferred')),
    min_level INT NOT NULL CHECK (min_level >= 0 AND min_level <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_opportunity_skill UNIQUE (opportunity_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_requirements_opportunity_id ON opportunity_requirements(opportunity_id);

-- ==============================================================================
-- 14. JOB APPLICATIONS & EXPRESSIONS OF INTEREST
-- ==============================================================================

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'shortlisted')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_opportunity_candidate_application UNIQUE (opportunity_id, candidate_id)
);

CREATE TRIGGER set_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_job_applications_opportunity_id ON job_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);

-- ==============================================================================
-- SCHEMA SUMMARY & ARCHITECTURAL DOCUMENTATION
-- ==============================================================================
/*
TABLES CREATED:
  1.  candidate_profiles            - Core profile & baseline target role setup
  2.  candidate_skill_ratings       - Candidate baseline ratings (0-100) per skill
  3.  assessment_submissions        - Log of completed technical assessments
  4.  assessment_answers            - Question-level answers and correctness flags
  5.  candidate_skill_diagnostics   - Computed gap analysis vs role benchmarks
  6.  candidate_resource_status     - Started/completed flags for learning resources
  7.  candidate_roadmaps            - Milestone steps generated per competency deficit
  8.  candidate_roadmap_actions     - Individual tasks within each roadmap milestone
  9.  candidate_evidence            - Portfolio deliverables & verification records
  10. github_analyses               - Analyzed GitHub telemetry & extracted evidence
  11. candidate_reassessments       - Longitudinal progress tracking & score deltas
  12. candidate_visibility_settings - Employer talent pool discovery preferences
  13. employer_profiles             - Employer company records & verification statuses
  14. opportunities                 - Job requisitions with role criteria & metadata
  15. opportunity_requirements      - Exact skill thresholds (required vs preferred)
  16. job_applications              - Candidate applications & interest submissions

RELATIONSHIPS:
  - auth.users (1:1) -> candidate_profiles (user_id)
  - auth.users (1:1) -> employer_profiles (user_id)
  - candidate_profiles (1:N) -> candidate_skill_ratings
  - candidate_profiles (1:N) -> assessment_submissions (1:N) -> assessment_answers
  - candidate_profiles (1:N) -> candidate_skill_diagnostics
  - candidate_profiles (1:N) -> candidate_resource_status
  - candidate_profiles (1:N) -> candidate_roadmaps (1:N) -> candidate_roadmap_actions
  - candidate_profiles (1:N) -> candidate_evidence
  - candidate_profiles (1:N) -> github_analyses
  - candidate_profiles (1:N) -> candidate_reassessments
  - candidate_profiles (1:1) -> candidate_visibility_settings
  - employer_profiles (1:N) -> opportunities (1:N) -> opportunity_requirements
  - opportunities (1:N) <-> (N:1) candidate_profiles through job_applications

ASSUMPTIONS & DESIGN DECISIONS:
  - Static Catalogs: The master 13-role taxonomy (rolesData.ts), assessment question
    banks (assessmentQuestions.ts), learning resource catalog (resourcesData.ts), and
    salary benchmarks remain in code/configuration and are referenced by slug/id keys.
  - Custom Roles: For candidates selecting 'Other', custom_role stores the user-supplied
    string while target_role stores the effective display title.
  - Posted Date: Opportunities use a readable posted_date string in the frontend, backed
    by standard created_at TIMESTAMPTZ for query sorting and filtering.
  - Deterministic Matching: Opportunity match scores are derived dynamically by comparing
    candidate_skill_diagnostics and candidate_evidence against opportunity_requirements.
*/

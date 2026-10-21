import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageTransition, AnimatedNumber } from '../components/motion/Motion';

interface CareerRoleData {
  id: string;
  title: string;
  badge: string;
  level: string;
  benchmarkSalary: string;
  readinessScore: number;
  description: string;
  skills: { name: string; current: number; target: number; gap: number }[];
  evidenceRequirements: { text: string; done: boolean }[];
  simulationText?: string;
}

const ROLES_DATABASE: Record<string, CareerRoleData> = {
  'data-analyst': {
    id: 'data-analyst',
    title: 'Data Analyst (Current)',
    badge: 'Current Position • Active',
    level: 'IC2 / Foundational Analyst',
    benchmarkSalary: '$76,000 avg',
    readinessScore: 74,
    description: 'Foundational Relational & Operational Analytics Engine. Focus on queries, dashboards, and metric hygiene.',
    skills: [
      { name: 'SQL Querying & Joins', current: 78, target: 80, gap: -2 },
      { name: 'Power BI Dashboarding', current: 67, target: 70, gap: -3 },
      { name: 'Data Hygiene & QA', current: 72, target: 75, gap: -3 },
      { name: 'Basic Business Metrics', current: 75, target: 75, gap: 0 }
    ],
    evidenceRequirements: [
      { text: 'Verified Production Dashboard with Star-Schema', done: true },
      { text: 'Relational Schema Normalization Portfolio Memo', done: true }
    ],
    simulationText: 'IC2 Fully Calibrated • Cleared for foundational requisitions'
  },
  'senior-data-analyst': {
    id: 'senior-data-analyst',
    title: 'Senior Data Analyst',
    badge: 'Recommended Target Trajectory',
    level: 'IC4 / Mid-Senior Analyst',
    benchmarkSalary: '$118,500 avg',
    readinessScore: 58,
    description: 'Advanced Dimensional Modeling, Business Domain Authority, and Data Pipeline Governance.',
    skills: [
      { name: 'Tabular / DAX Modeling', current: 67, target: 85, gap: -18 },
      { name: 'Advanced SQL & CTEs', current: 62, target: 85, gap: -23 },
      { name: 'Metric Architecture', current: 55, target: 80, gap: -25 },
      { name: 'Experimentation & A/B', current: 35, target: 75, gap: -40 },
      { name: 'Data Warehousing / dbt', current: 40, target: 75, gap: -35 }
    ],
    evidenceRequirements: [
      { text: 'Verified Production Dashboard with Star-Schema (Completed)', done: true },
      { text: 'Git-controlled dbt / SQL transformation repository with automated CI tests', done: false },
      { text: 'Executive Decision Memorandum linking queries to $100k+ business savings', done: false },
      { text: '15-minute recorded architectural defense of data model choices', done: false }
    ],
    simulationText: 'Post Sprints 04 & 05: 58% → 82% (+24 pts) • Shortlist probability jumps 34% → 78%'
  },
  'analytics-lead': {
    id: 'analytics-lead',
    title: 'Analytics Lead',
    badge: 'Strategic High-Leverage Vector',
    level: 'IC5 / Lead Strategist',
    benchmarkSalary: '$156,000 avg',
    readinessScore: 36,
    description: 'Strategic Decision Science, Analytics Architecture, Cross-functional Stakeholder Leadership & Mentorship.',
    skills: [
      { name: 'Cross-functional Roadmapping', current: 42, target: 85, gap: -43 },
      { name: 'Metric Tree Stewardship', current: 48, target: 90, gap: -42 },
      { name: 'Cloud Data Architecture (Snowflake)', current: 30, target: 80, gap: -50 },
      { name: 'Data Team Mentorship', current: 35, target: 80, gap: -45 }
    ],
    evidenceRequirements: [
      { text: 'Cross-Departmental Attribution Framework Brief', done: false },
      { text: 'Published Enterprise Data Catalog & Governance SLA', done: false },
      { text: 'Junior Analyst Mentorship Program Curriculum', done: false }
    ],
    simulationText: 'Requires IC4 completion first. Strategic 2-year leadership horizon.'
  },
  'data-manager': {
    id: 'data-manager',
    title: 'BI / Data Manager',
    badge: 'Management Horizon Vector',
    level: 'M1 / People Leadership',
    benchmarkSalary: '$192,000 avg',
    readinessScore: 22,
    description: 'Organizational Data Capability, Talent Systems, Departmental Budgeting & Enterprise Data Strategy.',
    skills: [
      { name: 'Infrastructure & Tooling Budgeting', current: 15, target: 85, gap: -70 },
      { name: 'Talent Strategy & Interview Rubrics', current: 25, target: 85, gap: -60 },
      { name: 'Vendor Procurement & Contract ROI', current: 20, target: 80, gap: -60 }
    ],
    evidenceRequirements: [
      { text: 'Enterprise Vendor Procurement Analysis & Negotiation', done: false },
      { text: 'Departmental Data Capability Blueprint & Org Chart', done: false }
    ],
    simulationText: 'Long-term 3-4 year trajectory requiring team management experience.'
  },
  'bi-analyst': {
    id: 'bi-analyst',
    title: 'BI Analyst (Lateral Pivot)',
    badge: 'High Affinity Lateral (81%)',
    level: 'IC3 / Business Intelligence Core',
    benchmarkSalary: '$104,000 avg',
    readinessScore: 81,
    description: 'Deepening semantic layer, Enterprise BI governance, and automated reporting pipelines.',
    skills: [
      { name: 'Power BI / Tableau Administration', current: 75, target: 85, gap: -10 },
      { name: 'Semantic Layer Engineering (Cube/LookML)', current: 66, target: 80, gap: -14 },
      { name: 'DAX Performance Optimization', current: 67, target: 80, gap: -13 },
      { name: 'ETL / Pipeline Orchestration', current: 70, target: 80, gap: -10 }
    ],
    evidenceRequirements: [
      { text: 'Verified Production Dashboard with Star-Schema (Completed)', done: true },
      { text: 'End-to-end Enterprise BI Deployment with automated refresh & RLS', done: false },
      { text: 'Semantic Data Catalog & Metric Glossary', done: false }
    ],
    simulationText: 'Fastest lateral runway: approx 3-4 months to qualification readiness.'
  },
  'product-analyst': {
    id: 'product-analyst',
    title: 'Product Analyst (Lateral Pivot)',
    badge: 'Moderate Affinity Lateral (72%)',
    level: 'IC3 / Growth & Product Analytics',
    benchmarkSalary: '$112,000 avg',
    readinessScore: 72,
    description: 'Product telemetry, event tracking, funnel drop-off & cohort retention loops.',
    skills: [
      { name: 'Funnel & Cohort Retention Analysis', current: 68, target: 85, gap: -17 },
      { name: 'Amplitude / Mixpanel Instrumentation', current: 44, target: 70, gap: -26 },
      { name: 'A/B Test Design & Sample Sizing', current: 48, target: 70, gap: -22 }
    ],
    evidenceRequirements: [
      { text: 'Feature Experimentation Memorandum with Power Calculations', done: false },
      { text: 'User Cohort LTV & Churn Predictive Analysis', done: false }
    ],
    simulationText: 'Pivot runway: approx 6 months focused on experimentation and user instrumentation.'
  }
};

export const CareerMapPage: React.FC = () => {
  const { state, careerReadiness, skillGaps, updateTargetRole } = useAtlas();

  const [activeViewMode, setActiveViewMode] = useState<'all' | 'vertical' | 'lateral' | 'compensation'>('all');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('senior-data-analyst');
  const [targetSetSuccess, setTargetSetSuccess] = useState(false);

  const selectedRole = ROLES_DATABASE[selectedRoleId] || ROLES_DATABASE['senior-data-analyst'];

  const completedStepsCount = state.roadmapSteps.filter((s) => s.completed).length;
  const verifiedEvidenceCount = state.evidence.filter((e) => e.verificationStatus === 'Verified').length;

  const handleSetTarget = (roleName: string) => {
    updateTargetRole(roleName);
    setTargetSetSuccess(true);
    setTimeout(() => setTargetSetSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header */}
        <section className="flex flex-col gap-4 pb-6 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] font-mono text-[11px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                STRATEGIC NAVIGATION ARCHITECTURE // TRAJECTORY VECTOR
              </span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-[#64748B] uppercase">
                ROLE HORIZON: {state.targetRole}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/onboarding"
                className="px-4 py-2 rounded-xl bg-[#0D1224] border border-white/10 hover:bg-[#172039] text-white text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Change Target Role
              </Link>
            </div>
          </div>

          <div className="max-w-4xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              See where your career can go.
            </h1>
            <p className="text-base text-[#94A3B8]">
              A strategic navigation engine mapping hierarchical promotions, cross-functional lateral pivots, and verified capability clearance gates across the data ecosystem.
            </p>
          </div>
        </section>

        {/* 5-Step Visual Journey Flow Banner */}
        <section className="p-6 rounded-2xl glass-panel border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
              The Connected Career Journey
            </span>
            <span className="text-xs font-mono text-[#2DD4BF] font-semibold">Live System Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {/* 1. CURRENT POSITION */}
            <div className="p-4 rounded-xl bg-[#0D1224] border border-white/10 space-y-1">
              <span className="font-mono text-xs font-bold text-[#64748B] block">01</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] font-bold block">Current Position</span>
              <span className="text-sm font-semibold text-white block truncate">Junior {state.targetRole}</span>
              <span className="text-[11px] font-mono text-[#64748B]">{state.profile.experienceLevel} Baseline</span>
            </div>

            {/* 2. SKILL DEVELOPMENT */}
            <div className="p-4 rounded-xl bg-[#0D1224] border border-white/10 space-y-1">
              <span className="font-mono text-xs font-bold text-[#A78BFA] block">02</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] font-bold block">Skill Development</span>
              <span className="text-sm font-semibold text-white block truncate">
                {state.availability}h / wk Allocation
              </span>
              <span className="text-[11px] font-mono text-[#A78BFA] font-semibold">{skillGaps.length} Vectors Tracked</span>
            </div>

            {/* 3. EVIDENCE */}
            <div className="p-4 rounded-xl bg-[#0D1224] border border-white/10 space-y-1">
              <span className="font-mono text-xs font-bold text-[#2DD4BF] block">03</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#2DD4BF] font-bold block">Evidence</span>
              <span className="text-sm font-semibold text-white block truncate">
                {state.evidence.length} Locker Artifacts
              </span>
              <span className="text-[11px] font-mono text-[#2DD4BF] font-semibold">{verifiedEvidenceCount} Verified</span>
            </div>

            {/* 4. REASSESSMENT */}
            <div className="p-4 rounded-xl bg-[#0D1224] border border-white/10 space-y-1">
              <span className="font-mono text-xs font-bold text-[#A78BFA] block">04</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] font-bold block">Reassessment</span>
              <span className="text-sm font-semibold text-white block truncate font-mono">
                {careerReadiness}% Current Score
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">Deficit: -{Math.max(80 - careerReadiness, 0)} pts</span>
            </div>

            {/* 5. TARGET ROLE */}
            <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-500/50 space-y-1 shadow-sm">
              <span className="font-mono text-xs font-bold text-[#A78BFA] block">05</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] font-bold block">Target Role</span>
              <span className="text-sm font-bold text-white block truncate">{state.targetRole}</span>
              <span className="text-[11px] font-mono text-[#2DD4BF] font-bold">80% Clearance Gate</span>
            </div>
          </div>
        </section>

        {/* 4 Telemetry Overview Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="glass-panel border-white/10 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#64748B] font-mono uppercase font-bold">
                <span>01 // Current Node</span>
                <span className="text-[#2DD4BF]">Active</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Junior {state.targetRole}</h3>
              <p className="text-xs text-[#64748B] font-mono">IC2 • Core Analytical Engine</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 flex items-baseline justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase block">Current Readiness</span>
                <span className="text-2xl font-bold text-white">{careerReadiness}%</span>
              </div>
              <span className="text-xs text-[#A78BFA] font-semibold">Goal: 80%</span>
            </div>
          </div>

          <div className="glass-panel border-violet-500/40 p-5 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden bg-violet-950/20">
            <div>
              <div className="flex justify-between text-xs text-[#64748B] font-mono uppercase font-bold">
                <span>02 // Target Milestone</span>
                <span className="text-[#A78BFA]">Recommended</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Senior {state.targetRole}</h3>
              <p className="text-xs text-[#64748B] font-mono">IC4 • Advanced Domain Authority</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 flex items-baseline justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase block">Trajectory Readiness</span>
                <span className="text-2xl font-bold text-[#A78BFA]">58%</span>
              </div>
              <span className="text-xs text-rose-400 font-semibold">Deficit: -22 pts</span>
            </div>
          </div>

          <div className="glass-panel border-white/10 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#64748B] font-mono uppercase font-bold">
                <span>03 // Adjacency Surface</span>
                <span className="text-[#A78BFA]">3 Latent Routes</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Lateral Vectors</h3>
              <p className="text-xs text-[#64748B] font-mono">BI Analyst (81%) • Product (72%)</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10">
              <div className="w-full bg-[#172039] rounded-full h-1.5 overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full" style={{ width: '81%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#64748B] mt-1">
                <span>81% Max Affinity</span>
                <span className="text-[#2DD4BF] font-semibold">Low Pivot Friction</span>
              </div>
            </div>
          </div>

          <div className="glass-panel border-white/10 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#64748B] font-mono uppercase font-bold">
                <span>04 // Economic Arbitrage</span>
                <span className="text-[#2DD4BF]">+68% Delta</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Compensation Upside</h3>
              <p className="text-xs text-[#64748B] font-mono">Entry $72k → Senior $122k median</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 flex items-baseline justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase block">Median Base Shift</span>
                <span className="text-2xl font-bold text-white">+$50,000</span>
              </div>
              <span className="text-xs text-[#2DD4BF] font-bold">4.2x ROI</span>
            </div>
          </div>
        </section>

        {/* View Mode Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl glass-panel border-white/10 bg-[#0D1224]/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Trajectories' },
              { id: 'vertical', label: 'Vertical Ladder' },
              { id: 'lateral', label: 'Lateral Pathways' },
              { id: 'compensation', label: 'Compensation Map' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveViewMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeViewMode === tab.id
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-[#94A3B8] hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-[#64748B]">Click any role below to inspect deep-dive requirements</span>
        </div>

        {/* Asymmetric Workbench: 8 Cols Visual Progression Tree + 4 Cols Deep Dive Dossier */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: VISUAL CAREER MAP */}
          <div className="lg:col-span-8 space-y-6">
            {/* Vertical Tree */}
            {(activeViewMode === 'all' || activeViewMode === 'vertical' || activeViewMode === 'compensation') && (
              <div className="glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">
                    Vertical Advancement Ladder
                  </h3>
                  <span className="text-xs font-mono text-[#64748B]">Primary Technical Promotion Track</span>
                </div>

                <div className="space-y-4">
                  {/* Node 1: Current Data Analyst */}
                  <div
                    onClick={() => setSelectedRoleId('data-analyst')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedRoleId === 'data-analyst'
                        ? 'bg-teal-950/20 border-teal-500 shadow-md'
                        : 'bg-[#0D1224]/80 border-white/10 hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 text-[#2DD4BF] flex items-center justify-center font-bold text-xs font-mono">
                          1
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Level IC2</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30">
                              Current Baseline
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white">Data Analyst</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs font-mono">
                        <span className="text-[#64748B] block">Market Range</span>
                        <span className="font-bold text-white">$68,000 – $85,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Transition Connector */}
                  <div className="flex items-center gap-4 px-6 text-xs text-[#64748B] font-mono">
                    <div className="w-0.5 h-8 bg-violet-600"></div>
                    <span className="p-1 px-3 rounded-lg bg-[#0D1224] border border-white/10 text-[11px]">
                      Promotion Gate: 80% Demonstrated Readiness &amp; Dimensional Modeling Mastery
                    </span>
                  </div>

                  {/* Node 2: Senior Data Analyst (Recommended) */}
                  <div
                    onClick={() => setSelectedRoleId('senior-data-analyst')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedRoleId === 'senior-data-analyst'
                        ? 'bg-violet-950/30 border-violet-500 shadow-sm'
                        : 'bg-[#0D1224]/80 border-white/10 hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
                          2
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Level IC4</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-[#A78BFA] border border-violet-500/30">
                              Recommended Next Step
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white">Senior Data Analyst</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs font-mono">
                        <span className="text-[#64748B] block">Market Range</span>
                        <span className="font-bold text-[#2DD4BF]">$110,000 – $135,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Transition Connector */}
                  <div className="flex items-center gap-4 px-6 text-xs text-[#64748B] font-mono">
                    <div className="w-0.5 h-8 bg-white/10"></div>
                    <span className="p-1 px-3 rounded-lg bg-[#0D1224] border border-white/10 text-[11px]">
                      Leadership Gate: Cross-Departmental Attribution &amp; Team Mentorship
                    </span>
                  </div>

                  {/* Node 3: Analytics Lead */}
                  <div
                    onClick={() => setSelectedRoleId('analytics-lead')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRoleId === 'analytics-lead'
                        ? 'bg-[#172039] border-white/30 shadow-md'
                        : 'bg-[#0D1224]/80 border-white/10 hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#172039] border border-white/10 text-[#64748B] flex items-center justify-center font-bold text-xs font-mono">
                          3
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Level IC5</span>
                          <h4 className="text-base font-bold text-white">Analytics Lead</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs font-mono">
                        <span className="text-[#64748B] block">Market Range</span>
                        <span className="font-bold text-white">$140,000 – $175,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lateral Branches Section */}
            {(activeViewMode === 'all' || activeViewMode === 'lateral') && (
              <div className="glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Viable Lateral Branches
                    </h3>
                    <p className="text-xs text-[#94A3B8]">Alternative horizontal career paths sharing core competency overlap</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedRoleId('bi-analyst')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRoleId === 'bi-analyst'
                        ? 'bg-violet-950/30 border-violet-500 shadow-md'
                        : 'bg-[#0D1224]/80 border-white/10 hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#2DD4BF] bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded">
                        81% Competency Match
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#64748B]">$104k avg</span>
                    </div>
                    <h4 className="text-base font-bold text-white">BI Analyst</h4>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">Deepening semantic layer, Enterprise reporting governance, and dashboarding.</p>
                  </div>

                  <div
                    onClick={() => setSelectedRoleId('product-analyst')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRoleId === 'product-analyst'
                        ? 'bg-violet-950/30 border-violet-500 shadow-md'
                        : 'bg-[#0D1224]/80 border-white/10 hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#A78BFA] bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 rounded">
                        72% Competency Match
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#64748B]">$112k avg</span>
                    </div>
                    <h4 className="text-base font-bold text-white">Product Analyst</h4>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">User event analytics, funnel optimization, cohort retention, and A/B test design.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 4 COLUMNS: SELECTED ROLE DEEP-DIVE DOSSIER */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="glass-panel-elevated border-violet-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                  ACTIVE DOSSIER PREVIEW
                </span>
                <span className="text-xs font-mono text-[#64748B]">{selectedRole.level}</span>
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-[#A78BFA] text-[10px] font-mono font-bold uppercase">
                  {selectedRole.badge}
                </span>
                <h3 className="text-xl font-bold text-white mt-2 tracking-tight">
                  {selectedRole.title}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  {selectedRole.description}
                </p>
                <div className="text-xs font-mono text-[#64748B] mt-2">
                  Market Benchmark: <strong className="text-white">{selectedRole.benchmarkSalary}</strong>
                </div>
              </div>

              {/* Competency Clearance Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-white uppercase text-[11px]">1. Competency Clearance Matrix</span>
                  <span className="font-bold text-[#2DD4BF]">
                    <AnimatedNumber value={selectedRole.readinessScore} suffix="% Match" durationMs={500} />
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedRole.skills.map((s) => (
                    <div key={s.name} className="space-y-1 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-[#94A3B8]">{s.name}</span>
                        <span>
                          {s.current}% / {s.target}% <span className={s.gap < 0 ? 'text-rose-400' : 'text-[#2DD4BF]'}>({s.gap})</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#172039] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.current >= 70 ? 'bg-teal-500' : 'bg-violet-600'}`}
                          style={{ width: `${Math.min(s.current, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Locker Gate */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-white uppercase text-[11px]">2. Evidence Locker Gate</span>
                  <span className="text-[#64748B]">{selectedRole.evidenceRequirements.filter((r) => r.done).length} of {selectedRole.evidenceRequirements.length} Verified</span>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedRole.evidenceRequirements.map((req, rIdx) => (
                    <div key={rIdx} className="p-2.5 rounded-xl bg-[#0D1224] border border-white/10 flex items-start gap-2">
                      <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${req.done ? 'text-[#2DD4BF]' : 'text-[#64748B]'}`}>
                        {req.done ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`leading-snug ${req.done ? 'text-white font-medium' : 'text-[#64748B]'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target set action button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSetTarget(selectedRole.title.replace(' (Current)', '').replace(' (Lateral Pivot)', ''))}
                  className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{targetSetSuccess ? 'Target Re-anchored!' : 'Set as Active Target Trajectory'}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};

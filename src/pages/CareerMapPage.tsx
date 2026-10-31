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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header */}
        <section className="flex flex-col gap-4 pb-6 border-b border-[#E5E7EB]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] font-mono text-[11px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A] animate-pulse"></span>
                STRATEGIC NAVIGATION ARCHITECTURE // TRAJECTORY VECTOR
              </span>
              <span className="text-[#6B7280] hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-[#6B7280] uppercase">
                ROLE HORIZON: {state.targetRole}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/onboarding"
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#18283D] text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Change Target Role
              </Link>
            </div>
          </div>

          <div className="max-w-4xl space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#18283D] tracking-tight">
              See where your career can go.
            </h1>
            <p className="text-base text-[#6B7280]">
              A strategic navigation engine mapping hierarchical promotions, cross-functional lateral pivots, and verified capability clearance gates across the data ecosystem.
            </p>
          </div>
        </section>

        {/* 5-Step Visual Journey Flow Banner */}
        <section className="p-6 rounded-2xl glass-panel border-[#E5E7EB] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">
              The Connected Career Journey
            </span>
            <span className="text-xs font-mono text-[#8B6F5A] font-semibold">Live System Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {/* 1. CURRENT POSITION */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-1">
              <span className="font-mono text-xs font-bold text-[#6B7280] block">01</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B6F5A] font-bold block">Current Position</span>
              <span className="text-sm font-semibold text-[#18283D] block truncate">Junior {state.targetRole}</span>
              <span className="text-[11px] font-mono text-[#6B7280]">{state.profile.experienceLevel} Baseline</span>
            </div>

            {/* 2. SKILL DEVELOPMENT */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-1">
              <span className="font-mono text-xs font-bold text-[#8B6F5A] block">02</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B6F5A] font-bold block">Skill Development</span>
              <span className="text-sm font-semibold text-[#18283D] block truncate">
                {state.availability}h / wk Allocation
              </span>
              <span className="text-[11px] font-mono text-[#8B6F5A] font-semibold">{skillGaps.length} Vectors Tracked</span>
            </div>

            {/* 3. EVIDENCE */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-1">
              <span className="font-mono text-xs font-bold text-[#8B6F5A] block">03</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B6F5A] font-bold block">Evidence</span>
              <span className="text-sm font-semibold text-[#18283D] block truncate">
                {state.evidence.length} Locker Artifacts
              </span>
              <span className="text-[11px] font-mono text-[#8B6F5A] font-semibold">{verifiedEvidenceCount} Verified</span>
            </div>

            {/* 4. REASSESSMENT */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-1">
              <span className="font-mono text-xs font-bold text-[#8B6F5A] block">04</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B6F5A] font-bold block">Reassessment</span>
              <span className="text-sm font-semibold text-[#18283D] block truncate font-mono">
                {careerReadiness}% Current Score
              </span>
              <span className="text-[11px] font-mono text-[#6B7280]">Deficit: -{Math.max(80 - careerReadiness, 0)} pts</span>
            </div>

            {/* 5. TARGET ROLE */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#8B6F5A]/50 space-y-1 shadow-sm">
              <span className="font-mono text-xs font-bold text-[#8B6F5A] block">05</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B6F5A] font-bold block">Target Role</span>
              <span className="text-sm font-bold text-[#18283D] block truncate">{state.targetRole}</span>
              <span className="text-[11px] font-mono text-[#8B6F5A] font-bold">80% Clearance Gate</span>
            </div>
          </div>
        </section>

        {/* 4 Telemetry Overview Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#6B7280] font-mono uppercase font-bold">
                <span>01 // Current Node</span>
                <span className="text-[#8B6F5A]">Active</span>
              </div>
              <h3 className="text-base font-bold text-[#18283D] mt-1">Junior {state.targetRole}</h3>
              <p className="text-xs text-[#6B7280] font-mono">IC2 • Core Analytical Engine</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E5E7EB] flex items-baseline justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#6B7280] uppercase block">Current Readiness</span>
                <span className="text-2xl font-bold text-[#18283D]">{careerReadiness}%</span>
              </div>
              <span className="text-xs text-[#8B6F5A] font-semibold">Goal: 80%</span>
            </div>
          </div>

          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden bg-[#FAF7F2]">
            <div>
              <div className="flex justify-between text-xs text-[#6B7280] font-mono uppercase font-bold">
                <span>02 // Target Milestone</span>
                <span className="text-[#8B6F5A]">Recommended</span>
              </div>
              <h3 className="text-base font-bold text-[#18283D] mt-1">Senior {state.targetRole}</h3>
              <p className="text-xs text-[#6B7280] font-mono">IC4 • Advanced Domain Authority</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E5E7EB] flex items-baseline justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#6B7280] uppercase block">Trajectory Readiness</span>
                <span className="text-2xl font-bold text-[#8B6F5A]">58%</span>
              </div>
              <span className="text-xs text-rose-400 font-semibold">Deficit: -22 pts</span>
            </div>
          </div>

          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#6B7280] font-mono uppercase font-bold">
                <span>03 // Adjacency Surface</span>
                <span className="text-[#8B6F5A]">3 Latent Routes</span>
              </div>
              <h3 className="text-base font-bold text-[#18283D] mt-1">Lateral Vectors</h3>
              <p className="text-xs text-[#6B7280] font-mono">BI Analyst (81%) • Product (72%)</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E5E7EB]">
              <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full" style={{ width: '81%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#6B7280] mt-1">
                <span>81% Max Affinity</span>
                <span className="text-[#8B6F5A] font-semibold">Low Pivot Friction</span>
              </div>
            </div>
          </div>

          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#6B7280] font-mono uppercase font-bold">
                <span>04 // Economic Arbitrage</span>
                <span className="text-[#8B6F5A]">+68% Delta</span>
              </div>
              <h3 className="text-base font-bold text-[#18283D] mt-1">Compensation Upside</h3>
              <p className="text-xs text-[#6B7280] font-mono">Entry $72k → Senior $122k median</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#E5E7EB] flex items-baseline justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#6B7280] uppercase block">Median Base Shift</span>
                <span className="text-2xl font-bold text-[#18283D]">+$50,000</span>
              </div>
              <span className="text-xs text-[#8B6F5A] font-bold">4.2x ROI</span>
            </div>
          </div>
        </section>

        {/* View Mode Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl glass-panel border-[#E5E7EB] bg-[#FAF7F2]/80">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-180 cursor-pointer ${
                  activeViewMode === tab.id
                    ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-[#6B7280]">Click any role below to inspect deep-dive requirements</span>
        </div>

        {/* Asymmetric Workbench: 8 Cols Visual Progression Tree + 4 Cols Deep Dive Dossier */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: VISUAL CAREER MAP */}
          <div className="lg:col-span-8 space-y-6">
            {/* Vertical Tree */}
            {(activeViewMode === 'all' || activeViewMode === 'vertical' || activeViewMode === 'compensation') && (
              <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <h3 className="text-lg font-bold text-[#18283D]">
                    Vertical Advancement Ladder
                  </h3>
                  <span className="text-xs font-mono text-[#6B7280]">Primary Technical Promotion Track</span>
                </div>

                <div className="space-y-4">
                  {/* Node 1: Current Data Analyst */}
                  <div
                    onClick={() => setSelectedRoleId('data-analyst')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedRoleId === 'data-analyst'
                        ? 'border-[#18283D] bg-[#D8C3A5]/20 shadow-md -translate-y-0.5'
                        : 'border-[#E5E7EB] bg-[#FAF7F2] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#D8C3A5]/30 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center font-bold text-xs font-mono">
                          1
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase">Level IC2</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5]">
                              Current Baseline
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[#18283D]">Data Analyst</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs font-mono">
                        <span className="text-[#6B7280] block">Market Range</span>
                        <span className="font-bold text-[#18283D]">$68,000 – $85,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Transition Connector */}
                  <div className="flex items-center gap-4 px-6 text-xs text-[#6B7280] font-mono">
                    <div className="w-0.5 h-8 bg-violet-600"></div>
                    <span className="p-1 px-3 rounded-lg bg-[#FAF7F2] border border-[#E5E7EB] text-[11px]">
                      Promotion Gate: 80% Demonstrated Readiness &amp; Dimensional Modeling Mastery
                    </span>
                  </div>

                  {/* Node 2: Senior Data Analyst (Recommended) */}
                  <div
                    onClick={() => setSelectedRoleId('senior-data-analyst')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedRoleId === 'senior-data-analyst'
                        ? 'border-[#18283D] bg-[#D8C3A5]/20 shadow-md -translate-y-0.5'
                        : 'border-[#E5E7EB] bg-[#FAF7F2] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
                          2
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase">Level IC4</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#18283D]/30">
                              Recommended Next Step
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[#18283D]">Senior Data Analyst</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs font-mono">
                        <span className="text-[#6B7280] block">Market Range</span>
                        <span className="font-bold text-[#8B6F5A]">$110,000 – $135,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Transition Connector */}
                  <div className="flex items-center gap-4 px-6 text-xs text-[#6B7280] font-mono">
                    <div className="w-0.5 h-8 bg-[#E5E7EB]"></div>
                    <span className="p-1 px-3 rounded-lg bg-[#FAF7F2] border border-[#E5E7EB] text-[11px]">
                      Leadership Gate: Cross-Departmental Attribution &amp; Team Mentorship
                    </span>
                  </div>

                  {/* Node 3: Analytics Lead */}
                  <div
                    onClick={() => setSelectedRoleId('analytics-lead')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedRoleId === 'analytics-lead'
                        ? 'border-[#18283D] bg-[#D8C3A5]/20 shadow-md -translate-y-0.5'
                        : 'border-[#E5E7EB] bg-[#FAF7F2] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#E5E7EB] border border-[#E5E7EB] text-[#6B7280] flex items-center justify-center font-bold text-xs font-mono">
                          3
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[#6B7280] uppercase">Level IC5</span>
                          <h4 className="text-base font-bold text-[#18283D]">Analytics Lead</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs font-mono">
                        <span className="text-[#6B7280] block">Market Range</span>
                        <span className="font-bold text-[#18283D]">$140,000 – $175,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lateral Branches Section */}
            {(activeViewMode === 'all' || activeViewMode === 'lateral') && (
              <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <h3 className="text-lg font-bold text-[#18283D]">
                      Viable Lateral Branches
                    </h3>
                    <p className="text-xs text-[#6B7280]">Alternative horizontal career paths sharing core competency overlap</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedRoleId('bi-analyst')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedRoleId === 'bi-analyst'
                        ? 'border-[#18283D] bg-[#D8C3A5]/20 shadow-md -translate-y-0.5'
                        : 'border-[#E5E7EB] bg-[#FAF7F2] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#8B6F5A] bg-[#D8C3A5]/30 border border-[#D8C3A5] px-2 py-0.5 rounded">
                        81% Competency Match
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#6B7280]">$104k avg</span>
                    </div>
                    <h4 className="text-base font-bold text-[#18283D]">BI Analyst</h4>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">Deepening semantic layer, Enterprise reporting governance, and dashboarding.</p>
                  </div>

                  <div
                    onClick={() => setSelectedRoleId('product-analyst')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ease-out ${
                      selectedRoleId === 'product-analyst'
                        ? 'border-[#18283D] bg-[#D8C3A5]/20 shadow-md -translate-y-0.5'
                        : 'border-[#E5E7EB] bg-[#FAF7F2] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#8B6F5A] bg-[#D8C3A5]/30 border border-[#18283D]/30 px-2 py-0.5 rounded">
                        72% Competency Match
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#6B7280]">$112k avg</span>
                    </div>
                    <h4 className="text-base font-bold text-[#18283D]">Product Analyst</h4>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">User event analytics, funnel optimization, cohort retention, and A/B test design.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 4 COLUMNS: SELECTED ROLE DEEP-DIVE DOSSIER */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="glass-panel-elevated border-[#8B6F5A]/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B6F5A] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B6F5A] animate-pulse"></span>
                  ACTIVE DOSSIER PREVIEW
                </span>
                <span className="text-xs font-mono text-[#6B7280]">{selectedRole.level}</span>
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#D8C3A5]/30 border border-[#18283D]/30 text-[#8B6F5A] text-[10px] font-mono font-bold uppercase">
                  {selectedRole.badge}
                </span>
                <h3 className="text-xl font-bold text-[#18283D] mt-2 tracking-tight">
                  {selectedRole.title}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  {selectedRole.description}
                </p>
                <div className="text-xs font-mono text-[#6B7280] mt-2">
                  Market Benchmark: <strong className="text-[#18283D]">{selectedRole.benchmarkSalary}</strong>
                </div>
              </div>

              {/* Competency Clearance Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-[#18283D] uppercase text-[11px]">1. Competency Clearance Matrix</span>
                  <span className="font-bold text-[#8B6F5A]">
                    <AnimatedNumber value={selectedRole.readinessScore} suffix="% Match" durationMs={500} />
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedRole.skills.map((s) => (
                    <div key={s.name} className="space-y-1 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-[#6B7280]">{s.name}</span>
                        <span>
                          {s.current}% / {s.target}% <span className={s.gap < 0 ? 'text-rose-400' : 'text-[#8B6F5A]'}>({s.gap})</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
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
              <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-[#18283D] uppercase text-[11px]">2. Evidence Locker Gate</span>
                  <span className="text-[#6B7280]">{selectedRole.evidenceRequirements.filter((r) => r.done).length} of {selectedRole.evidenceRequirements.length} Verified</span>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedRole.evidenceRequirements.map((req, rIdx) => (
                    <div key={rIdx} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-start gap-2">
                      <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${req.done ? 'text-[#8B6F5A]' : 'text-[#6B7280]'}`}>
                        {req.done ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`leading-snug ${req.done ? 'text-[#18283D] font-medium' : 'text-[#6B7280]'}`}>
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
                  className="w-full py-3 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
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

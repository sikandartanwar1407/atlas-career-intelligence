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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header */}
        <section className="flex flex-col gap-4 pb-6 border-b border-[#e5e2dc]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f1eee7] text-[#424845] font-label-sm text-label-sm uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
                STRATEGIC NAVIGATION ARCHITECTURE // TRAJECTORY VECTOR
              </span>
              <span className="text-[#c2c8c3] hidden sm:inline">•</span>
              <span className="font-label-sm text-label-sm text-[#737874] uppercase">
                ROLE HORIZON: {state.targetRole}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/onboarding"
                className="px-3.5 py-1.5 rounded bg-white border border-[#e5e2dc] hover:bg-[#f6f3ed] text-[#0d1f18] font-title-md text-xs font-semibold"
              >
                Change Target Role
              </Link>
            </div>
          </div>

          <div className="max-w-4xl space-y-2">
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              See where your career can go.
            </h1>
            <p className="font-body-lg text-body-lg text-[#424845]">
              A strategic navigation engine mapping hierarchical promotions, cross-functional lateral pivots, and verified capability clearance gates across the data ecosystem.
            </p>
          </div>
        </section>

        {/* 5-Step Visual Journey Flow Banner */}
        <section className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#737874] font-bold">
              The Connected Career Journey
            </span>
            <span className="text-xs text-[#6b4ea6] font-semibold">Live System Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {/* 1. CURRENT POSITION */}
            <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] space-y-1">
              <span className="font-mono text-xs font-bold text-[#737874] block">01</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0d1f18] block">Current Position</span>
              <span className="font-title-md text-sm font-semibold text-[#0d1f18] block truncate">Junior {state.targetRole}</span>
              <span className="text-[11px] text-[#737874]">{state.profile.experienceLevel} Baseline</span>
            </div>

            {/* 2. SKILL DEVELOPMENT */}
            <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] space-y-1">
              <span className="font-mono text-xs font-bold text-[#6b4ea6] block">02</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0d1f18] block">Skill Development</span>
              <span className="font-title-md text-sm font-semibold text-[#0d1f18] block truncate">
                {state.availability}h / wk Allocation
              </span>
              <span className="text-[11px] text-[#6b4ea6] font-semibold">{skillGaps.length} Vectors Tracked</span>
            </div>

            {/* 3. EVIDENCE */}
            <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] space-y-1">
              <span className="font-mono text-xs font-bold text-[#0d1f18] block">03</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0d1f18] block">Evidence</span>
              <span className="font-title-md text-sm font-semibold text-[#0d1f18] block truncate">
                {state.evidence.length} Locker Artifacts
              </span>
              <span className="text-[11px] text-[#4f6359] font-semibold">{verifiedEvidenceCount} Verified</span>
            </div>

            {/* 4. REASSESSMENT */}
            <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] space-y-1">
              <span className="font-mono text-xs font-bold text-[#6b4ea6] block">04</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0d1f18] block">Reassessment</span>
              <span className="font-title-md text-sm font-semibold text-[#0d1f18] block truncate">
                {careerReadiness}% Current Score
              </span>
              <span className="text-[11px] text-[#737874]">Deficit: -{Math.max(80 - careerReadiness, 0)} pts</span>
            </div>

            {/* 5. TARGET ROLE */}
            <div className="p-4 rounded-lg bg-[#eaddff]/40 border border-[#6b4ea6] space-y-1">
              <span className="font-mono text-xs font-bold text-[#6b4ea6] block">05</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#25005a] block">Target Role</span>
              <span className="font-title-md text-sm font-bold text-[#0d1f18] block truncate">{state.targetRole}</span>
              <span className="text-[11px] text-[#6b4ea6] font-bold">80% Clearance Gate</span>
            </div>
          </div>
        </section>

        {/* 4 Telemetry Overview Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#737874] uppercase font-bold">
                <span>01 // Current Node</span>
                <span className="text-[#4f6359]">Active</span>
              </div>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold mt-1">Junior {state.targetRole}</h3>
              <p className="text-xs text-[#737874]">IC2 • Core Analytical Engine</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#f1eee7] flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-[#737874] uppercase block">Current Readiness</span>
                <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">{careerReadiness}%</span>
              </div>
              <span className="text-xs text-[#6b4ea6] font-semibold">Goal: 80%</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#6b4ea6] shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex justify-between text-xs text-[#737874] uppercase font-bold">
                <span>02 // Target Milestone</span>
                <span className="text-[#6b4ea6]">Recommended</span>
              </div>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold mt-1">Senior {state.targetRole}</h3>
              <p className="text-xs text-[#737874]">IC4 • Advanced Domain Authority</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#f1eee7] flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-[#737874] uppercase block">Trajectory Readiness</span>
                <span className="font-metric-lg text-metric-lg text-[#6b4ea6] font-bold">58%</span>
              </div>
              <span className="text-xs text-[#ba1a1a] font-semibold">Deficit: -22 pts</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#737874] uppercase font-bold">
                <span>03 // Adjacency Surface</span>
                <span className="text-[#6b4ea6]">3 Latent Routes</span>
              </div>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold mt-1">Lateral Vectors</h3>
              <p className="text-xs text-[#737874]">BI Analyst (81%) • Product (72%)</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#f1eee7]">
              <div className="w-full bg-[#e5e2dc] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#6b4ea6] h-full rounded-full" style={{ width: '81%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#737874] mt-1">
                <span>81% Max Affinity</span>
                <span className="text-[#4f6359] font-semibold">Low Pivot Friction</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-[#737874] uppercase font-bold">
                <span>04 // Economic Arbitrage</span>
                <span className="text-[#4f6359]">+68% Delta</span>
              </div>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold mt-1">Compensation Upside</h3>
              <p className="text-xs text-[#737874]">Entry $72k → Senior $122k median</p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#f1eee7] flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-[#737874] uppercase block">Median Base Shift</span>
                <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">+$50,000</span>
              </div>
              <span className="text-xs text-[#4f6359] font-bold">4.2x ROI</span>
            </div>
          </div>
        </section>

        {/* View Mode Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc]">
          <div className="flex flex-wrap items-center gap-1">
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
                className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeViewMode === tab.id
                    ? 'bg-white text-[#0d1f18] shadow-xs'
                    : 'text-[#737874] hover:text-[#0d1f18]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#737874]">Click any role below to inspect deep-dive requirements</span>
        </div>

        {/* Asymmetric Workbench: 8 Cols Visual Progression Tree + 4 Cols Deep Dive Dossier */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: VISUAL CAREER MAP */}
          <div className="lg:col-span-8 space-y-6">
            {/* Vertical Tree */}
            {(activeViewMode === 'all' || activeViewMode === 'vertical' || activeViewMode === 'compensation') && (
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                  <h3 className="font-headline-sm text-headline-sm text-[#0d1f18]">
                    Vertical Advancement Ladder
                  </h3>
                  <span className="text-xs text-[#737874]">Primary Technical Promotion Track</span>
                </div>

                <div className="space-y-4">
                  {/* Node 1: Current Data Analyst */}
                  <div
                    onClick={() => setSelectedRoleId('data-analyst')}
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRoleId === 'data-analyst'
                        ? 'bg-[#d2e7dc]/30 border-[#4f6359] shadow-sm'
                        : 'bg-[#fcf9f3] border-[#e5e2dc] hover:bg-[#f6f3ed]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#d2e7dc] text-[#0d1f18] flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#737874] uppercase">Level IC2</span>
                            <span className="px-2 py-0.2 rounded bg-[#d2e7dc] text-[#0d1f18] text-[10px] font-bold">
                              Current Baseline
                            </span>
                          </div>
                          <h4 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Data Analyst</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[#737874] block">Market Range</span>
                        <span className="font-bold text-[#0d1f18]">$68,000 – $85,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Transition Connector */}
                  <div className="flex items-center gap-4 px-6 text-xs text-[#737874]">
                    <div className="w-0.5 h-8 bg-[#6b4ea6]"></div>
                    <span className="p-1 px-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc]">
                      Promotion Gate: 80% Demonstrated Readiness &amp; Dimensional Modeling Mastery
                    </span>
                  </div>

                  {/* Node 2: Senior Data Analyst (Recommended) */}
                  <div
                    onClick={() => setSelectedRoleId('senior-data-analyst')}
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRoleId === 'senior-data-analyst'
                        ? 'bg-[#eaddff]/30 border-[#6b4ea6] shadow-md ring-2 ring-[#6b4ea6]/20'
                        : 'bg-[#fcf9f3] border-[#e5e2dc] hover:bg-[#f6f3ed]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6b4ea6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          2
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#737874] uppercase">Level IC4</span>
                            <span className="px-2 py-0.2 rounded bg-[#6b4ea6] text-white text-[10px] font-bold">
                              Recommended Next Step
                            </span>
                          </div>
                          <h4 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Senior Data Analyst</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[#737874] block">Market Range</span>
                        <span className="font-bold text-[#0d1f18]">$110,000 – $135,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Transition Connector */}
                  <div className="flex items-center gap-4 px-6 text-xs text-[#737874]">
                    <div className="w-0.5 h-8 bg-[#e5e2dc]"></div>
                    <span className="p-1 px-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc]">
                      Leadership Gate: Cross-Departmental Attribution &amp; Team Mentorship
                    </span>
                  </div>

                  {/* Node 3: Analytics Lead */}
                  <div
                    onClick={() => setSelectedRoleId('analytics-lead')}
                    className={`p-5 rounded-lg border cursor-pointer transition-all ${
                      selectedRoleId === 'analytics-lead'
                        ? 'bg-[#f6f3ed] border-[#0d1f18] shadow-sm'
                        : 'bg-[#fcf9f3] border-[#e5e2dc] hover:bg-[#f6f3ed]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e5e2dc] text-[#737874] flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#737874] uppercase">Level IC5</span>
                          <h4 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Analytics Lead</h4>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[#737874] block">Market Range</span>
                        <span className="font-bold text-[#0d1f18]">$140,000 – $175,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lateral Branches Section */}
            {(activeViewMode === 'all' || activeViewMode === 'lateral') && (
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-[#0d1f18]">
                      Viable Lateral Branches
                    </h3>
                    <p className="text-xs text-[#737874]">Alternative horizontal career paths sharing core competency overlap</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedRoleId('bi-analyst')}
                    className={`p-5 rounded-lg border cursor-pointer transition-all ${
                      selectedRoleId === 'bi-analyst'
                        ? 'bg-[#eaddff]/30 border-[#6b4ea6]'
                        : 'bg-[#fcf9f3] border-[#e5e2dc] hover:bg-[#f6f3ed]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#4f6359] bg-[#d2e7dc] px-2 py-0.5 rounded">
                        81% Competency Match
                      </span>
                      <span className="text-xs font-semibold text-[#737874]">$104k avg</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-[#0d1f18] font-bold">BI Analyst</h4>
                    <p className="text-xs text-[#424845] mt-1">Deepening semantic layer, Enterprise reporting governance, and dashboarding.</p>
                  </div>

                  <div
                    onClick={() => setSelectedRoleId('product-analyst')}
                    className={`p-5 rounded-lg border cursor-pointer transition-all ${
                      selectedRoleId === 'product-analyst'
                        ? 'bg-[#eaddff]/30 border-[#6b4ea6]'
                        : 'bg-[#fcf9f3] border-[#e5e2dc] hover:bg-[#f6f3ed]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#6b4ea6] bg-[#eaddff] px-2 py-0.5 rounded">
                        72% Competency Match
                      </span>
                      <span className="text-xs font-semibold text-[#737874]">$112k avg</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-[#0d1f18] font-bold">Product Analyst</h4>
                    <p className="text-xs text-[#424845] mt-1">User event analytics, funnel optimization, cohort retention, and A/B test design.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 4 COLUMNS: SELECTED ROLE DEEP-DIVE DOSSIER */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            <div className="bg-white rounded-xl p-6 sm:p-7 border-2 border-[#6b4ea6]/40 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#6b4ea6] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6b4ea6]"></span>
                  ACTIVE DOSSIER PREVIEW
                </span>
                <span className="text-xs text-[#737874]">{selectedRole.level}</span>
              </div>

              <div>
                <span className="px-2 py-0.5 rounded bg-[#eaddff] text-[#25005a] text-[10px] font-bold uppercase">
                  {selectedRole.badge}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-[#0d1f18] font-bold mt-1">
                  {selectedRole.title}
                </h3>
                <p className="text-xs text-[#424845] mt-1 leading-relaxed">
                  {selectedRole.description}
                </p>
                <div className="text-xs text-[#737874] mt-2">
                  Market Benchmark: <strong className="text-[#0d1f18]">{selectedRole.benchmarkSalary}</strong>
                </div>
              </div>

              {/* Competency Clearance Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0d1f18] uppercase">1. Competency Clearance Matrix</span>
                  <span className="font-bold text-[#6b4ea6]">
                    <AnimatedNumber value={selectedRole.readinessScore} suffix="% Match" durationMs={500} />
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedRole.skills.map((s) => (
                    <div key={s.name} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#424845]">{s.name}</span>
                        <span className="font-mono">
                          {s.current}% / {s.target}% <span className={s.gap < 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}>({s.gap})</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e5e2dc] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.current >= 70 ? 'bg-[#0d1f18]' : 'bg-[#6b4ea6]'}`}
                          style={{ width: `${Math.min(s.current, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Locker Gate */}
              <div className="space-y-2.5 pt-2 border-t border-[#f1eee7]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0d1f18] uppercase">2. Evidence Locker Gate</span>
                  <span className="text-[#737874]">{selectedRole.evidenceRequirements.filter((r) => r.done).length} of {selectedRole.evidenceRequirements.length} Verified</span>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedRole.evidenceRequirements.map((req, rIdx) => (
                    <div key={rIdx} className="p-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc] flex items-start gap-2">
                      <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${req.done ? 'text-[#4f6359]' : 'text-[#737874]'}`}>
                        {req.done ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`leading-snug ${req.done ? 'text-[#0d1f18] font-semibold' : 'text-[#737874]'}`}>
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
                  className="btn-interactive w-full py-3 px-4 rounded bg-[#0d1f18] hover:bg-[#22382f] text-white font-title-md text-title-md font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
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

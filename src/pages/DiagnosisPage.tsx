import React from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageTransition, AnimatedNumber } from '../components/motion/Motion';

export const DiagnosisPage: React.FC = () => {
  const { state, hasProfile, careerReadiness, skillGaps, largestGap } = useAtlas();

  if (!hasProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9]">
        <Header />
        <main className="w-full pt-28 flex-1 max-w-xl mx-auto px-4 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-[#A78BFA] text-2xl font-bold mb-4 shadow-sm">
            ?
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-2 tracking-tight">
            Complete your ATLAS profile to begin.
          </h2>
          <p className="text-sm text-[#94A3B8] mb-6 max-w-md">
            Configure your target career goal and baseline competencies to calibrate your diagnostic command centre, empirical deficits, and dynamic roadmap.
          </p>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Create my profile →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const deficit = Math.max(80 - careerReadiness, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Editorial Banner */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#A78BFA] font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse"></span>
              Career Architecture · Overview
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Good morning, {state.profile.fullName.split(' ')[0] || 'Candidate'}.
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1 font-serif italic">
              Here is where your career architecture stands today.
            </p>
          </div>

          <div className="flex items-center gap-2 text-right shrink-0">
            <div className="glass-panel border-white/10 px-4 py-2.5 rounded-xl flex flex-col items-end">
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Target Goal</span>
              <span className="text-base text-white font-bold">{state.targetRole || 'Not Set'}</span>
            </div>
          </div>
        </section>

        {/* First-Time Assessment Callout for Unassessed Candidates */}
        {!state.assessmentCompleted && (
          <section className="glass-panel border-violet-500/30 bg-violet-950/20 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
            <div className="space-y-1 max-w-2xl relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse"></span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#A78BFA] font-bold">
                  Step 2 · Calibrated Assessment
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                Take your assessment to unlock empirical scoring.
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                You are currently viewing estimated baseline ratings. Take your 10-question calibrated role assessment (5 theory + 5 live code tracing) to empirically measure your capabilities and dynamically adapt your career roadmap.
              </p>
            </div>
            <Link
              to="/assessment"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shrink-0 flex items-center gap-2 shadow-sm transition-all relative z-10"
            >
              <span>Start Assessment</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </section>
        )}

        {/* SECTION 2: Hero Command Strip (Composite Overview) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Primary Gauge Card (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              {/* Meta Pill Row */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-6">
                <div className="inline-flex items-center gap-2 bg-[#0D1224] border border-white/10 px-3 py-1.5 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                  <span className="text-xs font-mono text-white font-bold tracking-wide uppercase">
                    Target Role: {state.targetRole}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#64748B]">
                  Empirical Calibration: Standardized Competency Model
                </span>
              </div>

              {/* Hero Metrics & Statement */}
              <div className="flex flex-col md:flex-row md:items-baseline gap-6 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold tracking-tight text-white font-mono leading-none">
                    <AnimatedNumber value={careerReadiness} durationMs={700} />
                  </span>
                  <span className="text-2xl font-bold text-[#A78BFA] font-mono">%</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-white">
                      You are {careerReadiness}% ready for your target role.
                    </span>
                  </div>
                  <p className="text-sm text-[#94A3B8] max-w-xl mt-1 leading-relaxed">
                    {deficit > 0
                      ? `You are ${deficit} points away from bypassing automated recruiter filters. Eliminating your primary technical bottleneck (${largestGap.skill}) will propel you into the 82nd candidate percentile.`
                      : 'You have met and surpassed the benchmark screening criteria for this role.'}
                  </p>
                </div>
              </div>

              {/* Dual-State Benchmark Bar */}
              <div className="w-full bg-[#0D1224]/80 rounded-xl p-4 mb-6 border border-white/10">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span>
                    <span className="text-white">Current Composite: {careerReadiness}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-rose-500 rounded-xs"></span>
                    <span className="text-[#94A3B8]">Enterprise Hiring Threshold: <strong className="text-white">80%</strong></span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="relative w-full h-3 bg-[#172039] rounded-full overflow-visible flex items-center">
                  <div
                    className="h-full bg-violet-600 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.min(careerReadiness, 100)}%` }}
                  />
                  {/* 80% Benchmark Tick Marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                    style={{ left: '80%' }}
                  >
                    <div className="w-1 h-5 bg-rose-500 rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-[#64748B] mt-2">
                  <span>0% Fresh Graduate Baseline</span>
                  <span className="text-rose-400 font-semibold">
                    {deficit > 0 ? `Deficit: -${deficit} pts to interview threshold` : 'Threshold Cleared'}
                  </span>
                  <span>100% Ready</span>
                </div>
              </div>
            </div>

            {/* Action Link Footnote */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 relative z-10">
              <Link
                to="/career-roadmap"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Continue your plan</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              {state.assessmentCompleted ? (
                <Link
                  to="/assessment/result"
                  className="text-xs font-mono text-[#A78BFA] hover:text-white flex items-center gap-1 font-semibold transition-colors"
                >
                  View full assessment diagnosis
                  <span className="material-symbols-outlined text-[14px]">north_east</span>
                </Link>
              ) : (
                <Link
                  to="/assessment"
                  className="text-xs font-mono text-[#A78BFA] hover:text-white flex items-center gap-1 font-semibold transition-colors"
                >
                  Start Assessment
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Algorithmic Insight Card (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 glass-panel border-violet-500/30 bg-violet-950/20 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-[#A78BFA] text-[10px] font-mono font-bold tracking-wider uppercase border border-violet-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"></span>
                  ATLAS ALGORITHMIC INSIGHT
                </span>
                <span className="material-symbols-outlined text-[#A78BFA] text-[20px]">bolt</span>
              </div>

              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white font-serif leading-snug">
                  "{largestGap.skill} is currently your highest-impact development area."
                </h2>
                <p className="text-xs text-[#94A3B8] mt-2.5 leading-relaxed">
                  Your largest current competency gap is <strong className="text-white">{largestGap.skill}</strong>. ATLAS prioritises it because your demonstrated level is furthest below the role threshold (deficit: -{largestGap.gap} pts).
                </p>
                <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                  Failing the technical screening eliminates applicants before advanced architecture or portfolio logic is evaluated.
                </p>
              </div>
            </div>

            <div className="glass-panel border-white/10 rounded-xl p-4 mt-6 bg-[#0D1224]/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="text-[#64748B] uppercase font-mono text-[10px] tracking-wider">Sprint Resolution Return</span>
                  <span className="text-lg font-bold text-[#2DD4BF] font-mono mt-0.5">+9.2 pts</span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] uppercase font-mono text-[10px] tracking-wider">Projected Readiness</span>
                  <span className="text-lg font-bold text-white font-mono mt-0.5">
                    {Math.min(careerReadiness + 9, 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Multi-Column Command Grid (8 Cols Canvas + 4 Cols Rail) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT 8 COLUMNS: MAIN WORKSPACE CANVAS ================= */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* MODULE A: THIS WEEK: EXECUTION & MOMENTUM */}
            <div className="glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[#A78BFA]">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Execution &amp; Momentum</span>
                    <h3 className="text-base font-bold text-white">This Week's Focus</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-[#A78BFA] text-[10px] font-mono font-bold uppercase tracking-wider border border-violet-500/30">
                    Sprint 03
                  </span>
                  <span className="text-xs font-mono text-white font-semibold">
                    6.5 / {state.availability}.0 hrs (65%)
                  </span>
                </div>
              </div>

              {/* Progress Mini Meter */}
              <div className="flex flex-col gap-1.5">
                <div className="w-full h-2 bg-[#0D1224] rounded-full overflow-hidden flex border border-white/5">
                  <div className="h-full bg-violet-600 transition-all rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-[#64748B] font-mono">
                  <span>Goal: {state.availability} hrs / week</span>
                  <span className="text-[#A78BFA] font-medium">3.5 hrs remaining to complete Sprint 03 target</span>
                </div>
              </div>

              {/* Next Best Action Container */}
              <div className="bg-[#0D1224]/80 border border-white/10 rounded-xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[#2DD4BF] font-mono font-bold uppercase tracking-wider text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      Your Next Best Action
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-[#94A3B8] font-mono text-[11px]">Estimated: 45 Minutes</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] text-[10px] font-mono font-semibold">
                    High-Impact Synthesis
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <h4 className="text-lg font-bold text-white font-serif">
                      Build your {largestGap.skill} project
                    </h4>
                    <p className="text-xs text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
                      Synthesize key technical patterns (multi-table relationships, context transitions) on real transactional data. Fulfills Evidence Locker Entry.
                    </p>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                    <Link
                      to="/career-roadmap"
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Start now</span>
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sprint Velocity Log */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                  Sprint Velocity Log (This Week)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  <div className="bg-[#0D1224] p-3 rounded-xl text-center border border-white/5">
                    <span className="text-[#64748B] text-[10px] font-mono block">Mon</span>
                    <span className="text-[#2DD4BF] font-bold flex items-center justify-center gap-0.5 mt-1 font-mono">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> 2h
                    </span>
                    <span className="text-[10px] text-[#94A3B8] truncate block mt-0.5">SQL Drill</span>
                  </div>
                  <div className="bg-[#0D1224] p-3 rounded-xl text-center border border-white/5">
                    <span className="text-[#64748B] text-[10px] font-mono block">Tue</span>
                    <span className="text-[#2DD4BF] font-bold flex items-center justify-center gap-0.5 mt-1 font-mono">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> 2.5h
                    </span>
                    <span className="text-[10px] text-[#94A3B8] truncate block mt-0.5">Star-Schema</span>
                  </div>
                  <div className="bg-[#0D1224] p-3 rounded-xl text-center border border-white/5">
                    <span className="text-[#64748B] text-[10px] font-mono block">Wed</span>
                    <span className="text-[#2DD4BF] font-bold flex items-center justify-center gap-0.5 mt-1 font-mono">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> 2h
                    </span>
                    <span className="text-[10px] text-[#94A3B8] truncate block mt-0.5">DAX Context</span>
                  </div>
                  <div className="bg-violet-950/40 p-3 rounded-xl text-center border border-violet-500/40 shadow-sm">
                    <span className="text-[#A78BFA] font-bold text-[10px] font-mono block">Today (Thu)</span>
                    <span className="text-white font-bold flex items-center justify-center gap-0.5 mt-1 font-mono">
                      <span className="material-symbols-outlined text-[14px] text-[#A78BFA] animate-pulse">pending</span> Active
                    </span>
                    <span className="text-[10px] text-[#A78BFA] font-semibold block mt-0.5">PBI Project</span>
                  </div>
                  <div className="bg-[#0D1224]/60 p-3 rounded-xl text-center border border-white/5 opacity-60">
                    <span className="text-[#64748B] text-[10px] font-mono block">Fri</span>
                    <span className="text-[#64748B] font-mono text-xs block mt-1">Queued</span>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">Peer Review</span>
                  </div>
                  <div className="bg-[#0D1224]/60 p-3 rounded-xl text-center border border-white/5 opacity-60">
                    <span className="text-[#64748B] text-[10px] font-mono block">Sat</span>
                    <span className="text-[#64748B] font-mono text-xs block mt-1">Queued</span>
                    <span className="text-[10px] text-[#64748B] block mt-0.5">Interview Prep</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE B: SKILL GAPS & CAPABILITY DEFICIT TRIAGE */}
            <div className="glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[#A78BFA]">
                    <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Algorithmic Diagnostic</span>
                    <h3 className="text-base font-bold text-white">What is holding you back?</h3>
                  </div>
                </div>

                <Link
                  to="/skill-gaps"
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono font-bold tracking-wide hover:bg-rose-500/20 transition-colors"
                >
                  View all skill gaps →
                </Link>
              </div>

              {/* Top 3 Skill Gap Cards */}
              <div className="flex flex-col gap-4">
                {skillGaps.slice(0, 3).map((item) => (
                  <div
                    key={item.skill}
                    className="bg-[#0D1224]/80 border border-white/10 rounded-xl p-5 flex flex-col gap-3 transition-all hover:border-violet-500/40 hover:shadow-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#172039] border border-white/10 flex items-center justify-center text-[#A78BFA] shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[22px]">
                            {item.skill === 'Power BI' ? 'bar_chart' : item.skill === 'SQL' ? 'database' : 'present_to_all'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{item.displayName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              item.priority === 'HIGH PRIORITY'
                                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                                : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-xs text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end shrink-0">
                        <div className="flex items-baseline gap-1 text-sm font-semibold font-mono">
                          <span className="text-white font-bold">{item.demonstrated}%</span>
                          <span className="text-[#64748B] font-normal text-xs">/ target {item.roleThreshold}%</span>
                        </div>
                        <span className={`text-xs font-mono font-bold flex items-center gap-0.5 mt-0.5 ${item.gap > 0 ? 'text-rose-400' : 'text-[#2DD4BF]'}`}>
                          {item.gap > 0 ? `Δ -${item.gap} pts Deficit` : 'Target Met'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="relative w-full h-2.5 bg-[#172039] rounded-full flex items-center mt-1">
                      <div
                        className={`h-full rounded-l-full ${item.priority === 'HIGH PRIORITY' ? 'bg-rose-500' : 'bg-violet-500'}`}
                        style={{ width: `${Math.min(item.demonstrated, 100)}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded shadow-sm"
                        style={{ left: `${item.roleThreshold}%` }}
                        title={`Threshold: ${item.roleThreshold}%`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#64748B] font-mono text-[11px]">Role Threshold: {item.roleThreshold}%</span>
                      <Link
                        to="/career-roadmap"
                        className="px-3 py-1 rounded-lg bg-[#172039] text-white hover:bg-violet-600/30 text-xs font-semibold flex items-center gap-1 transition-colors border border-white/10"
                      >
                        <span>Resolve in roadmap</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MODULE C: ROADMAP PROGRESSION PREVIEW */}
            <div className="glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[#A78BFA]">
                    <span className="material-symbols-outlined text-[20px]">route</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Milestone Sequence</span>
                    <h3 className="text-base font-bold text-white">
                      Your Milestone Sequence ({state.roadmapSteps.filter((s) => s.completed).length} / {state.roadmapSteps.length} Completed)
                    </h3>
                  </div>
                </div>

                <Link
                  to="/career-roadmap"
                  className="text-xs font-mono text-[#A78BFA] hover:text-white flex items-center gap-1 font-semibold transition-colors"
                >
                  Open full personal roadmap
                  <span className="material-symbols-outlined text-[14px]">east</span>
                </Link>
              </div>

              {/* Milestone nodes */}
              <div className="space-y-4">
                {state.roadmapSteps.slice(0, 3).map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-xl bg-[#0D1224]/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-violet-500/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5 ${
                        step.completed
                          ? 'bg-teal-500/20 border border-teal-500/40 text-[#2DD4BF]'
                          : idx === 0
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-[#172039] border border-white/10 text-[#64748B]'
                      }`}>
                        {step.completed ? '✓' : `0${idx + 1}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{step.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            step.completed ? 'bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30' : 'bg-violet-500/20 text-[#A78BFA] border border-violet-500/30'
                          }`}>
                            {step.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-1">{step.description}</p>
                      </div>
                    </div>

                    <Link
                      to={`/roadmap/${step.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#172039] border border-white/10 hover:border-violet-500/50 text-xs font-semibold text-white shrink-0 self-end sm:self-center flex items-center gap-1 transition-all"
                    >
                      <span>View Step</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT 4 COLUMNS: ACTION & CALIBRATION RAIL ================= */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* MODULE D: EVIDENCE LOCKER SUMMARY */}
            <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#A78BFA] text-[20px]">folder_special</span>
                  <h3 className="text-sm font-bold text-white">Evidence Readiness</h3>
                </div>
                <span className="text-sm font-mono text-[#2DD4BF] font-bold">48%</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="w-full h-2 bg-[#0D1224] rounded-full overflow-hidden flex border border-white/5">
                  <div className="h-full bg-violet-600 rounded-full" style={{ width: '48%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-[#64748B] font-mono">
                  <span>{state.evidence.length} Verified Projects</span>
                  <span>4 Skills Proven</span>
                </div>
                <p className="text-xs text-rose-400 font-mono mt-1">
                  Δ 32% deficit against recruiter confidence threshold (80%).
                </p>
              </div>

              {/* Submitted Project Cards Preview */}
              <div className="space-y-2.5 pt-1">
                {state.evidence.slice(0, 2).map((ev) => (
                  <div key={ev.id} className="bg-[#0D1224] p-3 rounded-xl border border-white/10 border-l-4 border-l-violet-500 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate max-w-[180px]">{ev.title}</span>
                      <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-[10px] font-mono font-semibold text-[#A78BFA]">
                        {ev.verificationStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono">{ev.skill} · {ev.type}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/evidence"
                className="w-full py-2.5 rounded-xl bg-[#172039] hover:bg-violet-600/30 text-white text-xs font-semibold text-center transition-all block border border-white/10"
              >
                + Add a project to locker
              </Link>
            </div>

            {/* MODULE E: CAREER TRAJECTORY & HORIZON MAP */}
            <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#A78BFA] text-[20px]">timeline</span>
                  <h3 className="text-sm font-bold text-white">Where can you go next?</h3>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Horizon</span>
              </div>

              {/* Progression Tree */}
              <div className="space-y-2 text-xs">
                <div className="bg-[#0D1224] p-3 rounded-xl flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold font-mono">1</div>
                    <div>
                      <div className="font-bold text-white">Junior {state.targetRole}</div>
                      <div className="text-[#64748B] text-[11px]">Target Role (Active)</div>
                    </div>
                  </div>
                  <span className="text-[#2DD4BF] font-mono text-xs font-bold">Active Goal</span>
                </div>

                <div className="flex justify-center text-[#64748B]">
                  <span className="material-symbols-outlined text-[16px]">south</span>
                </div>

                <div className="bg-violet-950/30 p-3 rounded-xl flex items-center justify-between border border-violet-500/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center font-bold font-mono">2</div>
                    <div>
                      <div className="font-bold text-white">Senior {state.targetRole}</div>
                      <div className="text-[#A78BFA] font-medium text-[11px]">$110k–$135k Expected</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse"></span>
                </div>

                <div className="flex justify-center text-[#64748B]">
                  <span className="material-symbols-outlined text-[16px]">south</span>
                </div>

                <div className="bg-[#0D1224]/60 p-3 rounded-xl flex items-center justify-between border border-white/5 opacity-70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#172039] text-[#64748B] flex items-center justify-center font-bold font-mono">3</div>
                    <div>
                      <div className="font-medium text-[#94A3B8]">Analytics Lead / Manager</div>
                      <div className="text-[#64748B] text-[11px]">3 Yrs Horizon</div>
                    </div>
                  </div>
                  <span className="text-[#64748B] font-mono text-[11px]">3 Yrs</span>
                </div>
              </div>

              <Link
                to="/career-map"
                className="text-center text-xs font-mono text-[#A78BFA] hover:text-white block pt-1 font-semibold transition-colors"
              >
                Explore full interactive career map →
              </Link>
            </div>

            {/* MODULE F: COHORT TELEMETRY */}
            <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#A78BFA] text-[20px]">speed</span>
                  <h3 className="text-sm font-bold text-white">Cohort Telemetry</h3>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-[#2DD4BF] text-[10px] font-mono font-bold uppercase border border-teal-500/30">
                  Top 14%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#0D1224] p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#64748B] uppercase font-mono block">Percentile</span>
                  <span className="text-xl font-mono text-white font-bold mt-0.5 block">86th</span>
                  <span className="text-[10px] text-[#2DD4BF] font-mono font-semibold block mt-0.5">↑ 4.1 pts this wk</span>
                </div>
                <div className="bg-[#0D1224] p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-[#64748B] uppercase font-mono block">Logged Sprint</span>
                  <span className="text-xl font-mono text-white font-bold mt-0.5 block">10.5h</span>
                  <span className="text-[10px] text-[#64748B] font-mono block mt-0.5">+3.2d pacing</span>
                </div>
              </div>

              {/* Quick Defense Drill widget */}
              <div className="bg-[#0D1224] rounded-xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white font-mono">
                  <span>QUICK DEFENSE DRILL</span>
                  <span className="text-[#A78BFA]">5 min</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Practice defending your DAX context transition logic or SQL join cardinality choices.
                </p>
                <Link
                  to="/evidence"
                  className="w-full mt-2 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  <span>Launch Practice Drill</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Prominent Quick Action Footer Strip */}
        <section className="w-full glass-panel-elevated border-violet-500/30 rounded-2xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 text-[#A78BFA] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A78BFA] font-bold">
                Active Sprint // Day 04
              </span>
              <span className="text-sm sm:text-base font-bold text-white">
                {largestGap.skill} Build Session is ready for your afternoon block.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end relative z-10">
            <Link
              to="/resources"
              className="px-4 py-2 rounded-xl text-[#94A3B8] hover:text-white text-xs font-mono transition-colors"
            >
              Adjust weekly hours
            </Link>
            <Link
              to="/career-roadmap"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Resume Workspace (45 min)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};

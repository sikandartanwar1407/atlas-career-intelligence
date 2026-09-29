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
      <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
        <Header />
        <main className="w-full pt-28 flex-1 max-w-xl mx-auto px-4 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#f6f3ed] border border-[#e5e2dc] flex items-center justify-center text-[#6b4ea6] text-2xl font-bold mb-4">
            ?
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#0d1f18] mb-2">
            Complete your ATLAS profile to begin.
          </h2>
          <p className="text-xs text-[#424845] mb-6">
            Configure your target career goal and profile to calibrate your diagnostic command centre, competency gaps, and roadmap.
          </p>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-lg bg-[#0d1f18] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#22382f]"
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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Editorial Banner */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e5e2dc]">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold mb-1">
              Career Architecture · Overview
            </span>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Good morning, {state.profile.fullName.split(' ')[0] || 'Candidate'}.
            </h1>
            <p className="font-headline-sm text-headline-sm text-[#424845] mt-1 italic font-serif">
              Here's where your career architecture stands today.
            </p>
          </div>

          <div className="flex items-center gap-2 text-right shrink-0">
            <div className="bg-[#f6f3ed] border border-[#e5e2dc] px-4 py-2 rounded-lg flex flex-col items-end card-interactive">
              <span className="font-label-sm text-label-sm text-[#737874] uppercase tracking-wider">Target Goal</span>
              <span className="font-title-md text-title-md text-[#0d1f18] font-bold">{state.targetRole || 'Not Set'}</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: Hero Command Strip (Composite Overview) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Primary Gauge Card (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white border border-[#e5e2dc] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden card-interactive">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#eaddff]/30 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              {/* Meta Pill Row */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-6">
                <div className="inline-flex items-center gap-2 bg-[#f1eee7] px-3 py-1 rounded">
                  <span className="w-2 h-2 rounded-full bg-[#6b4ea6]"></span>
                  <span className="font-label-sm text-label-sm text-[#0d1f18] font-bold tracking-wide uppercase">
                    Target Role: {state.targetRole}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-[#737874]">
                  Empirical Calibration: Standardized Competency Model
                </span>
              </div>

              {/* Hero Metrics & Statement */}
              <div className="flex flex-col md:flex-row md:items-baseline gap-6 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-xl text-[64px] leading-none text-[#0d1f18] font-serif font-bold">
                    <AnimatedNumber value={careerReadiness} durationMs={700} />
                  </span>
                  <span className="font-headline-md text-headline-md text-[#6b4ea6] font-serif">%</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-title-lg text-title-lg text-[#0d1f18] font-bold">
                      You are {careerReadiness}% ready for your target role.
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-[#424845] max-w-xl mt-1 leading-relaxed">
                    {deficit > 0
                      ? `You are ${deficit} points away from bypassing automated recruiter filters. Eliminating your primary technical bottleneck (${largestGap.skill}) will propel you into the 82nd candidate percentile.`
                      : 'You have met and surpassed the benchmark screening criteria for this role.'}
                  </p>
                </div>
              </div>

              {/* Dual-State Benchmark Bar */}
              <div className="w-full bg-[#f6f3ed] rounded-lg p-4 mb-6 border border-[#e5e2dc]">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-[#0d1f18]"></span>
                    <span className="text-[#0d1f18]">Current Composite: {careerReadiness}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-0.5 h-3 bg-[#ba1a1a]"></span>
                    <span className="text-[#424845]">Enterprise Hiring Threshold: <strong className="text-[#0d1f18]">80%</strong></span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="relative w-full h-3 bg-[#e5e2dc] rounded-full overflow-visible flex items-center">
                  <div
                    className="h-full bg-[#0d1f18] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(careerReadiness, 100)}%` }}
                  />
                  {/* 80% Benchmark Tick Marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                    style={{ left: '80%' }}
                  >
                    <div className="w-1 h-5 bg-[#ba1a1a] rounded-full shadow-xs"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-label-sm text-[#737874] mt-2">
                  <span>0% Fresh Graduate Baseline</span>
                  <span className="text-[#ba1a1a] font-medium">
                    {deficit > 0 ? `Deficit: -${deficit} pts to interview threshold` : 'Threshold Cleared'}
                  </span>
                  <span>100% Ready</span>
                </div>
              </div>
            </div>

            {/* Action Link Footnote */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#f1eee7]">
              <Link
                to="/career-roadmap"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d1f18] text-white hover:bg-[#22382f] rounded font-title-md text-title-md font-semibold transition-colors shadow-xs"
              >
                <span>Continue your plan</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                to="/assessment/result"
                className="font-label-md text-label-md text-[#6b4ea6] hover:underline flex items-center gap-1 font-semibold"
              >
                View full assessment diagnosis
                <span className="material-symbols-outlined text-[14px]">north_east</span>
              </Link>
            </div>
          </div>

          {/* Right Algorithmic Insight Card (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-[#eaddff]/20 border border-[#eaddff] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaddff] text-[#25005a] font-label-sm text-label-sm font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
                  ATLAS ALGORITHMIC INSIGHT
                </span>
                <span className="material-symbols-outlined text-[#6b4ea6] text-[20px]">bolt</span>
              </div>

              <div className="flex flex-col">
                <h2 className="font-headline-sm text-headline-sm text-[#0d1f18] font-serif">
                  "{largestGap.skill} is currently your highest-impact development area."
                </h2>
                <p className="font-body-sm text-body-sm text-[#424845] mt-2 leading-relaxed">
                  Your largest current competency gap is <strong className="text-[#0d1f18]">{largestGap.skill}</strong>. ATLAS prioritises it because your demonstrated level is furthest below the role threshold (deficit: -{largestGap.gap} pts).
                </p>
                <p className="font-body-sm text-body-sm text-[#424845] mt-2 leading-relaxed">
                  Failing the technical screening eliminates fresh applicants before SQL or portfolio logic is evaluated.
                </p>
              </div>
            </div>

            <div className="bg-white/80 border border-[#e5e2dc] rounded-lg p-4 mt-6 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="text-[#737874] uppercase font-semibold">Sprint Resolution Return</span>
                  <span className="font-title-lg text-title-lg text-[#6b4ea6] font-bold">+9.2 pts</span>
                </div>
                <div className="text-right">
                  <span className="text-[#737874] uppercase font-semibold">Projected Readiness</span>
                  <span className="font-title-lg text-title-lg text-[#0d1f18] font-bold">
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
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1eee7]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f1eee7] flex items-center justify-center text-[#0d1f18]">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#737874]">Execution &amp; Momentum</span>
                    <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">This Week's Focus</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#eaddff]/60 text-[#25005a] font-label-sm text-label-sm font-bold uppercase tracking-wider">
                    Sprint 03
                  </span>
                  <span className="font-label-md text-label-md text-[#0d1f18] font-semibold">
                    6.5 / {state.availability}.0 hrs (65%)
                  </span>
                </div>
              </div>

              {/* Progress Mini Meter */}
              <div className="flex flex-col gap-1.5">
                <div className="w-full h-2 bg-[#f1eee7] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#6b4ea6] transition-all" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-[#737874]">
                  <span>Goal: {state.availability} hrs / week</span>
                  <span className="text-[#6b4ea6] font-medium">3.5 hrs remaining to complete Sprint 03 target</span>
                </div>
              </div>

              {/* Next Best Action Container */}
              <div className="bg-[#f6f3ed] border border-[#e5e2dc] rounded-xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[#6b4ea6] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      Your Next Best Action
                    </span>
                    <span className="text-[#c2c8c3]">•</span>
                    <span className="text-[#737874]">Estimated: 45 Minutes</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#e5e2dc] text-[#0d1f18] font-semibold">
                    High-Impact Synthesis
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <h4 className="font-headline-sm text-headline-sm text-[#0d1f18] font-serif font-bold">
                      Build your {largestGap.skill} project
                    </h4>
                    <p className="font-body-md text-body-md text-[#424845] mt-1 max-w-xl">
                      Synthesize key technical patterns (multi-table relationships, context transitions) on real transactional data. Fulfills Evidence Locker Entry.
                    </p>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                    <Link
                      to="/career-roadmap"
                      className="px-5 py-2.5 bg-[#0d1f18] text-white hover:bg-[#22382f] rounded font-title-md text-title-md font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Start now</span>
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sprint Velocity Log */}
              <div className="flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-[#737874] uppercase tracking-wider">
                  Sprint Velocity Log (This Week)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  <div className="bg-[#f6f3ed] p-2.5 rounded text-center border border-[#e5e2dc]">
                    <span className="text-[#737874] block">Mon</span>
                    <span className="text-[#6b4ea6] font-bold flex items-center justify-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> 2h
                    </span>
                    <span className="text-[10px] text-[#737874] truncate block">SQL Drill</span>
                  </div>
                  <div className="bg-[#f6f3ed] p-2.5 rounded text-center border border-[#e5e2dc]">
                    <span className="text-[#737874] block">Tue</span>
                    <span className="text-[#6b4ea6] font-bold flex items-center justify-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> 2.5h
                    </span>
                    <span className="text-[10px] text-[#737874] truncate block">Star-Schema</span>
                  </div>
                  <div className="bg-[#f6f3ed] p-2.5 rounded text-center border border-[#e5e2dc]">
                    <span className="text-[#737874] block">Wed</span>
                    <span className="text-[#6b4ea6] font-bold flex items-center justify-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> 2h
                    </span>
                    <span className="text-[10px] text-[#737874] truncate block">DAX Context</span>
                  </div>
                  <div className="bg-[#eaddff]/40 p-2.5 rounded text-center border border-[#6b4ea6]/40">
                    <span className="text-[#25005a] font-bold block">Today (Thu)</span>
                    <span className="text-[#0d1f18] font-bold flex items-center justify-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-[#6b4ea6]">pending</span> Active
                    </span>
                    <span className="text-[10px] text-[#6b4ea6] font-semibold block">PBI Project</span>
                  </div>
                  <div className="bg-[#f6f3ed]/60 p-2.5 rounded text-center opacity-75 border border-[#e5e2dc]">
                    <span className="text-[#737874] block">Fri</span>
                    <span className="text-[#737874] font-medium block mt-0.5">Queued</span>
                    <span className="text-[10px] text-[#737874] block">Peer Review</span>
                  </div>
                  <div className="bg-[#f6f3ed]/60 p-2.5 rounded text-center opacity-75 border border-[#e5e2dc]">
                    <span className="text-[#737874] block">Sat</span>
                    <span className="text-[#737874] font-medium block mt-0.5">Queued</span>
                    <span className="text-[10px] text-[#737874] block">Interview Prep</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODULE B: SKILL GAPS & CAPABILITY DEFICIT TRIAGE */}
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1eee7]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f1eee7] flex items-center justify-center text-[#0d1f18]">
                    <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#737874]">Algorithmic Diagnostic</span>
                    <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">What is holding you back?</h3>
                  </div>
                </div>

                <Link
                  to="/skill-gaps"
                  className="px-3 py-1 rounded bg-[#ffdad6] text-[#ba1a1a] font-label-sm text-label-sm font-bold tracking-wide hover:underline"
                >
                  View all skill gaps →
                </Link>
              </div>

              {/* Top 3 Skill Gap Cards */}
              <div className="flex flex-col gap-4">
                {skillGaps.slice(0, 3).map((item) => (
                  <div
                    key={item.skill}
                    className="bg-[#f6f3ed] border border-[#e5e2dc] rounded-xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#e5e2dc] flex items-center justify-center text-[#0d1f18] shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[22px]">
                            {item.skill === 'Power BI' ? 'bar_chart' : item.skill === 'SQL' ? 'database' : 'present_to_all'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-title-md text-title-md text-[#0d1f18] font-bold">{item.displayName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.priority === 'HIGH PRIORITY'
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : 'bg-[#ffddb3] text-[#291800]'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-[#424845] mt-1 max-w-xl">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end shrink-0">
                        <div className="flex items-baseline gap-1 text-sm font-semibold">
                          <span className="font-metric-sm text-metric-sm text-[#0d1f18]">{item.demonstrated}%</span>
                          <span className="text-[#737874] font-normal">/ target {item.roleThreshold}%</span>
                        </div>
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${item.gap > 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}`}>
                          {item.gap > 0 ? `Δ -${item.gap} pts Deficit` : 'Target Met'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="relative w-full h-2.5 bg-[#e5e2dc] rounded-full flex items-center mt-1">
                      <div
                        className={`h-full rounded-l-full ${item.priority === 'HIGH PRIORITY' ? 'bg-[#ba1a1a]' : 'bg-[#6b4ea6]'}`}
                        style={{ width: `${Math.min(item.demonstrated, 100)}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-[#0d1f18] rounded"
                        style={{ left: `${item.roleThreshold}%` }}
                        title={`Threshold: ${item.roleThreshold}%`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#737874]">Role Threshold: {item.roleThreshold}%</span>
                      <Link
                        to="/career-roadmap"
                        className="px-3 py-1 rounded bg-[#0d1f18] text-white hover:bg-[#22382f] text-xs font-semibold flex items-center gap-1 transition-colors"
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
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1eee7]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f1eee7] flex items-center justify-center text-[#0d1f18]">
                    <span className="material-symbols-outlined text-[20px]">route</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#737874]">Milestone Sequence</span>
                    <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">
                      Your Milestone Sequence ({state.roadmapSteps.filter((s) => s.completed).length} / {state.roadmapSteps.length} Completed)
                    </h3>
                  </div>
                </div>

                <Link
                  to="/career-roadmap"
                  className="font-label-md text-label-md text-[#6b4ea6] hover:underline flex items-center gap-1 font-semibold"
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
                    className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        step.completed
                          ? 'bg-[#0d1f18] text-white'
                          : idx === 0
                          ? 'bg-[#6b4ea6] text-white'
                          : 'bg-[#e5e2dc] text-[#424845]'
                      }`}>
                        {step.completed ? '✓' : `0${idx + 1}`}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-title-md text-title-md text-[#0d1f18] font-bold">{step.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            step.completed ? 'bg-[#d2e7dc] text-[#0d1f18]' : 'bg-[#eaddff] text-[#25005a]'
                          }`}>
                            {step.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-xs text-[#424845] mt-0.5">{step.description}</p>
                      </div>
                    </div>

                    <Link
                      to={`/roadmap/${step.id}`}
                      className="px-3 py-1.5 rounded bg-white border border-[#e5e2dc] hover:border-[#6b4ea6] text-xs font-semibold text-[#0d1f18] shrink-0 self-end sm:self-center flex items-center gap-1"
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
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6b4ea6] text-[20px]">folder_special</span>
                  <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Evidence Readiness</h3>
                </div>
                <span className="font-title-md text-title-md text-[#6b4ea6] font-bold">48%</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="w-full h-2 bg-[#e5e2dc] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#6b4ea6]" style={{ width: '48%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-[#737874]">
                  <span>{state.evidence.length} Verified Projects</span>
                  <span>4 Skills Proven</span>
                </div>
                <p className="text-xs text-[#ba1a1a] font-medium mt-1">
                  Δ 32% deficit against recruiter confidence threshold (80%).
                </p>
              </div>

              {/* Submitted Project Cards Preview */}
              <div className="space-y-2.5 pt-1">
                {state.evidence.slice(0, 2).map((ev) => (
                  <div key={ev.id} className="bg-[#f6f3ed] p-3 rounded-lg border-l-3 border-[#6b4ea6] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0d1f18] truncate max-w-[180px]">{ev.title}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white text-[10px] font-semibold text-[#6b4ea6]">
                        {ev.verificationStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#737874]">{ev.skill} · {ev.type}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/evidence"
                className="w-full py-2.5 rounded bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#0d1f18] font-label-md text-label-md font-semibold text-center transition-colors block border border-[#e5e2dc]"
              >
                + Add a project to locker
              </Link>
            </div>

            {/* MODULE E: CAREER TRAJECTORY & HORIZON MAP */}
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6b4ea6] text-[20px]">timeline</span>
                  <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Where can you go next?</h3>
                </div>
                <span className="font-label-sm text-label-sm text-[#737874] uppercase">Horizon</span>
              </div>

              {/* Progression Tree */}
              <div className="space-y-2 text-xs">
                <div className="bg-[#f6f3ed] p-3 rounded-lg flex items-center justify-between border border-[#e5e2dc]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#0d1f18] text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <div className="font-bold text-[#0d1f18]">Junior {state.targetRole}</div>
                      <div className="text-[#737874]">Target Role (Active)</div>
                    </div>
                  </div>
                  <span className="text-[#6b4ea6] font-bold">Active Goal</span>
                </div>

                <div className="flex justify-center text-[#c2c8c3]">
                  <span className="material-symbols-outlined text-[16px]">south</span>
                </div>

                <div className="bg-[#eaddff]/30 p-3 rounded-lg flex items-center justify-between border border-[#6b4ea6]/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#6b4ea6] text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <div className="font-bold text-[#0d1f18]">Senior {state.targetRole}</div>
                      <div className="text-[#6b4ea6] font-medium">$110k–$135k Expected</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#6b4ea6] animate-pulse"></span>
                </div>

                <div className="flex justify-center text-[#c2c8c3]">
                  <span className="material-symbols-outlined text-[16px]">south</span>
                </div>

                <div className="bg-[#f6f3ed]/60 p-3 rounded-lg flex items-center justify-between border border-[#e5e2dc] opacity-80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#e5e2dc] text-[#737874] flex items-center justify-center font-bold">3</div>
                    <div>
                      <div className="font-medium text-[#424845]">Analytics Lead / Manager</div>
                      <div className="text-[#737874]">3 Yrs Horizon</div>
                    </div>
                  </div>
                  <span className="text-[#737874]">3 Yrs</span>
                </div>
              </div>

              <Link
                to="/career-map"
                className="text-center font-label-md text-label-md text-[#6b4ea6] hover:underline block pt-1 font-semibold"
              >
                Explore full interactive career map →
              </Link>
            </div>

            {/* MODULE F: COHORT TELEMETRY */}
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6b4ea6] text-[20px]">speed</span>
                  <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Cohort Telemetry</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#d2e7dc] text-[#0d1f18] font-label-sm text-label-sm font-bold uppercase">
                  Top 14%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#f6f3ed] p-3 rounded border border-[#e5e2dc]">
                  <span className="text-[10px] text-[#737874] uppercase block">Percentile</span>
                  <span className="font-metric-sm text-metric-sm text-[#0d1f18] font-bold">86th</span>
                  <span className="text-[10px] text-[#6b4ea6] font-semibold block">↑ 4.1 pts this wk</span>
                </div>
                <div className="bg-[#f6f3ed] p-3 rounded border border-[#e5e2dc]">
                  <span className="text-[10px] text-[#737874] uppercase block">Logged Sprint</span>
                  <span className="font-metric-sm text-metric-sm text-[#0d1f18] font-bold">10.5h</span>
                  <span className="text-[10px] text-[#737874] block">+3.2d pacing</span>
                </div>
              </div>

              {/* Quick Defense Drill widget */}
              <div className="bg-[#f6f3ed] rounded-lg p-4 border border-[#e5e2dc] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#0d1f18]">
                  <span>QUICK DEFENSE DRILL</span>
                  <span className="text-[#6b4ea6]">5 min</span>
                </div>
                <p className="text-xs text-[#424845]">
                  Practice defending your DAX context transition logic or SQL join cardinality choices.
                </p>
                <Link
                  to="/evidence"
                  className="w-full mt-1 py-2 rounded bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  <span>Launch Practice Drill</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Prominent Quick Action Footer Strip */}
        <section className="w-full bg-[#0d1f18] rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#6b4ea6] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#eaddff] font-bold">
                Active Sprint // Day 04
              </span>
              <span className="font-title-md text-title-md text-white font-bold">
                {largestGap.skill} Build Session is ready for your afternoon block.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              to="/resources"
              className="px-4 py-2 rounded text-[#eaddff] hover:text-white font-label-md text-label-md transition-colors"
            >
              Adjust weekly hours
            </Link>
            <Link
              to="/career-roadmap"
              className="px-6 py-2.5 rounded bg-[#6b4ea6] hover:bg-[#eaddff] hover:text-[#25005a] text-white font-label-md text-label-md font-bold transition-all flex items-center gap-2 shadow-sm"
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

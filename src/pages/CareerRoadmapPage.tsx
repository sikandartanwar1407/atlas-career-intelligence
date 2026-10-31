import React from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageTransition, AnimatedNumber } from '../components/motion/Motion';

export const CareerRoadmapPage: React.FC = () => {
  const { state, careerReadiness } = useAtlas();

  const totalSteps = state.roadmapSteps.length;
  const completedSteps = state.roadmapSteps.filter((s) => s.completed).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Total actions count
  const totalActions = state.roadmapSteps.reduce((acc, curr) => acc + curr.actions.length, 0);
  const completedActions = state.roadmapSteps.reduce((acc, curr) => acc + curr.completedActionIds.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] font-mono text-[11px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A] animate-pulse"></span>
              Strategic Execution Sequence // Pathway Acceleration
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#18283D] tracking-tight">
              Your path to {state.targetRole}.
            </h1>
            <p className="text-base text-[#6B7280]">
              A dynamic, personalised sequence ordered by your highest-impact competency gaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/resources"
              className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#18283D] text-xs font-semibold border border-[#E5E7EB] transition-all flex items-center gap-2 shadow-sm font-mono"
            >
              <span className="material-symbols-outlined text-[18px] text-[#8B6F5A]">tune</span>
              <span>Adjust Hours ({state.availability}h/wk)</span>
            </Link>
            <Link
              to={`/roadmap/${state.roadmapSteps[0]?.id || 'step-power-bi'}`}
              className="px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Resume Active Step</span>
            </Link>
          </div>
        </section>

        {/* Telemetry Strip (4 Metric Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-5 rounded-2xl glass-panel border-[#E5E7EB] bg-[#FAF7F2]/80 shadow-lg">
          {/* Metric 1 */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B7280] uppercase font-mono font-semibold">
              <span>Career Readiness</span>
              <span>Goal: 80%</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl font-bold text-[#18283D]">
                <AnimatedNumber value={careerReadiness} suffix="%" durationMs={650} />
              </span>
              <span className="text-xs text-rose-400 font-semibold">
                Deficit: -{Math.max(80 - careerReadiness, 0)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
              <div className="h-full bg-violet-600 rounded-full transition-all duration-700" style={{ width: `${Math.min(careerReadiness, 100)}%` }}></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B7280] uppercase font-mono font-semibold">
              <span>Roadmap Progress</span>
              <span className="text-[#8B6F5A]">{completedSteps} of {totalSteps} Steps</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl font-bold text-[#18283D]">
                <AnimatedNumber value={progressPercent} suffix="%" durationMs={650} />
              </span>
              <span className="text-xs text-[#6B7280]">{completedActions} of {totalActions} actions</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
              <div className="h-full bg-violet-600 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B7280] uppercase font-mono font-semibold">
              <span>Paced Velocity</span>
              <span>{state.availability} hrs / wk</span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl font-bold text-[#18283D]">8</span>
              <span className="text-xs text-[#6B7280] font-medium">Weeks Estimated Total</span>
            </div>
            <span className="text-[11px] text-[#8B6F5A] font-mono font-semibold">Pacing ahead of benchmark</span>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6B7280] uppercase font-mono font-semibold">
              <span>Target Eligibility</span>
              <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">verified_user</span>
            </div>
            <div className="text-lg font-bold text-[#18283D]">Mid-May 2025</div>
            <span className="text-[11px] text-[#6B7280] font-mono">Q2 Hiring Window Readiness</span>
          </div>
        </section>

        {/* 8-Column Timeline Spine + 4-Column Intel Rail */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main 8-Column Timeline */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative pl-6 sm:pl-10 space-y-8">
              {/* Vertical Connecting Line */}
              <div className="absolute left-3 sm:left-4.5 top-6 bottom-6 w-0.5 bg-[#E5E7EB]"></div>

              {state.roadmapSteps.map((step, idx) => {
                const isFirstActive = !step.completed && state.roadmapSteps.slice(0, idx).every((s) => s.completed);

                return (
                  <div key={step.id} className="relative group">
                    {/* Node Circle */}
                    <div className={`absolute -left-6 sm:-left-10 top-6 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      step.completed
                        ? 'bg-teal-500 text-[#FAF7F2] font-bold'
                        : isFirstActive
                        ? 'bg-violet-600 text-white ring-4 ring-violet-500/30 animate-pulse'
                        : 'bg-[#E5E7EB] border border-[#E5E7EB] text-[#6B7280]'
                    }`}>
                      {step.completed ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        <span className="text-xs font-bold font-mono">0{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Card */}
                    <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${
                      isFirstActive
                        ? 'glass-panel border-[#8B6F5A]/50 shadow-lg ring-1 ring-violet-500/30'
                        : step.completed
                        ? 'bg-[#FAF7F2]/60 border-[#E5E7EB] opacity-80'
                        : 'glass-panel border-[#E5E7EB] shadow-lg hover:border-[#18283D]/30'
                    }`}>
                      {/* Step Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#8B6F5A]">
                              Milestone 0{step.stepNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              step.priority === 'HIGH PRIORITY'
                                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                                : step.priority === 'MEDIUM PRIORITY'
                                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                                : 'bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A]'
                            }`}>
                              {step.priority}
                            </span>
                            <span className="text-xs font-mono text-[#6B7280]">
                              {step.completed ? 'Completed' : isFirstActive ? 'Active Sprint' : 'Queued'}
                            </span>
                          </div>

                          <h2 className="text-xl font-bold text-[#18283D] tracking-tight">
                            {step.title}
                          </h2>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-[#6B7280] uppercase block font-mono font-semibold">Allocated</span>
                            <span className="text-sm font-mono text-[#18283D] font-bold">
                              {step.allocatedHours} hrs/wk
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#6B7280] uppercase block font-mono font-semibold">Deficit</span>
                            <span className={`text-sm font-mono font-bold ${step.gap > 0 ? 'text-rose-400' : 'text-[#8B6F5A]'}`}>
                              {step.gap > 0 ? `-${step.gap} pts` : 'Cleared'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#6B7280] py-3 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Actions Preview */}
                      <div className="space-y-2 pt-1 pb-4">
                        <span className="text-[11px] font-mono font-semibold text-[#6B7280] uppercase tracking-wider block">
                          Action Plan ({step.completedActionIds.length} of {step.actions.length} Completed):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {step.actions.map((act) => {
                            const isDone = step.completedActionIds.includes(act.id);
                            return (
                              <div
                                key={act.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                  isDone
                                    ? 'bg-[#D8C3A5]/25 border-[#D8C3A5] text-[#8B6F5A]'
                                    : 'bg-[#FAF7F2] border-[#E5E7EB] text-[#6B7280]'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className={`material-symbols-outlined text-[15px] ${isDone ? 'text-[#8B6F5A]' : 'text-[#6B7280]'}`}>
                                    {isDone ? 'check_circle' : 'radio_button_unchecked'}
                                  </span>
                                  <span className="truncate">{act.title}</span>
                                </span>
                                <span className="text-[10px] font-mono text-[#6B7280] shrink-0">{act.estimatedMinutes}m</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Action Link */}
                      <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-xs text-[#6B7280] font-mono">
                          Estimated Duration: <strong className="text-[#18283D]">{step.estimatedDurationWeeks}</strong>
                        </span>

                        <Link
                          to={`/roadmap/${step.id}`}
                          className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-180 ${
                            isFirstActive
                              ? 'bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-[#FAF7F2] shadow-sm border border-transparent'
                              : 'bg-[#FAF7F2] text-[#18283D] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:-translate-y-0.5 hover:shadow-xs border border-[#E5E7EB]'
                          }`}
                        >
                          <span>{step.completed ? 'Review Step' : 'Start this step'}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Rail: Intellectual Rationale & Cadence */}
          <div className="lg:col-span-4 space-y-6">
            {/* Why This Sequence Rationale Box */}
            <div className="p-6 rounded-2xl glass-panel border-[#E5E7EB] shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B6F5A] text-[22px]">psychology</span>
                <h3 className="text-base font-bold text-[#18283D]">Why this sequence?</h3>
              </div>
              <div className="text-xs text-[#6B7280] space-y-3 leading-relaxed">
                <p>
                  ATLAS orders your roadmap strictly by <strong className="text-[#18283D]">screening survival ROI</strong>.
                </p>
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] font-mono text-xs">
                  {state.roadmapSteps[0]?.skill} appears first because your deficit is furthest below the role threshold (-{state.roadmapSteps[0]?.gap} pts).
                </div>
                <p>
                  Clearing this major bottleneck first ensures your applications pass automated candidate filtering before deeper portfolio defense rounds.
                </p>
              </div>
            </div>

            {/* Weekly Sprint Rhythm Monitor */}
            <div className="p-6 rounded-2xl glass-panel border-[#E5E7EB] shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#18283D] font-mono">Weekly Sprint Rhythm</h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#18283D]/30">
                  Sprint 03 Active
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#6B7280] font-mono">
                  <span>Weekly Budget:</span>
                  <span className="font-bold text-[#18283D]">{state.availability}.0 Hours</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div className="h-full bg-violet-600 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-[11px] text-[#6B7280] font-mono block">6.5 hours logged Mon–Wed</span>
              </div>
              <Link
                to="/resources"
                className="text-xs text-[#8B6F5A] font-mono hover:text-[#18283D] block pt-1 transition-colors"
              >
                Inspect time allocation matrix →
              </Link>
            </div>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};

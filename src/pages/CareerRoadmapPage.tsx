import React from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageTransition, AnimatedNumber, AnimatedProgressBar } from '../components/motion/Motion';

export const CareerRoadmapPage: React.FC = () => {
  const { state, careerReadiness } = useAtlas();

  const totalSteps = state.roadmapSteps.length;
  const completedSteps = state.roadmapSteps.filter((s) => s.completed).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Total actions count
  const totalActions = state.roadmapSteps.reduce((acc, curr) => acc + curr.actions.length, 0);
  const completedActions = state.roadmapSteps.reduce((acc, curr) => acc + curr.completedActionIds.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f1eee7] text-[#424845] font-label-sm text-label-sm uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
              Strategic Execution Sequence // Pathway Acceleration
            </div>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Your path to {state.targetRole}.
            </h1>
            <p className="font-body-lg text-body-lg text-[#424845]">
              A dynamic, personalised sequence ordered by your highest-impact competency gaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/resources"
              className="btn-interactive px-4 py-2.5 rounded bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#0d1f18] font-title-md text-title-md border border-[#e5e2dc] transition-all flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Adjust Hours ({state.availability}h/wk)</span>
            </Link>
            <Link
              to={`/roadmap/${state.roadmapSteps[0]?.id || 'step-power-bi'}`}
              className="btn-interactive px-5 py-2.5 rounded bg-[#0d1f18] text-white hover:bg-[#22382f] font-title-md text-title-md font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Resume Active Step</span>
            </Link>
          </div>
        </section>

        {/* Telemetry Strip (4 Metric Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-5 rounded-xl bg-[#f6f3ed] border border-[#e5e2dc] shadow-sm">
          {/* Metric 1 */}
          <div className="card-interactive p-4 rounded-lg bg-white border border-[#e5e2dc] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#737874] uppercase font-semibold">
              <span>Career Readiness</span>
              <span>Goal: 80%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={careerReadiness} suffix="%" durationMs={650} />
              </span>
              <span className="text-xs text-[#ba1a1a] font-semibold">
                Deficit: -{Math.max(80 - careerReadiness, 0)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#e5e2dc] overflow-hidden">
              <div className="h-full bg-[#6b4ea6] rounded-full transition-all duration-700" style={{ width: `${Math.min(careerReadiness, 100)}%` }}></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="card-interactive p-4 rounded-lg bg-white border border-[#e5e2dc] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#737874] uppercase font-semibold">
              <span>Roadmap Progress</span>
              <span className="text-[#6b4ea6]">{completedSteps} of {totalSteps} Steps</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={progressPercent} suffix="%" durationMs={650} />
              </span>
              <span className="text-xs text-[#737874]">{completedActions} of {totalActions} actions</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#e5e2dc] overflow-hidden">
              <div className="h-full bg-[#0d1f18] rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="card-interactive p-4 rounded-lg bg-white border border-[#e5e2dc] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#737874] uppercase font-semibold">
              <span>Paced Velocity</span>
              <span>{state.availability} hrs / wk</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">8</span>
              <span className="text-xs text-[#737874] font-medium">Weeks Estimated Total</span>
            </div>
            <span className="text-[11px] text-[#4f6359] font-semibold">Pacing ahead of benchmark</span>
          </div>

          {/* Metric 4 */}
          <div className="card-interactive p-4 rounded-lg bg-white border border-[#e5e2dc] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-[#737874] uppercase font-semibold">
              <span>Target Eligibility</span>
              <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">verified_user</span>
            </div>
            <div className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Mid-May 2025</div>
            <span className="text-[11px] text-[#737874]">Q2 Hiring Window Readiness</span>
          </div>
        </section>

        {/* 8-Column Timeline Spine + 4-Column Intel Rail */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main 8-Column Timeline */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative pl-6 sm:pl-10 space-y-8">
              {/* Vertical Connecting Line */}
              <div className="absolute left-3 sm:left-4.5 top-6 bottom-6 w-0.5 bg-[#e5e2dc]"></div>

              {state.roadmapSteps.map((step, idx) => {
                const isFirstActive = !step.completed && state.roadmapSteps.slice(0, idx).every((s) => s.completed);

                return (
                  <div key={step.id} className="relative group">
                    {/* Node Circle */}
                    <div className={`absolute -left-6 sm:-left-10 top-6 w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${
                      step.completed
                        ? 'bg-[#0d1f18] text-white'
                        : isFirstActive
                        ? 'bg-[#6b4ea6] text-white ring-4 ring-[#6b4ea6]/20 animate-pulse'
                        : 'bg-[#e5e2dc] text-[#737874]'
                    }`}>
                      {step.completed ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        <span className="text-xs font-bold font-mono">0{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Card */}
                    <div className={`p-6 sm:p-7 rounded-xl border transition-all ${
                      isFirstActive
                        ? 'bg-white border-[#6b4ea6] shadow-md ring-1 ring-[#6b4ea6]/30'
                        : step.completed
                        ? 'bg-[#f6f3ed]/60 border-[#e5e2dc]'
                        : 'bg-white border-[#e5e2dc] shadow-sm hover:shadow-md'
                    }`}>
                      {/* Step Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1eee7]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-[#6b4ea6]">
                              Milestone 0{step.stepNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              step.priority === 'HIGH PRIORITY'
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : step.priority === 'MEDIUM PRIORITY'
                                ? 'bg-[#ffddb3] text-[#291800]'
                                : 'bg-[#d2e7dc] text-[#0d1f18]'
                            }`}>
                              {step.priority}
                            </span>
                            <span className="text-xs text-[#737874]">
                              {step.completed ? 'Completed' : isFirstActive ? 'Active Sprint' : 'Queued'}
                            </span>
                          </div>

                          <h2 className="font-headline-sm text-headline-sm text-[#0d1f18] font-bold">
                            {step.title}
                          </h2>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-[#737874] uppercase block font-semibold">Allocated</span>
                            <span className="font-metric-sm text-metric-sm text-[#0d1f18] font-bold">
                              {step.allocatedHours} hrs/wk
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#737874] uppercase block font-semibold">Deficit</span>
                            <span className={`text-sm font-bold ${step.gap > 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}`}>
                              {step.gap > 0 ? `-${step.gap} pts` : 'Cleared'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="font-body-md text-body-md text-[#424845] py-3 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Actions Preview */}
                      <div className="space-y-2 pt-1 pb-4">
                        <span className="text-xs font-semibold text-[#737874] uppercase tracking-wider block">
                          Action Plan ({step.completedActionIds.length} of {step.actions.length} Completed):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {step.actions.map((act) => {
                            const isDone = step.completedActionIds.includes(act.id);
                            return (
                              <div
                                key={act.id}
                                className={`p-2.5 rounded border flex items-center justify-between gap-2 ${
                                  isDone
                                    ? 'bg-[#d2e7dc]/40 border-[#b7cbc0] text-[#0d1f18]'
                                    : 'bg-[#f6f3ed] border-[#e5e2dc] text-[#424845]'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className={`material-symbols-outlined text-[15px] ${isDone ? 'text-[#4f6359]' : 'text-[#737874]'}`}>
                                    {isDone ? 'check_circle' : 'radio_button_unchecked'}
                                  </span>
                                  <span className="truncate">{act.title}</span>
                                </span>
                                <span className="text-[10px] text-[#737874] shrink-0">{act.estimatedMinutes}m</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Action Link */}
                      <div className="pt-3 border-t border-[#f1eee7] flex items-center justify-between">
                        <span className="text-xs text-[#737874]">
                          Estimated Duration: <strong className="text-[#0d1f18]">{step.estimatedDurationWeeks}</strong>
                        </span>

                        <Link
                          to={`/roadmap/${step.id}`}
                          className={`inline-flex items-center gap-2 px-5 py-2 rounded font-title-md text-title-md font-semibold transition-all ${
                            isFirstActive
                              ? 'bg-[#0d1f18] text-white hover:bg-[#22382f] shadow-sm'
                              : 'bg-[#f1eee7] text-[#0d1f18] hover:bg-[#e5e2dc]'
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
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6b4ea6] text-[22px]">psychology</span>
                <h3 className="font-headline-sm text-headline-sm text-[#0d1f18]">Why this sequence?</h3>
              </div>
              <div className="text-xs text-[#424845] space-y-3 leading-relaxed">
                <p>
                  ATLAS orders your roadmap strictly by <strong className="text-[#0d1f18]">screening survival ROI</strong>.
                </p>
                <div className="p-3 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] text-[#0d1f18]">
                  {state.roadmapSteps[0]?.skill} appears first because your deficit is furthest below the role threshold (-{state.roadmapSteps[0]?.gap} pts).
                </div>
                <p>
                  Clearing this major bottleneck first ensures your applications pass automated candidate filtering before deeper portfolio defense rounds.
                </p>
              </div>
            </div>

            {/* Weekly Sprint Rhythm Monitor */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#f1eee7]">
                <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Weekly Sprint Rhythm</h3>
                <span className="text-xs font-semibold text-[#6b4ea6]">Sprint 03 Active</span>
              </div>
              <div className="p-3 rounded bg-[#f6f3ed] border border-[#e5e2dc] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#737874]">
                  <span>Weekly Budget:</span>
                  <span className="font-bold text-[#0d1f18]">{state.availability}.0 Hours</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#e5e2dc] overflow-hidden">
                  <div className="h-full bg-[#0d1f18] rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-[11px] text-[#737874] block">6.5 hours logged Mon–Wed</span>
              </div>
              <Link
                to="/resources"
                className="text-xs text-[#6b4ea6] font-semibold hover:underline block pt-1"
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

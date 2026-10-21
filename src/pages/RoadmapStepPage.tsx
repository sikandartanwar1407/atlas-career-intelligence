import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EmptyState } from '../components/EmptyState';
import { PageTransition, AnimatedProgressBar } from '../components/motion/Motion';

export const RoadmapStepPage: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const { state, toggleRoadmapAction, completeRoadmapStep } = useAtlas();

  const step = state.roadmapSteps.find((s) => s.id === stepId);

  if (!step) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9]">
        <Header />
        <main className="w-full pt-28 flex-1 px-4 py-12 flex items-center justify-center">
          <EmptyState
            icon="route"
            title="Roadmap Step Not Found"
            description="The requested developmental milestone does not exist or has been recalibrated."
            ctaText="Return to Career Roadmap"
            ctaLink="/career-roadmap"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const completedCount = step.completedActionIds.length;
  const totalCount = step.actions.length;
  const allActionsDone = completedCount === totalCount && totalCount > 0;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleCompleteStep = () => {
    completeRoadmapStep(step.id);
    navigate('/career-roadmap');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/career-roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to full personal roadmap</span>
          </Link>
          <span className="text-xs font-mono text-[#64748B]">Step {step.stepNumber} of {state.roadmapSteps.length}</span>
        </div>

        {/* Step Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border-white/10 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                0{step.stepNumber}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#A78BFA]">
                Milestone 0{step.stepNumber}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                step.priority === 'HIGH PRIORITY'
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  : step.priority === 'MEDIUM PRIORITY'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  : 'bg-teal-500/15 border border-teal-500/30 text-[#2DD4BF]'
              }`}>
                {step.priority}
              </span>
              {step.completed && (
                <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30 text-[10px] font-mono font-bold uppercase">
                  Completed
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#64748B]">Allocated: <strong className="text-white">{step.allocatedHours} hrs / wk</strong></span>
              <span className="text-[#64748B]">Duration: <strong className="text-white">{step.estimatedDurationWeeks}</strong></span>
              <span className="text-rose-400 font-bold">Deficit: -{step.gap} pts</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {step.title}
          </h1>

          <p className="text-sm text-[#94A3B8] leading-relaxed">
            {step.description}
          </p>

          {/* Progress Bar of Actions */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#94A3B8]">{completedCount} of {totalCount} actions completed</span>
              <span className="text-[#A78BFA] font-bold">{progressPercent}%</span>
            </div>
            <AnimatedProgressBar
              value={progressPercent}
              className="w-full h-2"
              trackClassName="bg-[#0D1224] rounded-full overflow-hidden border border-white/5"
              fillClassName="bg-violet-600 rounded-full"
              durationMs={400}
            />
          </div>
        </div>

        {/* Action Plan Checklist */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white">
                Action Plan &amp; Learning Tasks
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Mark each action complete as you execute. When all actions are complete, mark the entire step complete.
              </p>
            </div>
            <span className="text-xs font-mono text-[#A78BFA]">{completedCount} / {totalCount} Done</span>
          </div>

          <div className="space-y-4">
            {step.actions.map((action, aIdx) => {
              const isChecked = step.completedActionIds.includes(action.id);

              return (
                <div
                  key={action.id}
                  onClick={() => toggleRoadmapAction(step.id, action.id)}
                  className={`p-5 rounded-xl border cursor-pointer flex items-start gap-4 transition-all ${
                    isChecked
                      ? 'bg-teal-950/20 border-teal-500/30'
                      : 'bg-[#0D1224]/80 border-white/10 hover:border-violet-500/40 hover:bg-[#11182B]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-all duration-150 ${
                      isChecked
                        ? 'bg-teal-500 border-teal-500 text-[#080B16] font-bold'
                        : 'bg-[#172039] border-white/20 text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#64748B]">0{aIdx + 1}</span>
                        <h3 className={`text-sm font-semibold transition-colors duration-150 ${
                          isChecked ? 'line-through text-[#64748B]' : 'text-white'
                        }`}>
                          {action.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-lg bg-[#172039] border border-white/10 text-[10px] font-mono font-semibold text-[#A78BFA]">
                          {action.type}
                        </span>
                        <span className="text-[#64748B] font-mono text-xs">{action.estimatedMinutes} min</span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed transition-colors duration-150 ${isChecked ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Completion Action */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/career-roadmap"
              className="text-xs font-mono text-[#94A3B8] hover:text-white transition-colors"
            >
              ← Return to Roadmap
            </Link>

            <button
              type="button"
              onClick={handleCompleteStep}
              disabled={!allActionsDone && !step.completed}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                allActionsDone || step.completed
                  ? 'bg-teal-500 hover:bg-teal-400 text-[#080B16] cursor-pointer shadow-sm'
                  : 'bg-[#172039] text-[#64748B] border border-white/5 cursor-not-allowed'
              }`}
            >
              <span>{step.completed ? 'Step Completed (Return to Roadmap)' : 'Mark Step Complete →'}</span>
            </button>
          </div>
        </div>
      </PageTransition>

      <Footer />
    </div>
  );
};

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
      <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
        <Header />
        <main className="w-full pt-20 flex-1 px-4 py-12 flex items-center justify-center">
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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/career-roadmap"
            className="btn-interactive inline-flex items-center gap-1.5 text-xs font-semibold text-[#737874] hover:text-[#0d1f18]"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to full personal roadmap</span>
          </Link>
          <span className="text-xs text-[#737874]">Step {step.stepNumber} of {state.roadmapSteps.length}</span>
        </div>

        {/* Step Header Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#e5e2dc] shadow-sm space-y-4 card-interactive">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1eee7]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#0d1f18] text-white flex items-center justify-center text-xs font-bold font-mono">
                0{step.stepNumber}
              </span>
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
              {step.completed && (
                <span className="px-2 py-0.5 rounded bg-[#d2e7dc] text-[#0d1f18] text-[10px] font-bold uppercase">
                  Completed
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-[#737874]">Allocated: <strong className="text-[#0d1f18]">{step.allocatedHours} hrs / wk</strong></span>
              <span className="text-[#737874]">Duration: <strong className="text-[#0d1f18]">{step.estimatedDurationWeeks}</strong></span>
              <span className="text-[#ba1a1a]">Deficit: -{step.gap} pts</span>
            </div>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-[#0d1f18] tracking-tight">
            {step.title}
          </h1>

          <p className="font-body-lg text-body-lg text-[#424845] leading-relaxed">
            {step.description}
          </p>

          {/* Progress Bar of Actions */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0d1f18]">{completedCount} of {totalCount} actions completed</span>
              <span className="text-[#6b4ea6] font-bold">{progressPercent}%</span>
            </div>
            <AnimatedProgressBar
              value={progressPercent}
              className="w-full h-2"
              trackClassName="bg-[#e5e2dc] rounded-full overflow-hidden"
              fillClassName="bg-[#6b4ea6] rounded-full"
              durationMs={400}
            />
          </div>
        </div>

        {/* Action Plan Checklist */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
            <div>
              <h2 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">
                Action Plan &amp; Learning Tasks
              </h2>
              <p className="text-xs text-[#737874]">
                Mark each action complete as you execute. When all actions are complete, mark the entire step complete.
              </p>
            </div>
            <span className="text-xs text-[#737874]">{completedCount} / {totalCount} Done</span>
          </div>

          <div className="space-y-4">
            {step.actions.map((action, aIdx) => {
              const isChecked = step.completedActionIds.includes(action.id);

              return (
                <div
                  key={action.id}
                  onClick={() => toggleRoadmapAction(step.id, action.id)}
                  className={`card-interactive p-5 rounded-xl border cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-[#d2e7dc]/30 border-[#b7cbc0]'
                      : 'bg-[#fcf9f3] border-[#e5e2dc] hover:bg-[#f6f3ed]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all duration-150 ${
                      isChecked
                        ? 'bg-[#0d1f18] border-[#0d1f18] text-white'
                        : 'bg-white border-[#c2c8c3] text-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#737874]">0{aIdx + 1}</span>
                        <h3 className={`font-title-md text-title-md font-semibold transition-colors duration-150 ${
                          isChecked ? 'line-through text-[#737874]' : 'text-[#0d1f18]'
                        }`}>
                          {action.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[#f1eee7] text-[10px] font-semibold text-[#424845]">
                          {action.type}
                        </span>
                        <span className="text-[#737874]">{action.estimatedMinutes} min</span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed transition-colors duration-150 ${isChecked ? 'text-[#737874]' : 'text-[#424845]'}`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Completion Action */}
          <div className="pt-6 border-t border-[#f1eee7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/career-roadmap"
              className="btn-interactive text-xs text-[#737874] hover:text-[#0d1f18] font-semibold"
            >
              ← Return to Roadmap
            </Link>

            <button
              type="button"
              onClick={handleCompleteStep}
              disabled={!allActionsDone && !step.completed}
              className={`btn-interactive w-full sm:w-auto px-8 py-3.5 rounded font-title-md text-title-md font-bold shadow-sm flex items-center justify-center gap-2 ${
                allActionsDone || step.completed
                  ? 'bg-[#0d1f18] hover:bg-[#22382f] text-white cursor-pointer'
                  : 'bg-[#e5e2dc] text-[#737874] cursor-not-allowed'
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

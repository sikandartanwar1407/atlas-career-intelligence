import React from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SkillGapBar } from '../components/SkillGapBar';
import { EmptyState } from '../components/EmptyState';
import { PageTransition, AnimatedNumber, AnimatedProgressBar, StaggerContainer } from '../components/motion/Motion';

export const AssessmentResultPage: React.FC = () => {
  const { state, skillGaps, careerReadiness } = useAtlas();

  // If user hasn't answered any questions, show empty state
  const hasAnswers = Object.keys(state.assessmentAnswers).length > 0 || Object.keys(state.codingAnswers || {}).length > 0;

  if (!hasAnswers && !state.assessmentCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
        <Header />
        <main className="w-full pt-20 flex-1 px-4 py-12 flex items-center justify-center">
          <EmptyState
            icon="quiz"
            title="Complete your assessment"
            description="Complete your hybrid competency assessment to generate your validated demonstrated scores and unlock your career diagnosis."
            ctaText="Take assessment now"
            ctaLink="/assessment"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const result = state.assessmentResult;
  const overallDemonstrated = result?.overallDemonstrated ?? careerReadiness;
  const theoryScore = result?.theoryScore ?? Math.round(overallDemonstrated);
  const codingScore = result?.codingScore ?? Math.round(overallDemonstrated);
  const theoryCorrectCount = result?.theoryCorrectCount ?? 0;
  const codingCorrectCount = result?.codingCorrectCount ?? 0;
  const codingSkippedCount = result?.codingSkippedCount ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563] relative overflow-hidden">
      <Header />

      <PageTransition className="w-full pt-20 flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8B6F5A] font-bold px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] inline-block">
              Assessment Outcome // Hybrid Empirical Verification
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#18283D] tracking-tight">
              Assessment Results
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280]">
              Verified demonstrated competency calculated across conceptual theory and applied code-tracing challenges for <span className="text-[#18283D] font-semibold">{state.targetRole}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/diagnosis"
              className="btn-interactive inline-flex items-center gap-2 px-6 py-3.5 bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] rounded-xl text-sm transition-all shadow-sm font-bold"
            >
              <span>View my career diagnosis</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards: Overall + Theory + Coding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Overall Assessment Score */}
          <div className="card-interactive p-6 rounded-2xl glass-panel-elevated border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#6B7280] font-bold">
                Overall Assessment Score
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E5E7EB] text-xs font-mono font-semibold text-[#8B6F5A]">
                Target: 80%
              </span>
            </div>

            <div className="my-5 flex items-baseline gap-3">
              <span className="font-mono text-[46px] font-extrabold text-[#18283D] leading-none">
                <AnimatedNumber value={overallDemonstrated} suffix="%" durationMs={700} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#18283D]">Composite Score</span>
                <span className="text-[11px] font-mono text-rose-400 font-semibold">
                  Deficit: -{Math.max(80 - overallDemonstrated, 0)} pts
                </span>
              </div>
            </div>

            <AnimatedProgressBar
              value={Math.min(overallDemonstrated, 100)}
              className="w-full h-2"
              trackClassName="bg-[#FAF7F2] rounded-full overflow-hidden"
              fillClassName="bg-violet-600 rounded-full shadow-sm"
              durationMs={700}
            />
          </div>

          {/* Card 2: Theory Performance */}
          <div className="card-interactive p-6 rounded-2xl glass-panel-elevated border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-1.5 text-[#8B6F5A] font-bold text-xs font-mono uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">psychology</span>
                <span>Theory Performance</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#D8C3A5]/25 border border-[#18283D]/30 text-[#8B6F5A] font-mono text-[10px] font-bold uppercase">
                Conceptual
              </span>
            </div>

            <div className="my-5 flex items-baseline gap-3">
              <span className="font-mono text-[46px] font-extrabold text-[#8B6F5A] leading-none">
                <AnimatedNumber value={theoryScore} suffix="%" durationMs={700} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#18283D]">{theoryCorrectCount} Verified</span>
                <span className="text-[11px] text-[#6B7280]">Principles &amp; domain knowledge</span>
              </div>
            </div>

            <AnimatedProgressBar
              value={Math.min(theoryScore, 100)}
              className="w-full h-2"
              trackClassName="bg-[#FAF7F2] rounded-full overflow-hidden"
              fillClassName="bg-violet-600 rounded-full shadow-sm"
              durationMs={700}
            />
          </div>

          {/* Card 3: Coding Performance */}
          <div className="card-interactive p-6 rounded-2xl glass-panel-elevated border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-1.5 text-[#8B6F5A] font-bold text-xs font-mono uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">code</span>
                <span>Coding Performance</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] font-mono text-[10px] font-bold uppercase">
                Applied
              </span>
            </div>

            <div className="my-5 flex items-baseline gap-3">
              <span className="font-mono text-[46px] font-extrabold text-[#8B6F5A] leading-none">
                <AnimatedNumber value={codingScore} suffix="%" durationMs={700} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#18283D]">
                  {codingCorrectCount} Correct • {codingSkippedCount} Skipped
                </span>
                <span className="text-[11px] text-[#6B7280]">Code-tracing verification</span>
              </div>
            </div>

            <AnimatedProgressBar
              value={Math.min(codingScore, 100)}
              className="w-full h-2"
              trackClassName="bg-[#FAF7F2] rounded-full overflow-hidden"
              fillClassName="bg-teal-500 rounded-full shadow-sm"
              durationMs={700}
            />
          </div>
        </div>

        {/* Competency Breakdown & Signal Matrix */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-xl font-bold text-[#18283D] tracking-tight">
                Competency Breakdown &amp; Evidence Signals
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Evaluation results distinguished by conceptual theory and applied code-tracing demonstrations.
              </p>
            </div>
            <span className="text-xs font-mono text-[#6B7280] font-medium self-start sm:self-auto">
              Sorted by gap magnitude
            </span>
          </div>

          <StaggerContainer className="space-y-4">
            {skillGaps.map((item) => {
              const codingStatus = result?.codingPerformance?.[item.skill] ?? (result?.codingPerformance?.[item.displayName] ?? 'not_demonstrated');
              const theoryStatus = result?.theoryPerformance?.[item.skill] ?? (result?.theoryPerformance?.[item.displayName] ?? 'not_demonstrated');
              const compStatus = result?.competencyStatus?.[item.skill] ?? (result?.competencyStatus?.[item.displayName] ?? (item.demonstrated >= item.roleThreshold ? 'demonstrated' : 'not_demonstrated'));

              return (
                <div key={item.skill} className="card-interactive p-5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-4">
                  {/* Skill Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base text-[#18283D] font-bold">{item.displayName}</span>
                      <span className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                        item.priority === 'HIGH PRIORITY'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : item.priority === 'MEDIUM PRIORITY'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-[#D8C3A5]/25 text-[#8B6F5A] border border-[#D8C3A5]'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    {/* Overall Competency Badge */}
                    <div className="flex items-center gap-2">
                      {compStatus === 'demonstrated' ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1 border border-emerald-500/30">
                          <span className="font-bold">✓</span> Competency Demonstrated
                        </span>
                      ) : codingStatus === 'skipped' ? (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1 border border-amber-500/30">
                          <span>↷</span> Skipped — Competency Not Demonstrated
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 text-xs font-mono font-semibold flex items-center gap-1 border border-rose-500/30">
                          <span>✕</span> Not Demonstrated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Mode Sub-Badges (Theory vs Coding) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Theory Signal */}
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">psychology</span>
                        <span className="text-[#6B7280]">Theory Evaluation:</span>
                      </div>
                      <span className={`text-xs font-mono font-semibold ${theoryStatus === 'demonstrated' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {theoryStatus === 'demonstrated' ? '✓ Concept Demonstrated' : '✕ Gap Signal'}
                      </span>
                    </div>

                    {/* Coding Signal */}
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">code</span>
                        <span className="text-[#6B7280]">Coding Challenge:</span>
                      </div>
                      <span className={`text-xs font-mono font-semibold ${
                        codingStatus === 'demonstrated'
                          ? 'text-emerald-400'
                          : codingStatus === 'skipped'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {codingStatus === 'demonstrated'
                          ? '✓ Competency Demonstrated'
                          : codingStatus === 'skipped'
                          ? '↷ Skipped (Gap Signal)'
                          : '✕ Gap Signal'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Gap Bar */}
                  <SkillGapBar
                    current={item.demonstrated}
                    threshold={item.roleThreshold}
                    gap={item.gap}
                    priority={item.priority}
                    showLabels={true}
                  />

                  {/* Strategic Context */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#6B7280] pt-1">
                    <span>Baseline: <strong className="text-[#18283D]">{item.baseline}%</strong></span>
                    <span>Demonstrated: <strong className="text-[#18283D]">{item.demonstrated}%</strong></span>
                    <span>Role Benchmark: <strong className="text-[#18283D]">{item.roleThreshold}%</strong></span>
                    <span className={`font-bold ${item.gap > 0 ? 'text-rose-400' : 'text-[#8B6F5A]'}`}>
                      {item.gap > 0 ? `Δ -${item.gap} pts gap` : 'Target Met'}
                    </span>
                  </div>
                </div>
              );
            })}
          </StaggerContainer>

          {/* Bottom Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E7EB]">
            <Link
              to="/assessment"
              className="btn-interactive text-xs font-mono text-[#6B7280] hover:text-[#18283D] flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retake Assessment</span>
            </Link>

            <Link
              to="/diagnosis"
              className="btn-interactive w-full sm:w-auto px-8 py-3.5 bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <span>View my career diagnosis →</span>
            </Link>
          </div>
        </div>
      </PageTransition>

      <Footer />
    </div>
  );
};

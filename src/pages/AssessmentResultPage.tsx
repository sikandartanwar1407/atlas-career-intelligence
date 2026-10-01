import React from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SkillGapBar } from '../components/SkillGapBar';
import { EmptyState } from '../components/EmptyState';
import { PageTransition, AnimatedNumber, AnimatedProgressBar, StaggerContainer } from '../components/motion/Motion';

export const AssessmentResultPage: React.FC = () => {
  const { state, skillGaps, largestGap, careerReadiness } = useAtlas();

  // If user hasn't answered any questions, show empty state
  const hasAnswers = Object.keys(state.assessmentAnswers).length > 0 || Object.keys(state.codingAnswers || {}).length > 0;

  if (!hasAnswers && !state.assessmentCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="space-y-2 max-w-2xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-bold">
              Assessment Outcome // Hybrid Empirical Verification
            </span>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Assessment Results
            </h1>
            <p className="font-body-lg text-body-lg text-[#424845]">
              Here is your verified demonstrated competency calculated across conceptual theory and applied code-tracing challenges for {state.targetRole}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/diagnosis"
              className="btn-interactive inline-flex items-center gap-2 px-6 py-3 bg-[#0d1f18] text-white hover:bg-[#22382f] rounded font-title-md text-title-md transition-all shadow-md font-semibold"
            >
              <span>View my career diagnosis</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards: Overall + Theory + Coding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Overall Assessment Score */}
          <div className="card-interactive p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#737874] font-bold">
                Overall Assessment Score
              </span>
              <span className="px-2 py-0.5 rounded bg-[#f1eee7] text-xs font-semibold text-[#0d1f18]">
                Target: 80%
              </span>
            </div>

            <div className="my-5 flex items-baseline gap-3">
              <span className="font-metric-lg text-[46px] font-serif font-bold text-[#0d1f18] leading-none">
                <AnimatedNumber value={overallDemonstrated} suffix="%" durationMs={700} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#424845]">Hybrid Composite</span>
                <span className="text-[11px] text-[#ba1a1a] font-semibold">
                  Deficit: -{Math.max(80 - overallDemonstrated, 0)} pts
                </span>
              </div>
            </div>

            <AnimatedProgressBar
              value={Math.min(overallDemonstrated, 100)}
              className="w-full h-2"
              trackClassName="bg-[#e5e2dc] rounded-full overflow-hidden"
              fillClassName="bg-[#0d1f18] rounded-full"
              durationMs={700}
            />
          </div>

          {/* Card 2: Theory Performance */}
          <div className="card-interactive p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
              <div className="flex items-center gap-1.5 text-[#25005a] font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">psychology</span>
                <span>Theory Performance</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#eaddff] text-[#25005a] font-label-sm text-[10px] font-bold uppercase">
                Conceptual
              </span>
            </div>

            <div className="my-5 flex items-baseline gap-3">
              <span className="font-metric-lg text-[46px] font-serif font-bold text-[#6b4ea6] leading-none">
                <AnimatedNumber value={theoryScore} suffix="%" durationMs={700} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0d1f18]">{theoryCorrectCount} Verified</span>
                <span className="text-[11px] text-[#737874]">Principles &amp; domain knowledge</span>
              </div>
            </div>

            <AnimatedProgressBar
              value={Math.min(theoryScore, 100)}
              className="w-full h-2"
              trackClassName="bg-[#e5e2dc] rounded-full overflow-hidden"
              fillClassName="bg-[#6b4ea6] rounded-full"
              durationMs={700}
            />
          </div>

          {/* Card 3: Coding Performance */}
          <div className="card-interactive p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
              <div className="flex items-center gap-1.5 text-[#0d1f18] font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-[#0d1f18]">code</span>
                <span>Coding Performance</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#ebe8e2] text-[#1c1c18] font-label-sm text-[10px] font-bold uppercase">
                Applied
              </span>
            </div>

            <div className="my-5 flex items-baseline gap-3">
              <span className="font-metric-lg text-[46px] font-serif font-bold text-[#0d1f18] leading-none">
                <AnimatedNumber value={codingScore} suffix="%" durationMs={700} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0d1f18]">
                  {codingCorrectCount} Correct • {codingSkippedCount} Skipped
                </span>
                <span className="text-[11px] text-[#737874]">Code-tracing verification</span>
              </div>
            </div>

            <AnimatedProgressBar
              value={Math.min(codingScore, 100)}
              className="w-full h-2"
              trackClassName="bg-[#e5e2dc] rounded-full overflow-hidden"
              fillClassName="bg-[#22382f] rounded-full"
              durationMs={700}
            />
          </div>
        </div>

        {/* Competency Breakdown & Signal Matrix */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f1eee7]">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-[#0d1f18]">
                Competency Breakdown &amp; Evidence Signals
              </h3>
              <p className="text-xs text-[#737874] mt-0.5">
                Evaluation results distinguished by conceptual theory and applied code-tracing demonstrations.
              </p>
            </div>
            <span className="text-xs text-[#737874] font-medium self-start sm:self-auto">
              Sorted by gap magnitude
            </span>
          </div>

          <StaggerContainer className="space-y-4">
            {skillGaps.map((item) => {
              const codingStatus = result?.codingPerformance?.[item.skill] ?? (result?.codingPerformance?.[item.displayName] ?? 'not_demonstrated');
              const theoryStatus = result?.theoryPerformance?.[item.skill] ?? (result?.theoryPerformance?.[item.displayName] ?? 'not_demonstrated');
              const compStatus = result?.competencyStatus?.[item.skill] ?? (result?.competencyStatus?.[item.displayName] ?? (item.demonstrated >= item.roleThreshold ? 'demonstrated' : 'not_demonstrated'));

              return (
                <div key={item.skill} className="card-interactive p-5 rounded-lg bg-[#fcf9f3] border border-[#e5e2dc] space-y-4">
                  {/* Skill Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-title-md text-title-md text-[#0d1f18] font-bold">{item.displayName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.priority === 'HIGH PRIORITY'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : item.priority === 'MEDIUM PRIORITY'
                          ? 'bg-[#ffddb3] text-[#291800]'
                          : 'bg-[#d2e7dc] text-[#0d1f18]'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    {/* Overall Competency Badge */}
                    <div className="flex items-center gap-2">
                      {compStatus === 'demonstrated' ? (
                        <span className="px-2.5 py-1 rounded bg-[#d2e7dc] text-[#0d1f18] text-xs font-semibold flex items-center gap-1 border border-[#a5d6a7]">
                          <span className="font-bold">✓</span> Competency Demonstrated
                        </span>
                      ) : codingStatus === 'skipped' ? (
                        <span className="px-2.5 py-1 rounded bg-[#ffeed9] text-[#703800] text-xs font-semibold flex items-center gap-1 border border-[#ffcc80]">
                          <span>↷</span> Skipped — Competency Not Demonstrated
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-1 border border-[#ffb4ab]">
                          <span>✕</span> Not Demonstrated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Mode Sub-Badges (Theory vs Coding) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Theory Signal */}
                    <div className="p-2.5 rounded bg-white border border-[#e5e2dc] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-[15px] text-[#6b4ea6]">psychology</span>
                        <span className="text-[#424845] font-medium">Theory Evaluation:</span>
                      </div>
                      <span className={`text-xs font-semibold ${theoryStatus === 'demonstrated' ? 'text-[#0d1f18]' : 'text-[#ba1a1a]'}`}>
                        {theoryStatus === 'demonstrated' ? '✓ Concept Demonstrated' : '✕ Skill Gap Signal'}
                      </span>
                    </div>

                    {/* Coding Signal */}
                    <div className="p-2.5 rounded bg-white border border-[#e5e2dc] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-[15px] text-[#0d1f18]">code</span>
                        <span className="text-[#424845] font-medium">Coding Challenge:</span>
                      </div>
                      <span className={`text-xs font-semibold ${
                        codingStatus === 'demonstrated'
                          ? 'text-[#0d1f18]'
                          : codingStatus === 'skipped'
                          ? 'text-[#703800]'
                          : 'text-[#ba1a1a]'
                      }`}>
                        {codingStatus === 'demonstrated'
                          ? '✓ Competency Demonstrated'
                          : codingStatus === 'skipped'
                          ? '↷ Skipped (Gap Signal)'
                          : '✕ Skill Gap Signal'}
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
                  <div className="flex items-center justify-between text-xs text-[#737874] pt-1">
                    <span>Baseline: <strong className="text-[#0d1f18]">{item.baseline}%</strong></span>
                    <span>Demonstrated: <strong className="text-[#0d1f18]">{item.demonstrated}%</strong></span>
                    <span>Role Benchmark: <strong className="text-[#0d1f18]">{item.roleThreshold}%</strong></span>
                    <span className={`font-mono font-bold ${item.gap > 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}`}>
                      {item.gap > 0 ? `Δ -${item.gap} pts gap` : 'Target Met'}
                    </span>
                  </div>
                </div>
              );
            })}
          </StaggerContainer>

          {/* Bottom Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#f1eee7]">
            <Link
              to="/assessment"
              className="btn-interactive text-xs text-[#737874] hover:text-[#0d1f18] flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retake Assessment</span>
            </Link>

            <Link
              to="/diagnosis"
              className="btn-interactive w-full sm:w-auto px-8 py-3.5 bg-[#0d1f18] hover:bg-[#22382f] text-white rounded font-title-md text-title-md font-bold flex items-center justify-center gap-2 shadow-sm"
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

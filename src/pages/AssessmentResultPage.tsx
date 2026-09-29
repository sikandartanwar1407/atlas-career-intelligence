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
  const hasAnswers = Object.keys(state.assessmentAnswers).length > 0;

  if (!hasAnswers && !state.assessmentCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
        <Header />
        <main className="w-full pt-20 flex-1 px-4 py-12 flex items-center justify-center">
          <EmptyState
            icon="quiz"
            title="Complete your assessment"
            description="Complete your 15-question competency assessment to generate your validated demonstrated scores and unlock your career diagnosis."
            ctaText="Take assessment now"
            ctaLink="/assessment"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const overallDemonstrated = state.assessmentResult?.overallDemonstrated ?? careerReadiness;

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="space-y-2 max-w-2xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-bold">
              Assessment Outcome // Empirical Verification
            </span>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Assessment Results
            </h1>
            <p className="font-body-lg text-body-lg text-[#424845]">
              Here is your verified demonstrated competency calculated across 15 technical checks against {state.targetRole} benchmarks.
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

        {/* Top 2 Metric Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Overall Demonstrated Competency */}
          <div className="card-interactive p-6 sm:p-8 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#737874] font-bold">
                Overall Demonstrated Competency
              </span>
              <span className="px-2 py-0.5 rounded bg-[#f1eee7] text-xs font-semibold text-[#0d1f18]">
                Target: 80%
              </span>
            </div>

            <div className="my-6 flex items-baseline gap-4">
              <span className="font-metric-lg text-[54px] font-serif font-bold text-[#0d1f18] leading-none">
                <AnimatedNumber value={overallDemonstrated} suffix="%" durationMs={700} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#424845]">Composite Qualification Score</span>
                <span className="text-xs text-[#ba1a1a] font-semibold">
                  Deficit: -{Math.max(80 - overallDemonstrated, 0)} pts to interview threshold
                </span>
              </div>
            </div>

            <AnimatedProgressBar
              value={Math.min(overallDemonstrated, 100)}
              className="w-full h-2.5"
              trackClassName="bg-[#e5e2dc] rounded-full overflow-hidden"
              fillClassName="bg-[#0d1f18] rounded-full"
              durationMs={700}
            />
          </div>

          {/* Card 2: Largest Competency Gap */}
          <div className="card-interactive p-6 sm:p-8 rounded-xl bg-[#ffdad6]/20 border border-[#ffdad6] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#ffdad6]">
              <div className="flex items-center gap-1.5 text-[#ba1a1a] font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                <span>Largest Competency Gap</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#ba1a1a] text-white font-label-sm text-[10px] font-bold uppercase">
                Critical Blocker
              </span>
            </div>

            <div className="my-4 space-y-1">
              <h3 className="font-headline-md text-headline-md text-[#0d1f18] font-bold">
                {largestGap.skill}
              </h3>
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-[#737874]">Demonstrated: <strong className="text-[#0d1f18]">{largestGap.demonstrated}%</strong></span>
                <span className="text-xs text-[#737874]">Threshold: <strong className="text-[#0d1f18]">{largestGap.roleThreshold}%</strong></span>
                <span className="text-sm font-bold text-[#ba1a1a]">Deficit: -{largestGap.gap} pts</span>
              </div>
            </div>

            <p className="text-xs text-[#424845] leading-relaxed">
              ATLAS prioritises {largestGap.skill} because your demonstrated score is furthest below the role threshold. Addressing this will provide the highest immediate boost to your hiring readiness.
            </p>
          </div>
        </div>

        {/* 5-Skill Breakdown Matrix */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1eee7]">
            <h3 className="font-headline-sm text-headline-sm text-[#0d1f18]">
              Skill Breakdown &amp; Demonstrated Gaps
            </h3>
            <span className="text-xs text-[#737874] font-medium">Sorted by gap size</span>
          </div>

          <StaggerContainer className="space-y-6">
            {skillGaps.map((item) => (
              <div key={item.skill} className="card-interactive p-4 rounded-lg bg-[#fcf9f3] border border-[#e5e2dc] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
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

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-[#737874]">Baseline: <strong className="text-[#0d1f18]">{item.baseline}%</strong></span>
                    <span className="text-[#737874]">Demonstrated: <strong className="text-[#0d1f18]">{item.demonstrated}%</strong></span>
                    <span className="text-[#737874]">Threshold: <strong className="text-[#0d1f18]">{item.roleThreshold}%</strong></span>
                    <span className={`font-mono ${item.gap > 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}`}>
                      {item.gap > 0 ? `Δ -${item.gap} pts` : 'Target Met'}
                    </span>
                  </div>
                </div>

                <SkillGapBar
                  current={item.demonstrated}
                  threshold={item.roleThreshold}
                  gap={item.gap}
                  priority={item.priority}
                  showLabels={true}
                />

                <p className="text-xs text-[#424845] leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </StaggerContainer>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#f1eee7]">
            <Link
              to="/assessment"
              className="btn-interactive text-xs text-[#737874] hover:text-[#0d1f18] flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retake Competency Assessment</span>
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

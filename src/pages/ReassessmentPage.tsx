import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const ReassessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, roleDefinition, skillGaps, submitReassessment } = useAtlas();

  // Local state for adjusting ratings initialized dynamically for all skills of active role
  const [editingRatings, setEditingRatings] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    roleDefinition.skills.forEach((s) => {
      initial[s.name] = state.selfRatings[s.name] ?? s.defaultBaseline;
    });
    return initial;
  });

  const [hasEvaluated, setHasEvaluated] = useState<boolean>(state.reassessment?.completed || false);

  const prevOverall = state.reassessment?.previousOverallScore ?? state.assessmentResult?.overallDemonstrated ?? 60;
  const currSum = Object.values(editingRatings).reduce((a, b) => a + b, 0);
  const currOverall = Math.round(currSum / Math.max(Object.keys(editingRatings).length, 1));
  const overallLift = currOverall - prevOverall;

  const handleApplyReassessment = () => {
    submitReassessment(editingRatings);
    setHasEvaluated(true);
  };

  const primaryGap = skillGaps[0]?.displayName || roleDefinition.skills[0]?.name || 'Core Skill';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <main className="w-full pt-16 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#eaddff]/60 text-[#25005a] font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6] animate-pulse"></span>
              EMPIRICAL RE-EVALUATION // {state.targetRole.toUpperCase()} CALIBRATION
            </div>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Let's see what changed.
            </h1>
            <p className="font-body-lg text-body-lg text-[#424845]">
              Reassess your capability and observe dynamic trajectory shifts across enterprise screening criteria for {state.targetRole}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/diagnosis"
              className="px-5 py-2.5 rounded bg-[#0d1f18] text-white hover:bg-[#22382f] font-semibold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              Return to Command Centre →
            </Link>
          </div>
        </section>

        {/* Highlight Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm space-y-2">
            <span className="font-label-sm text-label-sm text-[#737874] uppercase tracking-wider font-bold">
              Core Capability Lift
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-[#0d1f18] font-serif font-bold">
                {overallLift >= 0 ? `+${overallLift}` : overallLift}
              </span>
              <span className="text-[#6b4ea6] font-bold text-sm">pts</span>
            </div>
            <p className="text-xs text-[#424845]">
              Empirical readiness shift from {prevOverall}% to {currOverall}% across evaluated vectors.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm space-y-2">
            <span className="font-label-sm text-label-sm text-[#737874] uppercase tracking-wider font-bold">
              Target Role Threshold
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-[#0d1f18] font-serif font-bold">
                {roleDefinition.roleThreshold}%
              </span>
              <span className="text-[#4f6359] font-bold text-xs uppercase">Enterprise Benchmark</span>
            </div>
            <p className="text-xs text-[#424845]">
              Deficit to standard screening bar: {Math.max(roleDefinition.roleThreshold - currOverall, 0)} pts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm space-y-2">
            <span className="font-label-sm text-label-sm text-[#737874] uppercase tracking-wider font-bold">
              Active Primary Focus
            </span>
            <div className="font-serif text-xl font-bold text-[#0d1f18] truncate">
              {primaryGap}
            </div>
            <p className="text-xs text-[#ba1a1a] font-medium">
              Primary screening bottleneck under active calibration.
            </p>
          </div>
        </section>

        {/* Sub-competencies comparison cards */}
        <section className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
            <h2 className="font-headline-sm text-headline-sm text-[#0d1f18]">
              Sub-Competency Resolution Index ({roleDefinition.skills.length})
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#737874]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm bg-[#c2c8c3]"></span> Baseline</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm bg-[#6b4ea6]"></span> Current Calibrated</span>
            </div>
          </div>

          <div className="space-y-6">
            {roleDefinition.skills.map((skill) => {
              const prev = state.reassessment?.skillDeltas?.[skill.name]?.previous ?? state.selfRatings[skill.name] ?? skill.defaultBaseline;
              const curr = editingRatings[skill.name] ?? prev;
              const change = curr - prev;

              return (
                <div key={skill.name} className="p-4 rounded-lg bg-[#fcf9f3] border border-[#e5e2dc] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-title-md text-title-md text-[#0d1f18] font-semibold">{skill.name}</span>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-[#737874]">Baseline: {prev}%</span>
                      <span>→</span>
                      <span className="text-[#0d1f18] font-bold">Current: {curr}%</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        change >= 0 ? 'bg-[#d2e7dc] text-[#0d1f18]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}>
                        {change >= 0 ? `+${change}` : change} pts
                      </span>
                    </div>
                  </div>

                  {/* Slider Control to adjust rating */}
                  <div className="py-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={curr}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setEditingRatings((prevMap) => ({ ...prevMap, [skill.name]: val }));
                      }}
                      className="w-full accent-[#6b4ea6] cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#737874]">
                    <span>{skill.description}</span>
                    <span className="font-semibold text-[#0d1f18]">Threshold: {skill.targetThreshold}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#f1eee7]">
            <span className="text-xs text-[#737874]">Adjust sliders above to reflect updated skill verification.</span>
            <button
              type="button"
              onClick={handleApplyReassessment}
              className="px-6 py-2.5 rounded bg-[#0d1f18] text-white hover:bg-[#22382f] font-semibold text-xs transition-colors shadow-sm"
            >
              Save &amp; Recalculate Roadmap
            </button>
          </div>
        </section>

        {/* System Algorithmic Synthesis */}
        <section className="p-6 sm:p-8 rounded-xl bg-[#eaddff]/20 border border-[#eaddff] shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#6b4ea6] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-[#6b4ea6] font-bold">
                SYSTEM ALGORITHMIC SYNTHESIS
              </span>
              <h3 className="font-headline-md text-headline-md text-[#0d1f18]">
                ATLAS calibrated trajectory shifts for {state.targetRole}.
              </h3>
              <p className="font-body-md text-body-md text-[#424845] leading-relaxed pt-1">
                Your developmental priorities shift dynamically as skill verification is logged. Prioritizing {primaryGap} eliminates screening hurdles for {state.profile.experienceLevel || 'fresher'} candidates.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

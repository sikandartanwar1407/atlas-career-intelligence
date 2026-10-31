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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <main className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] font-mono text-[11px] uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A] animate-pulse"></span>
              EMPIRICAL RE-EVALUATION // {state.targetRole.toUpperCase()} CALIBRATION
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#18283D] tracking-tight">
              Let's see what changed.
            </h1>
            <p className="text-base text-[#6B7280]">
              Reassess your capability and observe dynamic trajectory shifts across enterprise screening criteria for {state.targetRole}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/diagnosis"
              className="px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              Return to Command Centre →
            </Link>
          </div>
        </section>

        {/* Highlight Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border-[#E5E7EB] shadow-lg space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6B7280]">
              Core Capability Lift
            </span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className={`text-4xl font-bold ${overallLift >= 0 ? 'text-[#8B6F5A]' : 'text-rose-400'}`}>
                {overallLift >= 0 ? `+${overallLift}` : overallLift}
              </span>
              <span className="text-[#8B6F5A] font-bold text-sm">pts</span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Empirical readiness shift from {prevOverall}% to {currOverall}% across evaluated vectors.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border-[#E5E7EB] shadow-lg space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6B7280]">
              Target Role Threshold
            </span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-4xl font-bold text-[#18283D]">
                {roleDefinition.roleThreshold}%
              </span>
              <span className="text-[#8B6F5A] font-bold text-xs uppercase">Enterprise Benchmark</span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Deficit to standard screening bar: {Math.max(roleDefinition.roleThreshold - currOverall, 0)} pts.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border-[#E5E7EB] shadow-lg space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6B7280]">
              Active Primary Focus
            </span>
            <div className="text-xl font-bold text-[#18283D] truncate">
              {primaryGap}
            </div>
            <p className="text-xs text-rose-400 font-mono">
              Primary screening bottleneck under active calibration.
            </p>
          </div>
        </section>

        {/* Sub-competencies comparison cards */}
        <section className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-[#18283D]">
              Sub-Competency Resolution Index ({roleDefinition.skills.length})
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono text-[#6B7280]">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm bg-[#E5E7EB]"></span> Baseline</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm bg-violet-500"></span> Current Calibrated</span>
            </div>
          </div>

          <div className="space-y-6">
            {roleDefinition.skills.map((skill) => {
              const prev = state.reassessment?.skillDeltas?.[skill.name]?.previous ?? state.selfRatings[skill.name] ?? skill.defaultBaseline;
              const curr = editingRatings[skill.name] ?? prev;
              const change = curr - prev;

              return (
                <div key={skill.name} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#18283D]">{skill.name}</span>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-[#6B7280]">Baseline: {prev}%</span>
                      <span className="text-[#6B7280]">→</span>
                      <span className="text-[#18283D] font-bold">Current: {curr}%</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        change >= 0 ? 'bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5]' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
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
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-[#6B7280]">
                    <span>{skill.description}</span>
                    <span className="text-[#18283D] font-semibold">Threshold: {skill.targetThreshold}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E7EB]">
            <span className="text-xs text-[#6B7280]">Adjust sliders above to reflect updated skill verification.</span>
            <button
              type="button"
              onClick={handleApplyReassessment}
              className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              Save &amp; Recalculate Roadmap
            </button>
          </div>
        </section>

        {/* System Algorithmic Synthesis */}
        <section className="p-6 sm:p-8 rounded-2xl glass-panel-elevated border-[#18283D]/30 shadow-2xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#D8C3A5]/30 border border-[#18283D]/30 text-[#8B6F5A] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B6F5A] font-bold">
                SYSTEM ALGORITHMIC SYNTHESIS
              </span>
              <h3 className="text-lg font-bold text-[#18283D]">
                ATLAS calibrated trajectory shifts for {state.targetRole}.
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed pt-1">
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

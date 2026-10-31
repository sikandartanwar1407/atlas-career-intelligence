import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SkillGapBar } from '../components/SkillGapBar';
import { SkillGapDetail } from '../types/atlas';
import { PageTransition, AnimatedNumber, StaggerContainer } from '../components/motion/Motion';

export const SkillGapsPage: React.FC = () => {
  const { skillGaps, careerReadiness, state } = useAtlas();

  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'evidence'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'gap-desc' | 'target-desc' | 'alpha'>('gap-desc');

  // Summary counts
  const highPriorityCount = skillGaps.filter((s) => s.priority === 'HIGH PRIORITY').length;
  const mediumPriorityCount = skillGaps.filter((s) => s.priority === 'MEDIUM PRIORITY').length;
  const lowPriorityCount = skillGaps.filter((s) => s.priority === 'LOW PRIORITY').length;
  const evidenceDeficitCount = skillGaps.filter((s) => s.evidenceStatus === 'Missing' || s.evidenceStatus === 'Unverified').length;

  // Filtered & Sorted Skills
  const displayedSkills = useMemo(() => {
    let list = skillGaps.filter((item) => {
      // Filter tab
      if (activeFilter === 'high' && item.priority !== 'HIGH PRIORITY') return false;
      if (activeFilter === 'medium' && item.priority !== 'MEDIUM PRIORITY') return false;
      if (activeFilter === 'low' && item.priority !== 'LOW PRIORITY') return false;
      if (activeFilter === 'evidence' && item.evidenceStatus !== 'Missing' && item.evidenceStatus !== 'Unverified') return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return item.displayName.toLowerCase().includes(query) || item.skill.toLowerCase().includes(query);
      }

      return true;
    });

    // Sort
    list = [...list].sort((a, b) => {
      if (sortOption === 'gap-desc') return b.gap - a.gap;
      if (sortOption === 'target-desc') return b.roleThreshold - a.roleThreshold;
      if (sortOption === 'alpha') return a.skill.localeCompare(b.skill);
      return 0;
    });

    return list;
  }, [skillGaps, activeFilter, searchQuery, sortOption]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Section 1: Header & Cognitive Framing */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] font-mono text-[11px] tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A] animate-pulse"></span>
              <span>SKILL GAP DECOMPOSITION // ATLAS COGNITIVE ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#18283D] tracking-tight">
              Your skill gaps.
            </h1>
            <p className="text-base text-[#6B7280]">
              See exactly where your current capability differs from your target role threshold.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB]">
                <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">target</span>
                <span className="text-xs text-[#6B7280]">Target Role:</span>
                <span className="text-xs font-bold text-[#18283D]">{state.targetRole}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-xs text-[#6B7280]">
                <span className="w-2 h-2 rounded-full bg-[#8B6F5A]"></span>
                <span className="font-mono">Standardized 80% Threshold</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-end shrink-0">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Build my learning plan</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Section 2: Telemetry Metrics Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">Career Readiness</span>
              <span className="material-symbols-outlined text-[#8B6F5A] text-[20px]">analytics</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-[#18283D] font-mono">
                <AnimatedNumber value={careerReadiness} suffix="%" durationMs={650} />
              </span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] font-mono text-[#8B6F5A]">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>Calculated</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden">
              <div className="h-full bg-violet-600 rounded-full transition-all duration-700" style={{ width: `${Math.min(careerReadiness, 100)}%` }} />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">Skills Analysed</span>
              <span className="material-symbols-outlined text-[#6B7280] text-[20px]">rule_settings</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-[#18283D] font-mono">
                <AnimatedNumber value={skillGaps.length} />
              </span>
              <span className="text-[11px] font-mono text-[#6B7280]">Active Vectors</span>
            </div>
            <p className="text-xs text-[#6B7280] truncate">
              Evaluated across core competencies
            </p>
          </div>

          {/* Metric 3 */}
          <div className="glass-panel border-rose-500/30 bg-rose-950/10 p-5 rounded-2xl shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400">High Priority</span>
              <span className="material-symbols-outlined text-rose-400 text-[20px]">warning</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-rose-300 font-mono">
                <AnimatedNumber value={highPriorityCount} />
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-mono font-semibold border border-rose-500/30">
                Critical Blocker
              </span>
            </div>
            <p className="text-xs text-[#6B7280] truncate">
              Immediate screening interview triage
            </p>
          </div>

          {/* Metric 4 */}
          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">Evidence Gaps</span>
              <span className="material-symbols-outlined text-[#8B6F5A] text-[20px]">folder_open</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-[#18283D] font-mono">
                <AnimatedNumber value={evidenceDeficitCount} />
              </span>
              <span className="text-[11px] font-mono text-amber-300">Unverified</span>
            </div>
            <p className="text-xs text-[#6B7280] truncate">
              Missing commercial repo artifacts
            </p>
          </div>
        </section>

        {/* Section 3: Filter & Control Toolbar */}
        <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 rounded-2xl glass-panel border-[#E5E7EB] bg-[#FAF7F2]/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 ${
                activeFilter === 'all'
                  ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
              }`}
            >
              All Skills ({skillGaps.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('high')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 ${
                activeFilter === 'high'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
              }`}
            >
              High Priority ({highPriorityCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('medium')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 ${
                activeFilter === 'medium'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
              }`}
            >
              Medium Priority ({mediumPriorityCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 ${
                activeFilter === 'low'
                  ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
              }`}
            >
              Low / On Track ({lowPriorityCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('evidence')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 ${
                activeFilter === 'evidence'
                  ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
              }`}
            >
              Evidence Deficits ({evidenceDeficitCount})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#6B7280] text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capabilities..."
                className="w-full sm:w-60 pl-9 pr-3 py-2 bg-[#FAF7F2] text-[#18283D] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#18283D] placeholder-[#6B7280]"
              />
            </div>
            <div className="relative flex items-center">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 bg-[#FAF7F2] text-[#18283D] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#18283D] cursor-pointer pr-8 appearance-none"
              >
                <option value="gap-desc">Sort by Priority Delta (Default)</option>
                <option value="target-desc">Sort by Target Benchmark</option>
                <option value="alpha">Alphabetical</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 text-[#6B7280] text-[16px] pointer-events-none">expand_more</span>
            </div>
          </div>
        </section>

        {/* Section 4: Sophisticated Skill Cards */}
        <StaggerContainer className="flex flex-col gap-5">
          {displayedSkills.map((item: SkillGapDetail) => (
            <article
              key={item.skill}
              className="glass-panel border-[#E5E7EB] p-6 lg:p-7 rounded-2xl shadow-xl flex flex-col gap-5 hover:border-[#8B6F5A]/60 hover:shadow-2xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all duration-200 ease-out"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                        item.priority === 'HIGH PRIORITY'
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                          : item.priority === 'MEDIUM PRIORITY'
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                          : 'bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {item.priority === 'HIGH PRIORITY' ? 'HIGH PRIORITY BLOCKER' : item.priority}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E5E7EB] font-mono text-[10px] text-[#6B7280]">
                      Role Prerequisite: 80% Threshold
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono ${
                        item.evidenceStatus === 'Missing'
                          ? 'bg-rose-500/15 border border-rose-500/20 text-rose-300 font-semibold'
                          : 'bg-[#FAF7F2] border border-[#E5E7EB] text-[#6B7280]'
                      }`}
                    >
                      Evidence: {item.evidenceStatus}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#18283D] tracking-tight">
                    {item.displayName}
                  </h2>
                </div>

                <div className="flex items-center gap-6 shrink-0 self-start md:self-auto bg-[#FAF7F2] border border-[#E5E7EB] px-4 py-2.5 rounded-xl">
                  <div className="flex flex-col items-start font-mono">
                    <span className="text-[10px] uppercase text-[#6B7280]">Current</span>
                    <span className="text-sm text-[#18283D] font-bold">{item.demonstrated}%</span>
                  </div>
                  <div className="h-6 w-px bg-[#E5E7EB]"></div>
                  <div className="flex flex-col items-start font-mono">
                    <span className="text-[10px] uppercase text-[#6B7280]">Target</span>
                    <span className="text-sm text-[#18283D] font-bold">{item.roleThreshold}%</span>
                  </div>
                  <div className="h-6 w-px bg-[#E5E7EB]"></div>
                  <div className="flex flex-col items-start font-mono">
                    <span className={`text-[10px] uppercase font-bold ${item.gap > 0 ? 'text-rose-400' : 'text-[#8B6F5A]'}`}>
                      {item.gap > 0 ? 'Deficit' : 'Status'}
                    </span>
                    <span className={`text-sm font-bold ${item.gap > 0 ? 'text-rose-400' : 'text-[#8B6F5A]'}`}>
                      {item.gap > 0 ? `Δ -${item.gap} pts` : 'Cleared'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dual Notch Progress Bar */}
              <SkillGapBar
                current={item.demonstrated}
                threshold={item.roleThreshold}
                gap={item.gap}
                priority={item.priority}
                showLabels={true}
              />

              {/* Explanatory description & action buttons */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2">
                <div className="lg:col-span-8 p-4 rounded-xl bg-[#FAF7F2]/80 border border-[#E5E7EB]">
                  <div className="flex items-start gap-2.5">
                    <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${item.gap > 0 ? 'text-rose-400' : 'text-[#8B6F5A]'}`}>
                      {item.gap > 0 ? 'report_problem' : 'check_circle'}
                    </span>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-2.5">
                  <Link
                    to="/career-roadmap"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                  >
                    <span>See Action Plan</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </StaggerContainer>

        {/* Section 5: Strategic Intelligence Container */}
        <section className="p-8 lg:p-10 rounded-2xl glass-panel-elevated border-[#18283D]/30 text-[#18283D] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8C3A5]/30 text-[#8B6F5A] font-mono text-[11px] tracking-wider uppercase border border-[#18283D]/30">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                <span>ATLAS Strategic Triage Synthesis</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#18283D] tracking-tight">
                Not every gap deserves equal attention.
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                ATLAS prioritises the skills with the highest empirical weighting in tier-1 screens. Remediating your primary {skillGaps[0]?.skill} deficit unlocks the majority of hiring criteria while immediately lifting your composite readiness score.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] font-mono text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>{skillGaps[0]?.skill}: Maximum ROI (High Impact / Remediation Target)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto relative z-10">
              <Link
                to="/resources"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                <span>Build My Learning Plan</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/career-roadmap"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#18283D] text-xs font-mono transition-all"
              >
                <span>Inspect Roadmap Sequence</span>
              </Link>
            </div>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};

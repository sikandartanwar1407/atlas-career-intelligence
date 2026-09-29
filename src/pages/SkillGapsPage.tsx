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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Section 1: Header & Cognitive Framing */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded bg-[#f1eee7] text-[#424845] font-label-sm text-label-sm tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6] animate-pulse"></span>
              <span>SKILL GAP DECOMPOSITION // ATLAS COGNITIVE ENGINE</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Your skill gaps.
            </h1>
            <p className="font-headline-sm text-headline-sm text-[#424845] font-normal">
              See exactly where your current capability differs from your target role.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#f6f3ed] text-[#1c1c18] border border-[#e5e2dc] card-interactive">
                <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">target</span>
                <span className="font-label-md text-label-md">Target Role:</span>
                <span className="font-title-md text-title-md text-[#0d1f18] font-semibold">{state.targetRole}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#f6f3ed] text-[#424845] font-label-sm text-label-sm border border-[#e5e2dc]">
                <span className="w-2 h-2 rounded-full bg-[#4f6359]"></span>
                <span>Standardized 80% Threshold</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-end shrink-0">
            <Link
              to="/resources"
              className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#0d1f18] text-white font-title-md text-title-md shadow-sm hover:bg-[#22382f] transition-all font-semibold"
            >
              <span>Build my learning plan</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Section 2: Telemetry Metrics Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="card-interactive p-5 rounded-lg bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider text-[#737874]">Career Readiness</span>
              <span className="material-symbols-outlined text-[#6b4ea6] text-[20px]">analytics</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={careerReadiness} suffix="%" durationMs={650} />
              </span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f1eee7] font-label-sm text-label-sm text-[#424845]">
                <span className="material-symbols-outlined text-[14px] text-[#4f6359]">trending_up</span>
                <span>Calculated</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[#e5e2dc] rounded-full overflow-hidden">
              <div className="h-full bg-[#6b4ea6] rounded-full transition-all duration-700" style={{ width: `${Math.min(careerReadiness, 100)}%` }} />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="card-interactive p-5 rounded-lg bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider text-[#737874]">Skills Analysed</span>
              <span className="material-symbols-outlined text-[#737874] text-[20px]">rule_settings</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={skillGaps.length} />
              </span>
              <span className="font-label-sm text-label-sm text-[#737874]">Active Vectors</span>
            </div>
            <p className="font-body-sm text-body-sm text-[#737874] truncate">
              Evaluated across core competencies
            </p>
          </div>

          {/* Metric 3 */}
          <div className="card-interactive p-5 rounded-lg bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider text-[#ba1a1a]">High Priority</span>
              <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">warning</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-metric-lg text-metric-lg text-[#ba1a1a] font-bold">
                <AnimatedNumber value={highPriorityCount} />
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-label-sm text-label-sm font-semibold">
                Critical Blocker
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-[#737874] truncate">
              Immediate screening interview triage
            </p>
          </div>

          {/* Metric 4 */}
          <div className="card-interactive p-5 rounded-lg bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider text-[#737874]">Evidence Gaps</span>
              <span className="material-symbols-outlined text-[#6b4ea6] text-[20px]">folder_open</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={evidenceDeficitCount} />
              </span>
              <span className="font-label-sm text-label-sm text-[#737874]">Unverified</span>
            </div>
            <p className="font-body-sm text-body-sm text-[#737874] truncate">
              Missing commercial repo artifacts
            </p>
          </div>
        </section>

        {/* Section 3: Filter & Control Toolbar */}
        <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded font-label-md text-label-md transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#0d1f18] text-white shadow-xs font-semibold'
                  : 'text-[#424845] hover:bg-[#ebe8e2]'
              }`}
            >
              All Skills ({skillGaps.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('high')}
              className={`px-3 py-1.5 rounded font-label-md text-label-md transition-colors ${
                activeFilter === 'high'
                  ? 'bg-[#0d1f18] text-white shadow-xs font-semibold'
                  : 'text-[#424845] hover:bg-[#ebe8e2]'
              }`}
            >
              High Priority ({highPriorityCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('medium')}
              className={`px-3 py-1.5 rounded font-label-md text-label-md transition-colors ${
                activeFilter === 'medium'
                  ? 'bg-[#0d1f18] text-white shadow-xs font-semibold'
                  : 'text-[#424845] hover:bg-[#ebe8e2]'
              }`}
            >
              Medium Priority ({mediumPriorityCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('low')}
              className={`px-3 py-1.5 rounded font-label-md text-label-md transition-colors ${
                activeFilter === 'low'
                  ? 'bg-[#0d1f18] text-white shadow-xs font-semibold'
                  : 'text-[#424845] hover:bg-[#ebe8e2]'
              }`}
            >
              Low / On Track ({lowPriorityCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('evidence')}
              className={`px-3 py-1.5 rounded font-label-md text-label-md transition-colors ${
                activeFilter === 'evidence'
                  ? 'bg-[#0d1f18] text-white shadow-xs font-semibold'
                  : 'text-[#424845] hover:bg-[#ebe8e2]'
              }`}
            >
              Evidence Deficits ({evidenceDeficitCount})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#737874] text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capabilities..."
                className="w-full sm:w-60 pl-9 pr-3 py-1.5 bg-white text-[#1c1c18] border border-[#c2c8c3] rounded text-xs focus:outline-none focus:border-[#0d1f18]"
              />
            </div>
            <div className="relative flex items-center">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-1.5 bg-white text-[#1c1c18] border border-[#c2c8c3] rounded text-xs focus:outline-none focus:border-[#0d1f18] cursor-pointer pr-8 appearance-none"
              >
                <option value="gap-desc">Sort by Priority Delta (Default)</option>
                <option value="target-desc">Sort by Target Benchmark</option>
                <option value="alpha">Alphabetical</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 text-[#737874] text-[16px] pointer-events-none">expand_more</span>
            </div>
          </div>
        </section>

        {/* Section 4: Sophisticated Skill Cards */}
        <StaggerContainer className="flex flex-col gap-5">
          {displayedSkills.map((item: SkillGapDetail) => (
            <article
              key={item.skill}
              className="card-interactive p-6 lg:p-7 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col gap-5 hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.priority === 'HIGH PRIORITY'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : item.priority === 'MEDIUM PRIORITY'
                          ? 'bg-[#ffddb3] text-[#291800]'
                          : 'bg-[#d2e7dc] text-[#0d1f18]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {item.priority === 'HIGH PRIORITY' ? 'HIGH PRIORITY BLOCKER' : item.priority}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f1eee7] font-label-sm text-[10px] text-[#424845]">
                      Role Prerequisite: 80% Threshold
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                        item.evidenceStatus === 'Missing'
                          ? 'bg-[#ffdad6]/40 text-[#ba1a1a] font-semibold'
                          : 'bg-[#f1eee7] text-[#424845]'
                      }`}
                    >
                      Evidence: {item.evidenceStatus}
                    </span>
                  </div>

                  <h2 className="font-headline-md text-headline-md text-[#0d1f18]">
                    {item.displayName}
                  </h2>
                </div>

                <div className="flex items-center gap-6 shrink-0 self-start md:self-auto bg-[#f6f3ed] border border-[#e5e2dc] px-4 py-2 rounded-lg">
                  <div className="flex flex-col items-start">
                    <span className="font-label-sm text-[10px] uppercase text-[#737874]">Current</span>
                    <span className="font-metric-sm text-metric-sm text-[#424845] font-bold">{item.demonstrated}%</span>
                  </div>
                  <div className="h-6 w-px bg-[#c2c8c3]"></div>
                  <div className="flex flex-col items-start">
                    <span className="font-label-sm text-[10px] uppercase text-[#737874]">Target</span>
                    <span className="font-metric-sm text-metric-sm text-[#0d1f18] font-bold">{item.roleThreshold}%</span>
                  </div>
                  <div className="h-6 w-px bg-[#c2c8c3]"></div>
                  <div className="flex flex-col items-start">
                    <span className={`font-label-sm text-[10px] uppercase font-bold ${item.gap > 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}`}>
                      {item.gap > 0 ? 'Deficit' : 'Status'}
                    </span>
                    <span className={`font-metric-sm text-metric-sm font-bold ${item.gap > 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}`}>
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
                <div className="lg:col-span-8 p-3.5 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc]">
                  <div className="flex items-start gap-2.5">
                    <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${item.gap > 0 ? 'text-[#ba1a1a]' : 'text-[#4f6359]'}`}>
                      {item.gap > 0 ? 'report_problem' : 'check_circle'}
                    </span>
                    <p className="font-body-md text-body-md text-[#1c1c18] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-2.5">
                  <Link
                    to="/career-roadmap"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#0d1f18] text-white font-title-md text-title-md hover:bg-[#22382f] transition-all shadow-xs"
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
        <section className="p-8 lg:p-10 rounded-2xl bg-[#0d1f18] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-[#d2e7dc] font-label-sm text-label-sm tracking-wider uppercase">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                <span>ATLAS Strategic Triage Synthesis</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white">
                Not every gap deserves equal attention.
              </h2>
              <p className="font-body-lg text-body-lg text-[#b7cbc0] leading-relaxed">
                ATLAS prioritises the skills with the highest empirical weighting in tier-1 screens. Remediating your primary {skillGaps[0]?.skill} deficit unlocks the majority of hiring criteria while immediately lifting your composite readiness score.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="px-3 py-1.5 rounded bg-white/10 text-white font-label-md text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                  <span>{skillGaps[0]?.skill}: Maximum ROI (High Impact / Remediation Target)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/resources"
                className="btn-interactive inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-white text-[#0d1f18] font-title-md text-title-md shadow-md hover:bg-[#f6f3ed] transition-all font-bold"
              >
                <span>Build My Learning Plan</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/career-roadmap"
                className="btn-interactive inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-white/10 text-white font-label-md text-label-md hover:bg-white/20 transition-colors"
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

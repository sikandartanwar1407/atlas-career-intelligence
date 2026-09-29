import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SkillKey, ResourceType } from '../types/atlas';
import { PageTransition, StaggerContainer } from '../components/motion/Motion';

export const ResourcesPage: React.FC = () => {
  const { state, roleDefinition, allocations, updateAvailability, toggleResourceStarted } = useAtlas();
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const allResources = useMemo(() => {
    return roleDefinition.skills.flatMap((s) => s.learningResources);
  }, [roleDefinition]);

  const filteredResources = allResources.filter((res) => {
    if (selectedSkillFilter !== 'all' && res.skill !== selectedSkillFilter) return false;
    if (selectedTypeFilter !== 'all' && res.type !== selectedTypeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Breadcrumb / Telemetry Strip */}
        <section className="w-full bg-[#f6f3ed] border border-[#e5e2dc] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f1eee7] text-[#424845] font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
              COGNITIVE CAPITAL ENGINE // VECTOR ALLOCATION
            </span>
            <span className="text-[#c2c8c3] hidden sm:inline">|</span>
            <span className="font-body-sm text-body-sm text-[#424845] hidden md:inline">
              Model: <span className="font-semibold text-[#0d1f18]">{state.targetRole} Dynamic Path</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs uppercase tracking-wider text-[#737874]">
            <span className="flex items-center gap-1 text-[#0d1f18] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f6359]"></span>
              Deficit-Calibrated Hours
            </span>
          </div>
        </section>

        {/* Hero Section */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#6b4ea6] font-bold">
                <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                <span>Algorithmic Time Allocation</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
                Where should your time go?
              </h1>
              <p className="font-body-lg text-body-lg text-[#424845]">
                You have <strong className="text-[#0d1f18]">{state.availability} hours</strong> available this week. ATLAS has calibrated every hour against your competency deficits to maximize interview clearance.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/career-roadmap"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d1f18] text-white hover:bg-[#22382f] rounded font-title-md text-title-md transition-all shadow-md font-semibold"
              >
                <span>View my roadmap</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Interactive Commitment Selector Strip */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-title-md text-title-md text-[#0d1f18] font-bold">Available Weekly Commitment</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-[#f1eee7] text-[#424845]">
                  Dynamic Shift
                </span>
              </div>
              <p className="text-xs text-[#737874]">
                Select cognitive capacity. ATLAS rescales time across blockers while preserving high-yield priority ratios.
              </p>
            </div>

            <div className="inline-flex p-1 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] shrink-0">
              {[5, 10, 15, 20].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => updateAvailability(hrs)}
                  className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
                    state.availability === hrs
                      ? 'bg-white text-[#0d1f18] shadow-xs'
                      : 'text-[#737874] hover:text-[#0d1f18]'
                  }`}
                >
                  {hrs} hrs/wk {hrs === 10 && <span className="ml-1 text-[10px] text-[#6b4ea6] font-bold">● TARGET</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Dual Split Engine: Donut Summary + Detailed Allocation Bars */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: SVG Donut Visualizer */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
              <div>
                <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#737874] font-bold">
                  Sprint Composition
                </span>
                <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Empirical Distribution Matrix</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#eaddff] text-[#25005a] text-xs font-bold uppercase">
                Calibrated
              </span>
            </div>

            {/* Central Donut Graphic */}
            <div className="relative my-6 flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="90" fill="transparent" stroke="#f1eee7" strokeWidth="24" />
                {/* Segments rendered dynamically */}
                {(() => {
                  let accumulatedOffset = 0;
                  const circumference = 2 * Math.PI * 90;
                  const colors = ['#6b4ea6', '#0d1f18', '#ab7b32', '#4f6359', '#737874'];

                  return allocations.map((alloc, idx) => {
                    const strokeDash = (alloc.allocatedHours / state.availability) * circumference;
                    const strokeOffset = -accumulatedOffset;
                    accumulatedOffset += strokeDash;

                    return (
                      <circle
                        key={alloc.skill}
                        cx="120"
                        cy="120"
                        r="90"
                        fill="transparent"
                        stroke={colors[idx % colors.length]}
                        strokeWidth="24"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-700"
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-label-sm text-[10px] uppercase tracking-widest text-[#737874] font-bold">Total Sprint</span>
                <span className="font-metric-lg text-[44px] font-bold text-[#0d1f18] leading-none">{state.availability}</span>
                <span className="text-xs text-[#737874] uppercase tracking-wider font-semibold">Hours / Week</span>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-[#f6f3ed] text-[10px] text-[#6b4ea6] font-bold">
                  {allocations.length} Skills Calibrated
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#f1eee7]">
              {allocations.map((alloc, idx) => {
                const colors = ['bg-[#6b4ea6]', 'bg-[#0d1f18]', 'bg-[#ab7b32]', 'bg-[#4f6359]', 'bg-[#737874]'];
                return (
                  <div key={alloc.skill} className="flex items-center gap-2 p-2 rounded bg-[#f6f3ed] border border-[#e5e2dc]">
                    <span className={`w-3 h-3 rounded-xs ${colors[idx % colors.length]} shrink-0`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0d1f18] truncate">{alloc.skill}</div>
                      <div className="text-[11px] text-[#737874]">{alloc.allocatedHours}h · {alloc.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Priority Tiers */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-xl bg-white border border-[#e5e2dc] shadow-sm flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#737874] font-bold">
                Priority Tiers &amp; Execution Windows
              </span>
              <span className="text-xs font-bold text-[#6b4ea6]">Deficit-Calibrated</span>
            </div>

            <div className="space-y-5">
              {allocations.map((alloc) => (
                <div key={alloc.skill} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-title-md text-title-md text-[#0d1f18] font-bold">{alloc.skill}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alloc.priority === 'HIGH PRIORITY'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : alloc.priority === 'MEDIUM PRIORITY'
                          ? 'bg-[#ffddb3] text-[#291800]'
                          : 'bg-[#d2e7dc] text-[#0d1f18]'
                      }`}>
                        {alloc.priority}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="font-metric-sm text-metric-sm text-[#0d1f18] font-bold">{alloc.allocatedHours} hrs</span>
                      <span className="text-xs text-[#737874]">({alloc.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[#e5e2dc] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        alloc.priority === 'HIGH PRIORITY'
                          ? 'bg-[#ba1a1a]'
                          : alloc.priority === 'MEDIUM PRIORITY'
                          ? 'bg-[#6b4ea6]'
                          : 'bg-[#4f6359]'
                      }`}
                      style={{ width: `${Math.min(alloc.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#737874]">
                    <span>Proportional weighting: {alloc.gap > 0 ? `${alloc.gap} point deficit` : 'Maintenance baseline'}</span>
                    <span className="font-semibold text-[#0d1f18]">Allocated: {alloc.allocatedHours}h / week</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Check confirmation banner */}
            <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] flex items-center justify-between text-xs">
              <span className="text-[#424845]">Total Sum of Allocated Vectors:</span>
              <span className="font-bold text-[#0d1f18] font-mono text-sm">
                {allocations.reduce((a, b) => a + b.allocatedHours, 0)} / {state.availability}.0 Hours
              </span>
            </div>
          </div>
        </section>

        {/* Learning Resources Directory */}
        <section className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f1eee7]">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-[#0d1f18]">
                Recommended Learning &amp; Project Resources
              </h2>
              <p className="text-xs text-[#737874] mt-0.5">
                Curated modules, practical scenario drills, and portfolio projects aligned with your allocated hours.
              </p>
            </div>

            {/* Skill and Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="px-3 py-1.5 rounded bg-[#f6f3ed] border border-[#c2c8c3] text-xs font-semibold text-[#0d1f18] focus:outline-none"
              >
                <option value="all">All Skills</option>
                {roleDefinition.skills.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded bg-[#f6f3ed] border border-[#c2c8c3] text-xs font-semibold text-[#0d1f18] focus:outline-none"
              >
                <option value="all">All Resource Types</option>
                <option value="Course">Course</option>
                <option value="Project">Project</option>
                <option value="Practice">Practice</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Documentation">Documentation</option>
              </select>
            </div>
          </div>

          {/* Resources Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => {
              const status = state.resourceStatus[res.id] || { started: false, completed: false };

              return (
                <div
                  key={res.id}
                  className={`card-interactive p-5 rounded-lg border flex flex-col justify-between gap-4 ${
                    status.started
                      ? 'bg-[#eaddff]/20 border-[#6b4ea6]'
                      : 'bg-[#fcf9f3] border-[#e5e2dc] hover:bg-[#f6f3ed]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white border border-[#e5e2dc] text-[10px] font-bold uppercase text-[#0d1f18]">
                          {res.skill}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#f1eee7] text-[10px] font-semibold text-[#424845]">
                          {res.type}
                        </span>
                      </div>
                      <span className="text-xs text-[#737874] font-medium">{res.estimatedHours} hrs</span>
                    </div>

                    <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">
                      {res.title}
                    </h3>
                    <p className="text-xs text-[#424845] leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#e5e2dc]/60 text-xs">
                    <span className="text-[#737874]">{res.provider}</span>
                    <button
                      type="button"
                      onClick={() => toggleResourceStarted(res.id)}
                      className={`btn-interactive px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-1 shadow-2xs ${
                        status.started
                          ? 'bg-[#6b4ea6] text-white hover:bg-[#52358c]'
                          : 'bg-[#0d1f18] text-white hover:bg-[#22382f]'
                      }`}
                    >
                      <span>{status.started ? 'Mark in Progress' : 'Start Resource'}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {status.started ? 'check' : 'play_arrow'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </StaggerContainer>

          <div className="pt-4 flex justify-between items-center text-xs text-[#737874]">
            <span>Showing {filteredResources.length} curated resources</span>
            <Link to="/career-roadmap" className="text-[#6b4ea6] font-bold hover:underline">
              View generated sprint roadmap →
            </Link>
          </div>
        </section>

        {/* Pedagogical Principles */}
        <section className="bg-[#f6f3ed] p-8 rounded-xl border border-[#e5e2dc] space-y-4">
          <div className="space-y-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-[#737874] font-bold">
              ATLAS Pedagogical Foundation
            </span>
            <h3 className="font-headline-sm text-headline-sm text-[#0d1f18]">
              Principles of Cognitive Allocation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="font-title-md text-title-md text-[#6b4ea6] font-bold">01. Deficit-Weighted, Not Equal-Split</span>
              <p className="text-xs text-[#424845] leading-relaxed">
                Equal time distribution across all curriculum topics dilutes focus. Allocating proportionally to skill deficits cuts career readiness time by over 50%.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-title-md text-title-md text-[#6b4ea6] font-bold">02. Threshold Completion Bias</span>
              <p className="text-xs text-[#424845] leading-relaxed">
                Pushing a skill from 48% to 80% (the enterprise screening threshold) yields exponential interview invites compared to polishing already passing skills from 85% to 95%.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-title-md text-title-md text-[#6b4ea6] font-bold">03. Active Artifact Synthesis</span>
              <p className="text-xs text-[#424845] leading-relaxed">
                Every allocated hour mandates tangible project output: reproducible SQL scripts, hosted DAX models, or executive markdown briefings rather than passive video consumption.
              </p>
            </div>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};

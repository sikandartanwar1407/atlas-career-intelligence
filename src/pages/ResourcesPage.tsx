import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Breadcrumb / Telemetry Strip */}
        <section className="w-full glass-panel border-[#E5E7EB] bg-[#FAF7F2]/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] font-mono text-[11px] uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A] animate-pulse"></span>
              COGNITIVE CAPITAL ENGINE // VECTOR ALLOCATION
            </span>
            <span className="text-[#6B7280] hidden sm:inline">|</span>
            <span className="text-xs text-[#6B7280] hidden md:inline font-mono">
              Model: <span className="font-semibold text-[#18283D]">{state.targetRole} Dynamic Path</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-[#6B7280]">
            <span className="flex items-center gap-1 text-[#8B6F5A] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]"></span>
              Deficit-Calibrated Hours
            </span>
          </div>
        </section>

        {/* Hero Section */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#8B6F5A] font-bold">
                <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                <span>Algorithmic Time Allocation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#18283D] tracking-tight">
                Where should your time go?
              </h1>
              <p className="text-base text-[#6B7280]">
                You have <strong className="text-[#18283D] font-mono">{state.availability} hours</strong> available this week. ATLAS has calibrated every hour against your competency deficits to maximize interview clearance.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/career-roadmap"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <span>View my roadmap</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Interactive Commitment Selector Strip */}
          <div className="p-6 rounded-2xl glass-panel border-[#E5E7EB] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#18283D]">Available Weekly Commitment</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest font-bold bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A]">
                  Dynamic Shift
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Select cognitive capacity. ATLAS rescales time across blockers while preserving high-yield priority ratios.
              </p>
            </div>

            <div className="inline-flex p-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] shrink-0">
              {[5, 10, 15, 20].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => updateAvailability(hrs)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition-all duration-180 cursor-pointer ${
                    state.availability === hrs
                      ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs -translate-y-0.5'
                      : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
                  }`}
                >
                  {hrs} hrs/wk {hrs === 10 && <span className="ml-1 text-[10px] text-[#8B6F5A] font-bold">● TARGET</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Dual Split Engine: Donut Summary + Detailed Allocation Bars */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: SVG Donut Visualizer */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl glass-panel border-[#E5E7EB] shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-mono font-bold">
                  Sprint Composition
                </span>
                <h3 className="text-base font-bold text-[#18283D]">Empirical Distribution Matrix</h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5] text-xs font-mono font-bold uppercase">
                Calibrated
              </span>
            </div>

            {/* Central Donut Graphic */}
            <div className="relative my-6 flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="90" fill="transparent" stroke="#E5E7EB" strokeWidth="24" />
                {/* Segments rendered dynamically */}
                {(() => {
                  let accumulatedOffset = 0;
                  const circumference = 2 * Math.PI * 90;
                  const colors = ['#18283D', '#8B6F5A', '#D8C3A5', '#4B5563', '#6B7280'];

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
                <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-mono font-bold">Total Sprint</span>
                <span className="text-5xl font-bold text-[#18283D] font-mono leading-none my-1">{state.availability}</span>
                <span className="text-xs text-[#6B7280] font-mono uppercase tracking-wider">Hours / Week</span>
                <span className="mt-2 px-2.5 py-0.5 rounded-full bg-[#D8C3A5]/30 border border-[#18283D]/30 text-[10px] text-[#8B6F5A] font-mono font-bold">
                  {allocations.length} Skills Calibrated
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E5E7EB]">
              {allocations.map((alloc, idx) => {
                const colors = ['bg-[#18283D]', 'bg-[#8B6F5A]', 'bg-[#D8C3A5]', 'bg-[#4B5563]', 'bg-[#6B7280]'];
                return (
                  <div key={alloc.skill} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB]">
                    <span className={`w-3 h-3 rounded-md ${colors[idx % colors.length]} shrink-0 shadow-sm`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#18283D] truncate">{alloc.skill}</div>
                      <div className="text-[11px] font-mono text-[#6B7280]">{alloc.allocatedHours}h · {alloc.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Priority Tiers */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl glass-panel border-[#E5E7EB] shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">
                Priority Tiers &amp; Execution Windows
              </span>
              <span className="text-xs font-mono font-bold text-[#8B6F5A]">Deficit-Calibrated</span>
            </div>

            <div className="space-y-5">
              {allocations.map((alloc) => (
                <div key={alloc.skill} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#18283D]">{alloc.skill}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        alloc.priority === 'HIGH PRIORITY'
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                          : alloc.priority === 'MEDIUM PRIORITY'
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                          : 'bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A]'
                      }`}>
                        {alloc.priority}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-sm text-[#18283D] font-bold">{alloc.allocatedHours} hrs</span>
                      <span className="text-xs text-[#6B7280]">({alloc.percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        alloc.priority === 'HIGH PRIORITY'
                          ? 'bg-rose-500'
                          : alloc.priority === 'MEDIUM PRIORITY'
                          ? 'bg-violet-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(alloc.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
                    <span>Proportional weighting: {alloc.gap > 0 ? `${alloc.gap} point deficit` : 'Maintenance baseline'}</span>
                    <span className="text-[#18283D] font-semibold">Allocated: {alloc.allocatedHours}h / week</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Check confirmation banner */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between text-xs font-mono">
              <span className="text-[#6B7280]">Total Sum of Allocated Vectors:</span>
              <span className="font-bold text-[#18283D] text-sm">
                {allocations.reduce((a, b) => a + b.allocatedHours, 0)} / {state.availability}.0 Hours
              </span>
            </div>
          </div>
        </section>

        {/* Learning Resources Directory */}
        <section className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-xl font-bold text-[#18283D]">
                Recommended Learning &amp; Project Resources
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Curated modules, practical scenario drills, and portfolio projects aligned with your allocated hours.
              </p>
            </div>

            {/* Skill and Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-xs font-semibold text-[#18283D] focus:outline-none focus:border-[#18283D]"
              >
                <option value="all">All Skills</option>
                {roleDefinition.skills.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>

              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-xs font-semibold text-[#18283D] focus:outline-none focus:border-[#18283D]"
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
                  className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 transition-all duration-200 ease-out ${
                    status.started
                      ? 'bg-[#D8C3A5]/20 border-[#18283D] shadow-sm -translate-y-0.5'
                      : 'bg-[#FAF7F2] border-[#E5E7EB] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#E5E7EB] border border-[#E5E7EB] text-[10px] font-mono font-bold uppercase text-[#18283D]">
                          {res.skill}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] font-mono font-semibold text-[#8B6F5A]">
                          {res.type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#6B7280]">{res.estimatedHours} hrs</span>
                    </div>

                    <h3 className="text-base font-bold text-[#18283D]">
                      {res.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] text-xs">
                    <span className="text-[#6B7280] font-mono">{res.provider}</span>
                    <button
                      type="button"
                      onClick={() => toggleResourceStarted(res.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1 transition-all duration-180 cursor-pointer ${
                        status.started
                          ? 'bg-[#18283D] text-[#FAF7F2] shadow-sm hover:bg-[#223752]'
                          : 'bg-[#FAF7F2] text-[#18283D] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 border border-[#E5E7EB] hover:-translate-y-0.5'
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

          <div className="pt-4 flex justify-between items-center text-xs text-[#6B7280] font-mono">
            <span>Showing {filteredResources.length} curated resources</span>
            <Link to="/career-roadmap" className="text-[#8B6F5A] font-bold hover:text-[#18283D] transition-colors">
              View generated sprint roadmap →
            </Link>
          </div>
        </section>

        {/* Pedagogical Principles */}
        <section className="glass-panel border-[#E5E7EB] p-8 rounded-2xl space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">
              ATLAS Pedagogical Foundation
            </span>
            <h3 className="text-xl font-bold text-[#18283D]">
              Principles of Cognitive Allocation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="text-sm text-[#8B6F5A] font-bold block">01. Deficit-Weighted, Not Equal-Split</span>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Equal time distribution across curriculum topics dilutes focus. Allocating proportionally to skill deficits cuts career readiness time by over 50%.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm text-[#8B6F5A] font-bold block">02. Threshold Completion Bias</span>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Pushing a skill from 48% to 80% (the enterprise screening threshold) yields exponential interview clearance compared to polishing already passing skills.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm text-[#8B6F5A] font-bold block">03. Active Artifact Synthesis</span>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Every allocated hour mandates tangible project output: reproducible scripts, hosted models, or executive markdown briefings rather than passive video consumption.
              </p>
            </div>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};

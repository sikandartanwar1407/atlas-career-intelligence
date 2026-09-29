import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EvidenceItem, EvidenceType, SkillKey } from '../types/atlas';
import { GitHubAnalyzerSection } from '../components/GitHubAnalyzerSection';
import { PageTransition, AnimatedNumber, StaggerContainer } from '../components/motion/Motion';

export const EvidencePage: React.FC = () => {
  const { state, roleDefinition, addEvidence, updateEvidence, deleteEvidence } = useAtlas();

  const [filter, setFilter] = useState<'all' | 'deficits' | 'verified'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EvidenceItem | null>(null);

  // Form State
  const defaultSkill = roleDefinition.skills[0]?.name || 'Core Skill';
  const [formTitle, setFormTitle] = useState('');
  const [formSkill, setFormSkill] = useState<SkillKey>(defaultSkill);
  const [formType, setFormType] = useState<EvidenceType>('Dashboard');
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<'Verified' | 'Under Review' | 'Submitted'>('Submitted');

  // Defense Drill State
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [drillAnswer, setDrillAnswer] = useState('');
  const [drillFeedback, setDrillFeedback] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormSkill(defaultSkill);
    setFormType('Dashboard');
    setFormDesc('');
    setFormLink('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Submitted');
    setIsModalOpen(true);
  };

  const openEditModal = (item: EvidenceItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSkill(item.skill);
    setFormType(item.type);
    setFormDesc(item.description);
    setFormLink(item.link);
    setFormDate(item.date);
    setFormStatus(item.verificationStatus);
    setIsModalOpen(true);
  };

  const handleSaveEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      updateEvidence({
        ...editingItem,
        title: formTitle,
        skill: formSkill,
        type: formType,
        description: formDesc,
        link: formLink,
        date: formDate,
        verificationStatus: formStatus
      });
    } else {
      addEvidence({
        title: formTitle,
        skill: formSkill,
        type: formType,
        description: formDesc,
        link: formLink,
        date: formDate,
        verificationStatus: formStatus,
        metrics: 'User Uploaded Artifact',
        shaHash: `SHA-256: ${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        evaluatorFeedback: 'Submitted into candidate evidence telemetry. Ready for simulated defense drill.'
      });
    }
    setIsModalOpen(false);
  };

  const handleRunDrill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drillAnswer.trim()) return;

    setDrillFeedback(
      `Evaluation complete: Your explanation addresses key technical nuances. Recommended improvement: explicitly mention how row-level security or index scan costs impact overall query latency under high concurrent load.`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-16 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header & Strategic Telemetry */}
        <section className="flex flex-col gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#f1eee7] text-[#424845] font-label-sm text-label-sm tracking-widest uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6] animate-pulse"></span>
                PORTFOLIO &amp; ARTIFACT PROOF // VERIFICATION PIPELINE
              </span>
              <span className="text-[#c2c8c3] hidden sm:inline">•</span>
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-[#6b4ea6] font-semibold">
                EVIDENCE CONFIDENCE: 94.2% • HIRING DEFENSE ENGINE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openAddModal}
                className="btn-interactive inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0d1f18] text-white hover:bg-[#22382f] font-title-md text-title-md transition-all shadow-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Add a project</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline pt-2">
            <div className="lg:col-span-8 space-y-2">
              <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
                Don't just learn it. Prove it.
              </h1>
              <p className="font-body-lg text-body-lg text-[#424845] leading-relaxed">
                Your skills become career evidence when you can demonstrate them. ATLAS verifies candidate artifacts against tier-1 enterprise technical rubrics to eliminate resume filtering.
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end items-center">
              <div className="p-3.5 rounded bg-[#f6f3ed] border border-[#e5e2dc] w-full max-w-xs flex items-center gap-3 card-interactive">
                <span className="material-symbols-outlined text-[#6b4ea6] text-[24px]">verified</span>
                <div>
                  <div className="text-[11px] font-semibold text-[#737874] uppercase tracking-wider">Calibration State</div>
                  <div className="font-title-md text-title-md text-[#0d1f18] font-bold">Live Recruiter Defense Ready</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Metric Telemetry Strip (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-interactive bg-white p-5 rounded-lg border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737874] uppercase font-semibold">Evidence Readiness</span>
              <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-bold">-32% Deficit</span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={48} suffix="%" />
              </span>
              <span className="text-xs text-[#737874]">/ 80% Target</span>
            </div>
            <p className="text-[11px] text-[#737874]">Benchmark: 80% to bypass automated technical filters</p>
          </div>

          <div className="card-interactive bg-white p-5 rounded-lg border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737874] uppercase font-semibold">Verified Projects</span>
              <span className="px-2 py-0.5 rounded bg-[#eaddff] text-[#25005a] font-bold">
                {state.evidence.filter((e) => e.verificationStatus === 'Under Review').length} Under Review
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={state.evidence.length} />
              </span>
              <span className="text-xs text-[#737874]">Dossier Artifacts</span>
            </div>
            <p className="text-[11px] text-[#737874]">Submitted &amp; calibrated across target role competencies</p>
          </div>

          <div className="card-interactive bg-white p-5 rounded-lg border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737874] uppercase font-semibold">Verified Skills</span>
              <span className="px-2 py-0.5 rounded bg-[#d2e7dc] text-[#0d1f18] font-bold">4 of 5 Calibrated</span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="font-metric-lg text-metric-lg text-[#0d1f18] font-bold">
                <AnimatedNumber value={4} />
              </span>
              <span className="text-xs text-[#737874]">Competencies Backed</span>
            </div>
            <p className="text-[11px] text-[#737874]">Backed by code repos, models, or reproducible analytical memos</p>
          </div>

          <div className="card-interactive bg-white p-5 rounded-lg border border-[#e5e2dc] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737874] uppercase font-semibold">Evidence Gaps</span>
              <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-bold">Action Required</span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="font-metric-lg text-metric-lg text-[#ba1a1a] font-bold">
                <AnimatedNumber value={2} />
              </span>
              <span className="text-xs text-[#737874]">Severe Deficits</span>
            </div>
            <p className="text-[11px] text-[#737874]">Critical gaps unbacked by live code, dashboard, or written memo</p>
          </div>
        </section>

        {/* GitHub Evidence Analyzer Section */}
        <GitHubAnalyzerSection />

        {/* Two-Column Strategic Architecture */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: EVIDENCE LOCKER PROJECTS */}
          <div className="lg:col-span-8 space-y-8">
            {/* Artifacts Header & Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#e5e2dc]">
              <div className="flex items-center gap-3">
                <h2 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">
                  Verified Artifacts &amp; Submitted Projects
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#6b4ea6] text-white text-xs font-bold">
                  {state.evidence.length} Projects
                </span>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="btn-interactive px-3.5 py-1.5 rounded bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#0d1f18] border border-[#e5e2dc] text-xs font-semibold flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>+ Add New Project</span>
              </button>
            </div>

            {/* List of Evidence Projects */}
            <StaggerContainer className="space-y-6">
              {state.evidence.map((item) => (
                <article
                  key={item.id}
                  className="card-interactive bg-white rounded-xl p-6 sm:p-7 border border-[#e5e2dc] shadow-sm space-y-4 hover:shadow-md relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-headline-sm text-headline-sm text-[#0d1f18] font-bold">
                          {item.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.verificationStatus === 'Verified'
                            ? 'bg-[#d2e7dc] text-[#0d1f18]'
                            : item.verificationStatus === 'Under Review'
                            ? 'bg-[#eaddff] text-[#25005a]'
                            : 'bg-[#f1eee7] text-[#424845]'
                        }`}>
                          {item.verificationStatus}
                        </span>
                      </div>
                      <div className="text-xs text-[#737874] uppercase tracking-wide">
                        {item.skill} · {item.type} {item.metrics ? `· ${item.metrics}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1 rounded bg-[#f6f3ed] hover:bg-[#ebe8e2] text-xs font-semibold text-[#0d1f18] border border-[#e5e2dc]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEvidence(item.id)}
                        className="px-3 py-1 rounded bg-white hover:bg-[#ffdad6] text-xs font-semibold text-[#ba1a1a] border border-[#ffdad6]"
                        title="Delete project"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="font-body-md text-body-md text-[#424845] leading-relaxed">
                    {item.description}
                  </p>

                  {/* Attached Links */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-[#737874] uppercase tracking-wider block">
                      Reproducibility &amp; Artifact Links
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc] hover:border-[#6b4ea6] transition-colors flex items-center justify-between text-[#0d1f18] font-medium truncate"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">link</span>
                            <span className="truncate">{item.link}</span>
                          </span>
                          <span className="material-symbols-outlined text-[14px] text-[#737874]">north_east</span>
                        </a>
                      )}
                      <div className="p-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc] flex items-center justify-between text-xs text-[#737874]">
                        <span>Date Logged: {item.date}</span>
                        <span className="font-mono text-[10px]">{item.shaHash || 'SHA-256: 9f8a...'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluator AI Rubric Feedback */}
                  {item.evaluatorFeedback && (
                    <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#6b4ea6] uppercase">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">psychology</span>
                          <span>ATLAS Evaluator Rubric Feedback</span>
                        </span>
                        <span className="text-[#737874] font-normal normal-case">Calibrated in Sandbox</span>
                      </div>
                      <p className="text-[#424845] leading-relaxed">
                        "{item.evaluatorFeedback}"
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </StaggerContainer>
          </div>

          {/* RIGHT 4 COLUMNS: CRITERIA & DEFENSE SIMULATOR */}
          <div className="lg:col-span-4 space-y-6">
            {/* Strategic Synthesis Card */}
            <div className="bg-[#f6f3ed] border border-[#e5e2dc] rounded-xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#6b4ea6] font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">insights</span>
                <span>Strategic Synthesis</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-[#0d1f18] leading-tight">
                Why Evidence Trumps Certifications
              </h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Recruiters spend an average of 6 seconds skimming course completion certificates, but 3.5 minutes reviewing interactive dashboards and documented Git commits. ATLAS transforms your completed tasks into recruiter-verifiable proof.
              </p>
              <div className="p-3 rounded bg-white border border-[#e5e2dc] space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-[#737874]">Verification Readiness:</span>
                  <span className="text-[#0d1f18]">48% → 80% Goal</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#e5e2dc] overflow-hidden">
                  <div className="h-full bg-[#6b4ea6]" style={{ width: '48%' }}></div>
                </div>
                <span className="text-[11px] text-[#6b4ea6] font-medium block">
                  Closing 1 Power BI dashboard lifts evidence readiness to 72%.
                </span>
              </div>
            </div>

            {/* Hiring Grade Criteria */}
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#f1eee7]">
                <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Hiring-Grade Criteria</h3>
                <span className="text-xs text-[#737874]">4 Rules</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc]">
                  <span className="material-symbols-outlined text-[18px] text-[#4f6359] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="font-bold text-[#0d1f18]">Clean Git Commit History</div>
                    <div className="text-[#737874]">No single "upload files" dumps. Iterative, structured pull requests.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc]">
                  <span className="material-symbols-outlined text-[18px] text-[#4f6359] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="font-bold text-[#0d1f18]">Data Dictionary &amp; Framing</div>
                    <div className="text-[#737874]">Defines primary keys, grain, and executive revenue objective.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded bg-[#f6f3ed] border border-[#e5e2dc]">
                  <span className="material-symbols-outlined text-[18px] text-[#4f6359] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="font-bold text-[#0d1f18]">Interactive Live Sandbox</div>
                    <div className="text-[#737874]">Never rely solely on static screenshots. Host an embedded preview.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded bg-[#ffdad6]/40 border border-[#ffdad6]">
                  <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] shrink-0 mt-0.5">warning</span>
                  <div>
                    <div className="font-bold text-[#ba1a1a]">Row-Level Security (RLS) &amp; Defense Video</div>
                    <div className="text-[#737874]">Missing — Required to enter the 95th percentile top candidate tier.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cognitive Defense Prep / Simulator */}
            <div className="bg-[#0d1f18] text-white rounded-xl p-6 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#eaddff] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  Cognitive Defense Prep
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono">10 MIN</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-white">
                Simulate Interview Artifact Defense
              </h3>
              <p className="text-xs text-[#b7cbc0] leading-relaxed">
                Practice defending your Retail Sales Dashboard against ATLAS AI simulating a Lead Data Analyst asking rigorous DAX context transition and schema questions.
              </p>

              {!isDrillActive ? (
                <button
                  type="button"
                  onClick={() => setIsDrillActive(true)}
                  className="w-full mt-2 py-2.5 px-4 rounded bg-white hover:bg-[#f6f3ed] text-[#0d1f18] font-title-md text-title-md font-bold transition-all shadow-sm text-center block"
                >
                  Launch 10-min Code Defense →
                </button>
              ) : (
                <form onSubmit={handleRunDrill} className="pt-2 space-y-2">
                  <label className="text-xs text-[#d2e7dc] block">
                    Question: "Why did you use CALCULATE with USERELATIONSHIP instead of creating a secondary active relationship on FactSales?"
                  </label>
                  <textarea
                    rows={3}
                    value={drillAnswer}
                    onChange={(e) => setDrillAnswer(e.target.value)}
                    placeholder="Enter your concise technical rationale..."
                    className="w-full p-2.5 rounded bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded bg-white text-[#0d1f18] font-semibold text-xs hover:bg-[#f6f3ed]"
                    >
                      Submit Defense
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsDrillActive(false); setDrillFeedback(null); }}
                      className="px-3 py-2 rounded bg-white/10 text-white text-xs hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                  {drillFeedback && (
                    <div className="p-3 rounded bg-white/10 text-xs text-[#eaddff] leading-relaxed mt-2 border border-white/20">
                      {drillFeedback}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Modal: Add or Edit Evidence */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e5e2dc] space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                <h3 className="font-headline-sm text-headline-sm text-[#0d1f18]">
                  {editingItem ? 'Edit Evidence Artifact' : 'Add New Portfolio Project'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-[#737874] hover:text-[#0d1f18]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveEvidence} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#0d1f18] uppercase">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Retail Sales Dashboard & KPI Model"
                    className="w-full p-2.5 rounded bg-[#fcf9f3] border border-[#c2c8c3] text-[#0d1f18] text-sm focus:outline-none focus:border-[#0d1f18]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#0d1f18] uppercase">Skill Vector</label>
                    <select
                      value={formSkill}
                      onChange={(e) => setFormSkill(e.target.value as SkillKey)}
                      className="w-full p-2.5 rounded bg-[#fcf9f3] border border-[#c2c8c3] text-[#0d1f18] focus:outline-none"
                    >
                      {roleDefinition.skills.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#0d1f18] uppercase">Artifact Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as EvidenceType)}
                      className="w-full p-2.5 rounded bg-[#fcf9f3] border border-[#c2c8c3] text-[#0d1f18] focus:outline-none"
                    >
                      <option value="Dashboard">Dashboard</option>
                      <option value="Project">Project</option>
                      <option value="GitHub Repository">GitHub Repository</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Case Study">Case Study</option>
                      <option value="Presentation">Presentation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0d1f18] uppercase">Description &amp; Key Methodology</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Explain the dataset, star-schema design, DAX measures, or SQL queries employed..."
                    className="w-full p-2.5 rounded bg-[#fcf9f3] border border-[#c2c8c3] text-[#0d1f18] focus:outline-none focus:border-[#0d1f18]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#0d1f18] uppercase">Repository / Demo Link</label>
                    <input
                      type="url"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full p-2.5 rounded bg-[#fcf9f3] border border-[#c2c8c3] text-[#0d1f18] focus:outline-none focus:border-[#0d1f18]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#0d1f18] uppercase">Verification Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded bg-[#fcf9f3] border border-[#c2c8c3] text-[#0d1f18] focus:outline-none"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Verified">Verified</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f1eee7]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded text-[#737874] hover:text-[#0d1f18]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded bg-[#0d1f18] text-white hover:bg-[#22382f] font-semibold"
                  >
                    {editingItem ? 'Save Changes' : 'Commit Evidence'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageTransition>

      <Footer />
    </div>
  );
};

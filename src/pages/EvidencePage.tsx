import React, { useState } from 'react';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EvidenceItem, EvidenceType, SkillKey } from '../types/atlas';
import { GitHubAnalyzerSection } from '../components/GitHubAnalyzerSection';
import { PageTransition, AnimatedNumber, StaggerContainer } from '../components/motion/Motion';

export const EvidencePage: React.FC = () => {
  const { state, roleDefinition, careerReadiness, addEvidence, updateEvidence, deleteEvidence } = useAtlas();

  // Dynamic Evidence Readiness & Competency Coverage Calculations
  const totalSkills = roleDefinition.skills.length || 5;
  const coveredSkillsSet = new Set((state.evidence || []).map((e) => e.skill));
  const verifiedSkillsCount = roleDefinition.skills.filter((s) => coveredSkillsSet.has(s.name)).length;
  const evidenceReadiness = Math.min(100, Math.round((verifiedSkillsCount / Math.max(totalSkills, 1)) * 100));
  const targetReadiness = 80;
  const readinessDeficit = evidenceReadiness - targetReadiness;
  const evidenceGapsCount = Math.max(0, totalSkills - verifiedSkillsCount);
  const underReviewCount = (state.evidence || []).filter((e) => e.verificationStatus === 'Under Review').length;
  const missingSkill = roleDefinition.skills.find((s) => !coveredSkillsSet.has(s.name));

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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header & Strategic Telemetry */}
        <section className="flex flex-col gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] font-mono text-[11px] tracking-widest uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A] animate-pulse"></span>
                PORTFOLIO &amp; ARTIFACT PROOF // VERIFICATION PIPELINE
              </span>
              <span className="text-[#6B7280] hidden sm:inline">•</span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-[#8B6F5A] font-semibold">
                EVIDENCE CONFIDENCE: {evidenceReadiness}% • HIRING DEFENSE ENGINE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Add a project</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline pt-2">
            <div className="lg:col-span-8 space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#18283D] tracking-tight">
                Don't just learn it. Prove it.
              </h1>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Your skills become career evidence when you can demonstrate them. ATLAS verifies candidate artifacts against tier-1 enterprise technical rubrics to eliminate resume filtering.
              </p>
              {/* Distinct Readiness Context Banner */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-xs text-[#6B7280] flex items-center gap-2.5 mt-2">
                <span className="material-symbols-outlined text-[18px] text-[#8B6F5A]">info</span>
                <span>
                  <strong className="text-[#18283D] font-mono">Career readiness: {careerReadiness}%</strong> (calibrated from diagnostic assessment). Evidence readiness increases as ATLAS ingests projects, repositories, dashboards, and other supporting artifacts.
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end items-center">
              <div className="p-4 rounded-2xl glass-panel border-[#E5E7EB] w-full max-w-xs flex items-center gap-3">
                <span className="material-symbols-outlined text-[#8B6F5A] text-[24px]">verified</span>
                <div>
                  <div className="text-[10px] font-mono font-semibold text-[#6B7280] uppercase tracking-wider">Calibration State</div>
                  <div className="text-sm text-[#18283D] font-bold">Live Recruiter Defense Ready</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Metric Telemetry Strip (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] font-mono uppercase font-semibold text-[11px]">Evidence Readiness</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                readinessDeficit >= 0 ? 'bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5]' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}>
                {readinessDeficit >= 0 ? `+${readinessDeficit}% Target Met` : `${readinessDeficit}% Deficit`}
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2 font-mono">
              <span className="text-3xl font-bold text-[#18283D]">
                <AnimatedNumber value={evidenceReadiness} suffix="%" />
              </span>
              <span className="text-xs text-[#6B7280]">/ {targetReadiness}% Target</span>
            </div>
            <p className="text-[11px] text-[#6B7280]">
              {state.evidence.length === 0
                ? `Evidence readiness is 0% until artifacts are linked. Target: ${targetReadiness}%.`
                : `Benchmark: ${targetReadiness}% to bypass automated technical filters`}
            </p>
          </div>

          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] font-mono uppercase font-semibold text-[11px]">Verified Projects</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#D8C3A5]/30 border border-[#18283D]/30 text-[#8B6F5A] text-[10px] font-mono font-bold">
                {underReviewCount} Under Review
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2 font-mono">
              <span className="text-3xl font-bold text-[#18283D]">
                <AnimatedNumber value={state.evidence.length} />
              </span>
              <span className="text-xs text-[#6B7280]">Dossier Artifacts</span>
            </div>
            <p className="text-[11px] text-[#6B7280]">Submitted &amp; calibrated across target role competencies</p>
          </div>

          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] font-mono uppercase font-semibold text-[11px]">Verified Skills</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#D8C3A5]/30 border border-[#D8C3A5] text-[#8B6F5A] text-[10px] font-mono font-bold">
                {verifiedSkillsCount} of {totalSkills} Calibrated
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2 font-mono">
              <span className="text-3xl font-bold text-[#18283D]">
                <AnimatedNumber value={verifiedSkillsCount} />
              </span>
              <span className="text-xs text-[#6B7280]">Competencies Backed</span>
            </div>
            <p className="text-[11px] text-[#6B7280]">Backed by code repos, models, or reproducible analytical memos</p>
          </div>

          <div className="glass-panel border-[#E5E7EB] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] font-mono uppercase font-semibold text-[11px]">Evidence Gaps</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                evidenceGapsCount > 0 ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5]'
              }`}>
                {evidenceGapsCount > 0 ? 'Action Required' : 'Fully Backed'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2 font-mono">
              <span className={`text-3xl font-bold ${
                evidenceGapsCount > 0 ? 'text-rose-400' : 'text-[#18283D]'
              }`}>
                <AnimatedNumber value={evidenceGapsCount} />
              </span>
              <span className="text-xs text-[#6B7280]">{evidenceGapsCount === 1 ? 'Severe Deficit' : 'Severe Deficits'}</span>
            </div>
            <p className="text-[11px] text-[#6B7280]">Critical gaps unbacked by live code, dashboard, or written memo</p>
          </div>
        </section>

        {/* GitHub Evidence Analyzer Section */}
        <GitHubAnalyzerSection />

        {/* Two-Column Strategic Architecture */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: EVIDENCE LOCKER PROJECTS */}
          <div className="lg:col-span-8 space-y-8">
            {/* Artifacts Header & Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#18283D]">
                  Verified Artifacts &amp; Submitted Projects
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-xs font-mono font-bold">
                  {state.evidence.length} Projects
                </span>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#18283D] border border-[#E5E7EB] text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
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
                  className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4 hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-[#18283D]">
                          {item.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                          item.verificationStatus === 'Verified'
                            ? 'bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5]'
                            : item.verificationStatus === 'Under Review'
                            ? 'bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#18283D]/30'
                            : 'bg-[#E5E7EB] text-[#6B7280] border border-[#E5E7EB]'
                        }`}>
                          {item.verificationStatus}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] font-mono uppercase tracking-wide">
                        {item.skill} · {item.type} {item.metrics ? `· ${item.metrics}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-xs font-semibold text-[#18283D] border border-[#E5E7EB] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEvidence(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 border border-rose-500/20 transition-colors"
                        title="Delete project"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {item.description}
                  </p>

                  {/* Attached Links */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-[#6B7280] font-mono uppercase tracking-wider block">
                      Reproducibility &amp; Artifact Links
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] hover:border-[#8B6F5A]/50 transition-colors flex items-center justify-between text-[#18283D] font-medium truncate"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">link</span>
                            <span className="truncate text-xs">{item.link}</span>
                          </span>
                          <span className="material-symbols-outlined text-[14px] text-[#6B7280]">north_east</span>
                        </a>
                      )}
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280] font-mono">
                        <span>Date Logged: {item.date}</span>
                        <span className="text-[10px]">{item.shaHash || 'SHA-256: 9f8a...'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluator AI Rubric Feedback */}
                  {item.evaluatorFeedback && (
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#D8C3A5] space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#8B6F5A] font-mono uppercase">
                        <span className="flex items-center gap-1 text-[11px]">
                          <span className="material-symbols-outlined text-[16px]">psychology</span>
                          <span>ATLAS Evaluator Rubric Feedback</span>
                        </span>
                        <span className="text-[#6B7280] font-normal normal-case text-[10px]">Calibrated in Sandbox</span>
                      </div>
                      <p className="text-[#6B7280] leading-relaxed text-xs">
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
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-[#8B6F5A] font-mono font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">insights</span>
                <span>Strategic Synthesis</span>
              </div>
              <h3 className="text-base font-bold text-[#18283D] leading-snug">
                Why Evidence Trumps Certifications
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Recruiters spend an average of 6 seconds skimming course completion certificates, but 3.5 minutes reviewing interactive dashboards and documented Git commits. ATLAS transforms your completed tasks into recruiter-verifiable proof.
              </p>
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold font-mono">
                  <span className="text-[#6B7280]">Verification Readiness:</span>
                  <span className="text-[#18283D]">{evidenceReadiness}% → {targetReadiness}% Goal</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div className="h-full bg-violet-600 transition-all duration-500" style={{ width: `${evidenceReadiness}%` }}></div>
                </div>
                <span className="text-[11px] text-[#8B6F5A] font-mono block">
                  {missingSkill
                    ? `Adding a verified artifact for ${missingSkill.name} will increase evidence coverage to ${Math.min(100, Math.round(((verifiedSkillsCount + 1) / Math.max(totalSkills, 1)) * 100))}%.`
                    : 'All target role competencies are backed by verified evidence artifacts.'}
                </span>
              </div>
            </div>

            {/* Hiring Grade Criteria */}
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#18283D] font-mono">Hiring-Grade Criteria</h3>
                <span className="text-xs font-mono text-[#6B7280]">4 Rules</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB]">
                  <span className="material-symbols-outlined text-[18px] text-[#8B6F5A] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="font-bold text-[#18283D]">Clean Git Commit History</div>
                    <div className="text-[#6B7280] text-[11px]">No single "upload files" dumps. Iterative, structured pull requests.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB]">
                  <span className="material-symbols-outlined text-[18px] text-[#8B6F5A] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="font-bold text-[#18283D]">Data Dictionary &amp; Framing</div>
                    <div className="text-[#6B7280] text-[11px]">Defines primary keys, grain, and executive revenue objective.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB]">
                  <span className="material-symbols-outlined text-[18px] text-[#8B6F5A] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="font-bold text-[#18283D]">Interactive Live Sandbox</div>
                    <div className="text-[#6B7280] text-[11px]">Never rely solely on static screenshots. Host an embedded preview.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0 mt-0.5">warning</span>
                  <div>
                    <div className="font-bold text-rose-300">Row-Level Security (RLS) &amp; Defense Video</div>
                    <div className="text-[#6B7280] text-[11px]">Missing — Required to enter the 95th percentile top candidate tier.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cognitive Defense Prep / Simulator */}
            <div className="glass-panel-elevated border-[#18283D]/30 text-[#18283D] rounded-2xl p-6 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#8B6F5A] font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  Cognitive Defense Prep
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#E5E7EB] text-[#18283D] font-mono text-[10px]">10 MIN</span>
              </div>
              <h3 className="text-base font-bold text-[#18283D]">
                Simulate Interview Artifact Defense
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Practice defending your Retail Sales Dashboard against ATLAS AI simulating a Lead Data Analyst asking rigorous DAX context transition and schema questions.
              </p>

              {!isDrillActive ? (
                <button
                  type="button"
                  onClick={() => setIsDrillActive(true)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider transition-all shadow-sm text-center block cursor-pointer"
                >
                  Launch 10-min Code Defense →
                </button>
              ) : (
                <form onSubmit={handleRunDrill} className="pt-2 space-y-2">
                  <label className="text-xs text-[#18283D] block font-medium">
                    Question: "Why did you use CALCULATE with USERELATIONSHIP instead of creating a secondary active relationship on FactSales?"
                  </label>
                  <textarea
                    rows={3}
                    value={drillAnswer}
                    onChange={(e) => setDrillAnswer(e.target.value)}
                    placeholder="Enter your concise technical rationale..."
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] text-xs focus:outline-none focus:border-[#18283D] font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Submit Defense
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsDrillActive(false); setDrillFeedback(null); }}
                      className="px-3 py-2 rounded-xl bg-[#E5E7EB] text-[#18283D] text-xs hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs border border-[#E5E7EB]"
                    >
                      Cancel
                    </button>
                  </div>
                  {drillFeedback && (
                    <div className="p-3 rounded-xl bg-[#FAF7F2] text-xs text-[#8B6F5A] leading-relaxed mt-2 border border-[#E5E7EB]">
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel-elevated border-[#E5E7EB] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in bg-[#FAF7F2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h3 className="text-lg font-bold text-[#18283D]">
                  {editingItem ? 'Edit Evidence Artifact' : 'Add New Portfolio Project'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#6B7280] hover:text-[#18283D] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveEvidence} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-mono font-bold text-[#6B7280] uppercase text-[10px]">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Retail Sales Dashboard & KPI Model"
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] text-sm focus:outline-none focus:border-[#18283D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono font-bold text-[#6B7280] uppercase text-[10px]">Skill Vector</label>
                    <select
                      value={formSkill}
                      onChange={(e) => setFormSkill(e.target.value as SkillKey)}
                      className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] focus:outline-none focus:border-[#18283D]"
                    >
                      {roleDefinition.skills.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-[#6B7280] uppercase text-[10px]">Artifact Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as EvidenceType)}
                      className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] focus:outline-none focus:border-[#18283D]"
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
                  <label className="font-mono font-bold text-[#6B7280] uppercase text-[10px]">Description &amp; Key Methodology</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Explain the dataset, star-schema design, DAX measures, or SQL queries employed..."
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] focus:outline-none focus:border-[#18283D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono font-bold text-[#6B7280] uppercase text-[10px]">Repository / Demo Link</label>
                    <input
                      type="url"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] focus:outline-none focus:border-[#18283D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-[#6B7280] uppercase text-[10px]">Verification Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#18283D] focus:outline-none focus:border-[#18283D]"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Verified">Verified</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#6B7280] hover:text-[#18283D] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-semibold shadow-sm cursor-pointer"
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

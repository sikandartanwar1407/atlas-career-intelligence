import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/motion/Motion';
import { useAtlas } from '../context/AtlasContext';
import {
  MLMatchingService,
  ParsedResumeResult,
  SemanticMatchResult,
  RecommendedPathwayResult,
} from '../services/mlMatchingService';

const SAMPLE_RESUMES = {
  fresher: `Sikandar Tanwar
sikandar.tanwar@example.com | +91 9876543210
B.Tech in Computer Science & Engineering (AI), 4th Year
ABES Institute of Technology, Ghaziabad

TECHNICAL SKILLS:
Languages & Frameworks: Python, PyTorch, Scikit-learn, SQL, PostgreSQL, FastAPI, JavaScript, HTML, CSS
Tools & Platforms: Git, GitHub, Docker, Linux, VS Code

PROJECTS:
1. ATLAS: Adaptive Technology for Learning and Advancement System
   - Full stack career intelligence architecture using React 19, FastAPI, and Supabase.
   - Built semantic Sentence-BERT matching algorithm to detect competency gaps.
2. Distributed Task Queue
   - Designed asynchronous worker pipeline with Redis and Python multiprocessing.`,
  frontend: `Shubh Goel
shubh.goel@example.com | +91 9123456789
B.Tech Computer Science, ABESIT Ghaziabad

TECHNICAL SKILLS:
React, TypeScript, Next.js, JavaScript, Tailwind CSS, HTML5, CSS3, Redux Toolkit, Vite, Jest, Git

PROJECTS:
1. Enterprise Design System & Interactive Dashboard in React
2. E-Commerce Storefront with Next.js Server Components and Stripe`,
};

const SAMPLE_JDS = {
  ai_engineer: `Full Stack AI & Machine Learning Engineer
Acme AI Solutions — San Francisco, CA / Remote

We are seeking a talented engineer to build production AI applications.
Responsibilities:
- Build high-performance REST APIs in Python using FastAPI or Django.
- Train, evaluate, and serve ML/NLP models using PyTorch, Hugging Face, or Scikit-learn.
- Design relational database schemas in PostgreSQL and manage migrations.
- Containerize and deploy services using Docker, Kubernetes, and automated CI/CD pipelines.
- Architect scalable distributed systems with caching (Redis) and cloud infrastructure (AWS).

Requirements:
- Strong knowledge of Python, SQL, PostgreSQL, and Git.
- Hands-on experience with Docker, Kubernetes, and CI/CD workflows.
- Understanding of System Design, microservices, and asynchronous event streams.
- Nice to have: React or TypeScript for internal monitoring dashboards.`,
  full_stack: `Full Stack Software Engineer
Vanguard Tech — Hybrid / Delhi NCR

Looking for a Full Stack Engineer to scale our core web architecture.
Required Competencies:
- React 19, TypeScript, and modern frontend component patterns.
- Backend proficiency in Node.js or Python (FastAPI/Express).
- PostgreSQL or MongoDB database management.
- Docker containerization and AWS cloud infrastructure.
- System Architecture, unit testing, and Git version control.`,
};

export const ResumeMatcherPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAtlas();

  // Inputs
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES.fresher);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JDS.ai_engineer);
  const [targetRole, setTargetRole] = useState(state?.targetRole || 'Machine Learning Engineer');

  // Loading states
  const [isParsing, setIsParsing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);

  // Results
  const [parsedProfile, setParsedProfile] = useState<ParsedResumeResult | null>(null);
  const [matchResult, setMatchResult] = useState<SemanticMatchResult | null>(null);
  const [pathwayResult, setPathwayResult] = useState<RecommendedPathwayResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsParsing(true);
    setStatusMessage(`Parsing document ${file.name}...`);
    const res = await MLMatchingService.parseResume(file);
    setIsParsing(false);
    if (res.success && res.data) {
      setParsedProfile(res.data);
      if (res.data.clean_text_preview) {
        setResumeText(res.data.clean_text_preview);
      }
      setStatusMessage(`Extracted ${res.data.detected_skills.length} skills from ${file.name}!`);
    }
  };

  const handleParseText = async () => {
    setIsParsing(true);
    setStatusMessage('Running NLP entity extraction on resume text...');
    const res = await MLMatchingService.parseResume(undefined, resumeText);
    setIsParsing(false);
    if (res.success && res.data) {
      setParsedProfile(res.data);
      setStatusMessage(`Extracted ${res.data.detected_skills.length} technical competencies!`);
    }
  };

  const handleRunSemanticMatch = async () => {
    setIsMatching(true);
    setStatusMessage('Encoding dense vector embeddings & computing Cosine Similarity (Sentence-BERT)...');

    const skills = parsedProfile?.detected_skills || [];
    const res = await MLMatchingService.compareJobDescription(skills, jobDescription, resumeText, targetRole);
    setIsMatching(false);
    if (res.success && res.data) {
      setMatchResult(res.data);
      setStatusMessage(`Semantic comparison complete! Score: ${res.data.match_percentage}% (${res.data.engine_used})`);
    }
  };

  const handleGeneratePathway = async () => {
    if (!matchResult || matchResult.missing_skills.length === 0) return;
    setIsRecommending(true);
    setStatusMessage('Vectorizing missing competencies & synthesizing 4-stage project milestones...');
    const res = await MLMatchingService.recommendPathway(matchResult.missing_skills, targetRole, 10);
    setIsRecommending(false);
    if (res.success && res.data) {
      setPathwayResult(res.data);
      setStatusMessage('Curated roadmap and custom project deliverables generated!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <PageTransition className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Editorial Title Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18283D]/10 text-[#18283D] text-xs font-mono font-semibold tracking-wide uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-[#8B6F5A] animate-pulse"></span>
              PS #16 · CareerMatch AI Machine Learning Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#18283D] tracking-tight">
              Resume & Job Skill Semantic Matcher
            </h1>
            <p className="text-sm text-[#6B7280] max-w-2xl mt-1">
              Extract competencies from unstructured resumes, compute vector embeddings against raw Job Descriptions with
              <span className="text-[#18283D] font-semibold"> Sentence-BERT</span>, and synthesize personalized action roadmaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/diagnosis"
              className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-semibold text-[#18283D] shadow-xs transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-[#18283D]/5 border border-[#18283D]/15 text-xs text-[#18283D] font-mono flex items-center justify-between">
            <span>{statusMessage}</span>
            <span className="text-[10px] text-[#6B7280]">AI Subsystem Active</span>
          </div>
        )}

        {/* Input Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Candidate Resume */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#18283D]">1. Candidate Resume</h2>
                <p className="text-xs text-[#6B7280]">Upload PDF/DOCX or edit text directly</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResumeText(SAMPLE_RESUMES.fresher);
                    setParsedProfile(null);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#E5E7EB] hover:bg-gray-50 text-[#18283D]"
                >
                  Load Sikandar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResumeText(SAMPLE_RESUMES.frontend);
                    setParsedProfile(null);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#E5E7EB] hover:bg-gray-50 text-[#18283D]"
                >
                  Load Shubh
                </button>
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 text-center hover:border-[#18283D]/40 transition-colors bg-[#FAF7F2]/40">
              <label className="cursor-pointer flex flex-col items-center gap-1.5">
                <span className="text-2xl">📄</span>
                <span className="text-xs font-semibold text-[#18283D]">
                  {selectedFile ? selectedFile.name : 'Upload Resume (.PDF, .DOCX, .TXT)'}
                </span>
                <span className="text-[11px] text-[#6B7280]">Drag and drop or click to browse</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Resume Text Editor */}
            <div className="flex-1 flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-[#18283D]">Resume Text Content:</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="w-full text-xs font-mono p-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#18283D]/20 bg-[#FAF7F2]/20 resize-none text-[#18283D]"
                placeholder="Paste candidate resume text here..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleParseText}
                disabled={isParsing}
                className="w-full py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {isParsing ? 'Extracting with NLP...' : '⚡ Extract Skills with NLP (Model 1)'}
              </button>
            </div>

            {/* Extracted Skills Pills */}
            {parsedProfile && (
              <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#18283D]">
                    {parsedProfile.full_name} ({parsedProfile.degree}, {parsedProfile.year})
                  </span>
                  <span className="text-xs font-mono text-[#8B6F5A]">
                    {parsedProfile.detected_skills.length} Skills Detected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedProfile.detected_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-[#18283D]/10 text-[#18283D] text-[11px] font-mono font-medium border border-[#18283D]/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Target Job Description */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#18283D]">2. Target Job Description</h2>
                <p className="text-xs text-[#6B7280]">Paste requisition from LinkedIn / Indeed / Internshala</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJobDescription(SAMPLE_JDS.ai_engineer)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#E5E7EB] hover:bg-gray-50 text-[#18283D]"
                >
                  AI Engineer JD
                </button>
                <button
                  type="button"
                  onClick={() => setJobDescription(SAMPLE_JDS.full_stack)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#E5E7EB] hover:bg-gray-50 text-[#18283D]"
                >
                  Full Stack JD
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#18283D]">Target Career Track:</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] font-medium text-[#18283D]"
                placeholder="e.g. Machine Learning Engineer"
              />
            </div>

            <div className="flex-1 flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-[#18283D]">Job Description Text:</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={13}
                className="w-full text-xs font-mono p-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#18283D]/20 bg-[#FAF7F2]/20 resize-none text-[#18283D]"
                placeholder="Paste job description requirements here..."
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunSemanticMatch}
                disabled={isMatching}
                className="w-full py-2.5 rounded-xl bg-[#8B6F5A] hover:bg-[#725946] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {isMatching ? 'Computing Cosine Similarity...' : '🚀 Run Semantic Matcher (Sentence-BERT)'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {matchResult && (
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B6F5A] font-semibold">
                  NLP Comparison Analysis Complete
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#18283D]">
                  Competency Gap & Semantic Alignment
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Engine: <span className="font-mono text-[#18283D] font-semibold">{matchResult.engine_used}</span> ·{' '}
                  {matchResult.total_requirements_analyzed} Requisition Criteria Analyzed
                </p>
              </div>

              {/* Match Score Gauge */}
              <div className="flex items-center gap-4 bg-[#FAF7F2] px-6 py-3 rounded-2xl border border-[#E5E7EB]">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#6B7280]">Semantic Fit</span>
                  <div className="text-3xl font-serif font-bold text-[#18283D]">
                    {matchResult.match_percentage}%
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-[#18283D] border-t-[#8B6F5A] flex items-center justify-center text-xs font-bold text-[#18283D]">
                  {matchResult.match_percentage}%
                </div>
              </div>
            </div>

            {/* 3 Categories of Match */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Direct Matches */}
              <div className="bg-[#FAF7F2]/50 p-4 rounded-xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Direct Matches ({matchResult.direct_matches.length})
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Demonstrated
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Explicitly matched in resume credentials.</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {matchResult.direct_matches.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-emerald-100/70 text-emerald-900 rounded text-[11px] font-medium border border-emerald-200"
                    >
                      {s}
                    </span>
                  ))}
                  {matchResult.direct_matches.length === 0 && (
                    <span className="text-xs text-[#9CA3AF] italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Semantic Matches */}
              <div className="bg-[#FAF7F2]/50 p-4 rounded-xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Semantic Matches ({matchResult.semantic_matches.length})
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Cosine &gt; 0.60
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Implicit conceptual alignment detected.</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {matchResult.semantic_matches.map((s) => (
                    <span
                      key={s.skill}
                      className="px-2 py-0.5 bg-indigo-100/70 text-indigo-900 rounded text-[11px] font-medium border border-indigo-200"
                      title={s.note}
                    >
                      {s.skill} ({Math.round(s.similarity * 100)}%)
                    </span>
                  ))}
                  {matchResult.semantic_matches.length === 0 && (
                    <span className="text-xs text-[#9CA3AF] italic">No latent matches</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-[#FAF7F2]/50 p-4 rounded-xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Missing Competencies ({matchResult.missing_skills.length})
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Demanded by JD but absent in resume.</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {matchResult.missing_skills.map((s) => (
                    <span
                      key={s.skill}
                      className="px-2 py-0.5 bg-amber-100/70 text-amber-900 rounded text-[11px] font-medium border border-amber-200"
                    >
                      {s.skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action CTA to Generate Recommender Pathway */}
            {matchResult.missing_skills.length > 0 && !pathwayResult && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleGeneratePathway}
                  disabled={isRecommending}
                  className="px-6 py-3 rounded-xl bg-[#18283D] hover:bg-[#223752] text-white text-xs font-semibold shadow-md transition-all inline-flex items-center gap-2"
                >
                  {isRecommending
                    ? 'Recommending Pathway with Content-Based Recommender...'
                    : '🎯 Synthesize Learning Pathway & Custom Projects (Model 3) →'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Pathway Recommendation Output */}
        {pathwayResult && (
          <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-[#E5E7EB]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B6F5A] font-semibold">
                Model 3 · Content-Based Recommendation Engine
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#18283D]">
                Personalized Learning Pathway & Custom Project Specifications
              </h3>
              <p className="text-xs text-[#6B7280]">{pathwayResult.summary}</p>
            </div>

            {/* Milestone Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pathwayResult.milestones.map((m) => (
                <div
                  key={m.step_number}
                  className="p-5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2]/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#18283D]">
                      Step {m.step_number}: {m.skill}
                    </span>
                    <span className="text-[10px] font-mono bg-[#18283D]/10 text-[#18283D] px-2 py-0.5 rounded-full font-semibold">
                      {m.allocated_hours_per_week} hrs/wk · {m.estimated_duration}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B7280]">{m.focus_area}</p>

                  <div className="space-y-1.5 pt-1">
                    {m.actions.map((act) => (
                      <div
                        key={act.stage}
                        className="text-[11px] p-2 bg-white rounded-lg border border-[#E5E7EB] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] ${
                              act.stage === 'Learn'
                                ? 'bg-blue-100 text-blue-800'
                                : act.stage === 'Practice'
                                ? 'bg-purple-100 text-purple-800'
                                : act.stage === 'Build'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {act.stage[0]}
                          </span>
                          <span className="font-medium text-[#18283D]">{act.title}</span>
                        </div>
                        <span className="text-[10px] text-[#9CA3AF] font-mono">{act.estimated_minutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Project Specifications */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <h4 className="text-sm font-bold text-[#18283D]">
                Recommended Portfolio Deliverables (For ATLAS Evidence Locker):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pathwayResult.custom_projects.map((proj) => (
                  <div key={proj.skill} className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#18283D]">{proj.project_title}</span>
                      <span className="text-[10px] font-mono text-[#8B6F5A]">{proj.recommended_hours} hrs</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">{proj.target_deliverable}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-2">
              <Link
                to="/career-roadmap"
                className="px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-2"
              >
                View Full Interactive Career Roadmap →
              </Link>
            </div>
          </section>
        )}
      </PageTransition>

      <Footer />
    </div>
  );
};


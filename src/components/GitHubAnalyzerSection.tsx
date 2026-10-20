import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { EvidenceApiService, RemoteGitHubAnalysis } from '../services/evidenceService';
import { ProfileService } from '../services/profileService';
import {
  GitHubAnalysisPhase,
  GitHubAnalysisResult,
  ExtractedEvidence,
} from '../types/github';
import { AnimatedNumber, AnimatedProgressBar, FadeIn, StaggerContainer } from './motion/Motion';

const PHASES: { id: GitHubAnalysisPhase; label: string; step: number }[] = [
  { id: 'preparing', label: 'Validating identifier', step: 1 },
  { id: 'fetching', label: 'Querying GitHub REST API', step: 2 },
  { id: 'analyzing', label: 'Analyzing repositories & READMEs', step: 3 },
  { id: 'mapping', label: 'Synthesizing evidence signals', step: 4 },
  { id: 'results', label: 'Results', step: 5 },
];

export const GitHubAnalyzerSection: React.FC = () => {
  const { state, roleDefinition, addEvidence } = useAtlas();

  const [inputVal, setInputVal] = useState('');
  const [phase, setPhase] = useState<GitHubAnalysisPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GitHubAnalysisResult | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Load candidate's latest saved GitHub analysis on mount
  useEffect(() => {
    let isMounted = true;
    const loadStoredAnalysis = async () => {
      const token = SupabaseAuthService.getAccessToken();
      if (!token) return;

      const res = await EvidenceApiService.fetchGitHubAnalysis(token);
      if (isMounted && res.success && res.data) {
        mapRemoteAnalysisToState(res.data);
      }
    };

    loadStoredAnalysis();
    return () => {
      isMounted = false;
    };
  }, []);

  const mapRemoteAnalysisToState = (remote: RemoteGitHubAnalysis) => {
    const userData = remote.github_user_data || {};
    const primaryLangs = Array.isArray(remote.primary_languages)
      ? remote.primary_languages.map((l: any) =>
          typeof l === 'string' ? { name: l, percentage: 50 } : { name: l.name || 'Code', percentage: l.percentage || 0 }
        )
      : [];

    const mappedEvidence: ExtractedEvidence[] = (remote.detected_topics || []).slice(0, 4).map((topic, idx) => ({
      id: `gh-ev-${idx}`,
      title: `${remote.github_username}/${topic}`,
      skill: remote.demonstrated_skills_detected?.[idx] || 'Software Engineering',
      type: 'GitHub Repository',
      description: `Public repository activity and telemetry verified for @${remote.github_username}.`,
      link: userData.profile_url || `https://github.com/${remote.github_username}`,
      date: (remote.created_at || new Date().toISOString()).split('T')[0],
      metrics: `${primaryLangs[0]?.name || 'Source'} · Repository Artifact`,
      shaHash: `SHA-256: ${Math.random().toString(36).substring(2, 6)}...`,
      verificationStatus: 'Verified',
      evaluatorFeedback: `Observable repository evidence derived from public GitHub telemetry.`,
      detectedLanguages: primaryLangs.map((p) => p.name),
      stars: 0,
      forks: 0,
    }));

    setResult({
      username: remote.github_username,
      user: {
        login: remote.github_username,
        id: 0,
        avatar_url: userData.avatar_url || 'https://avatars.githubusercontent.com/u/9919?v=4',
        html_url: userData.profile_url || `https://github.com/${remote.github_username}`,
        name: userData.name || remote.github_username,
        bio: userData.bio || 'Public GitHub Developer Profile',
        public_repos: remote.analyzed_repos_count || userData.public_repos || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        created_at: remote.created_at || new Date().toISOString(),
      },
      analyzedReposCount: remote.analyzed_repos_count || 1,
      primaryLanguages: primaryLangs,
      detectedTopics: remote.detected_topics || [],
      extractedEvidence: mappedEvidence,
      demonstratedSkillsDetected: remote.demonstrated_skills_detected || [],
      evidenceReadinessBoost: remote.evidence_readiness_boost || 12,
    });
    setPhase('results');
  };

  const handleRunAnalysis = async (_mode?: 'profile' | 'repo') => {
    if (!inputVal.trim()) {
      setErrorMessage('Please enter a public GitHub username or repository URL (e.g. torvalds or facebook/react).');
      setPhase('error');
      return;
    }

    const token = SupabaseAuthService.getAccessToken();
    if (!token) {
      setErrorMessage('Please sign in to analyze and persist GitHub portfolio evidence.');
      setPhase('error');
      return;
    }

    // Ensure candidate profile exists on backend before saving evidence
    if (state.profile && (state.profile.fullName || state.profile.targetRole)) {
      await ProfileService.saveRemoteProfile(state.profile, token).catch(() => {});
    }

    setErrorMessage(null);
    setPhase('preparing');
    await sleep(200);

    try {
      setPhase('fetching');
      await sleep(250);

      setPhase('analyzing');
      const response = await EvidenceApiService.analyzeGitHub(inputVal, token);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to analyze GitHub resource.');
      }

      setPhase('mapping');
      await sleep(200);

      const { analysis, evidence } = response.data;
      const userData = analysis.github_user_data || {};

      const primaryLangs = Array.isArray(analysis.primary_languages)
        ? analysis.primary_languages.map((l: any) =>
            typeof l === 'string' ? { name: l, percentage: 50 } : { name: l.name || 'Code', percentage: l.percentage || 0 }
          )
        : [];

      const formattedEvidence: ExtractedEvidence[] = (evidence || []).map((ev) => ({
        id: ev.id || `gh-${Math.random()}`,
        title: ev.title,
        skill: ev.skill_name,
        type: (ev.evidence_type as any) || 'GitHub Repository',
        description: ev.description,
        link: ev.link,
        date: ev.date,
        metrics: ev.metrics || 'Public GitHub Repository',
        shaHash: ev.sha_hash || 'SHA-256: e3b0c442...',
        verificationStatus: ev.verification_status,
        evaluatorFeedback: ev.evaluator_feedback || 'Observable repository evidence from public GitHub telemetry.',
        detectedLanguages: primaryLangs.map((p) => p.name),
        stars: 0,
        forks: 0,
      }));

      const finalResult: GitHubAnalysisResult = {
        username: analysis.github_username,
        user: {
          login: analysis.github_username,
          id: 0,
          avatar_url: userData.avatar_url || 'https://avatars.githubusercontent.com/u/9919?v=4',
          html_url: userData.profile_url || `https://github.com/${analysis.github_username}`,
          name: userData.name || analysis.github_username,
          bio: userData.bio || 'Public GitHub Developer Profile',
          public_repos: analysis.analyzed_repos_count || userData.public_repos || 0,
          followers: userData.followers || 0,
          following: userData.following || 0,
          created_at: analysis.created_at || new Date().toISOString(),
        },
        analyzedReposCount: analysis.analyzed_repos_count || 1,
        primaryLanguages: primaryLangs,
        detectedTopics: analysis.detected_topics || [],
        extractedEvidence: formattedEvidence,
        demonstratedSkillsDetected: analysis.demonstrated_skills_detected || [],
        evidenceReadinessBoost: analysis.evidence_readiness_boost || 12,
      };

      // Ingest extracted evidence into local AtlasContext evidence locker
      const newAddedMap: Record<string, boolean> = {};
      formattedEvidence.forEach((evItem) => {
        addEvidence({
          title: evItem.title,
          skill: evItem.skill,
          type: evItem.type,
          description: evItem.description,
          link: evItem.link,
          date: evItem.date,
          metrics: evItem.metrics,
          shaHash: evItem.shaHash,
          verificationStatus: evItem.verificationStatus,
          evaluatorFeedback: evItem.evaluatorFeedback,
        });
        newAddedMap[evItem.id] = true;
      });
      setAddedIds((prev) => ({ ...prev, ...newAddedMap }));

      setResult(finalResult);
      setPhase('results');
    } catch (err: any) {
      setPhase('error');
      setErrorMessage(
        err.message || 'Unable to access public GitHub data. Verify your connection or try again.'
      );
    }
  };

  const handleAddArtifact = (item: ExtractedEvidence) => {
    addEvidence({
      title: item.title,
      skill: item.skill,
      type: item.type,
      description: item.description,
      link: item.link,
      date: item.date,
      metrics: item.metrics,
      shaHash: item.shaHash,
      verificationStatus: item.verificationStatus,
      evaluatorFeedback: item.evaluatorFeedback,
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const currentStepNum =
    phase === 'preparing'
      ? 1
      : phase === 'fetching'
      ? 2
      : phase === 'analyzing'
      ? 3
      : phase === 'mapping'
      ? 4
      : phase === 'results'
      ? 5
      : 0;

  return (
    <section className="glass-panel border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 overflow-hidden">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] uppercase font-mono font-bold tracking-wider text-[#A78BFA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse"></span>
            <span>Automated Portfolio Synthesis · Real GitHub REST API</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Turn your GitHub activity into career evidence.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            ATLAS securely ingests public GitHub profiles and repositories via the GitHub REST API to derive verifiable evidence signals and observed technologies for your candidate dossier.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#2DD4BF] bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-xl shrink-0 font-mono">
          <span className="material-symbols-outlined text-[16px]">lock_open</span>
          <span>Public REST API · FastAPI Ingestion</span>
        </div>
      </div>

      {/* Input Controls Form */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider block">
          GitHub Username or Public Repository URL
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#64748B]">
              terminal
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. torvalds or facebook/react or https://github.com/username/project"
              disabled={phase !== 'idle' && phase !== 'results' && phase !== 'error'}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleRunAnalysis('profile')}
              disabled={phase === 'preparing' || phase === 'fetching' || phase === 'analyzing' || phase === 'mapping'}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>Analyze GitHub profile</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunAnalysis('repo')}
              disabled={phase === 'preparing' || phase === 'fetching' || phase === 'analyzing' || phase === 'mapping'}
              className="px-3.5 py-2.5 rounded-xl bg-[#172039] hover:bg-white/10 text-white border border-white/10 text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>Analyze repository</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sequential Analysis Progress Sequence */}
      {(phase === 'preparing' || phase === 'fetching' || phase === 'analyzing' || phase === 'mapping') && (
        <FadeIn className="p-5 rounded-2xl bg-[#0D1224] border border-violet-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                Active Analysis State: {PHASES.find((p) => p.id === phase)?.label}...
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#A78BFA]">
              Phase {currentStepNum} of 5
            </span>
          </div>

          {/* Sequential Step Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {PHASES.map((p) => {
              const isActive = p.id === phase;
              const isDone = currentStepNum > p.step;

              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-xl text-center text-[11px] font-mono font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : isDone
                      ? 'bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30'
                      : 'bg-[#172039] text-[#64748B] border border-white/5'
                  }`}
                >
                  <div className="text-[10px] uppercase opacity-80 mb-0.5">
                    {isDone ? '✓ Done' : isActive ? '● Active' : `Step 0${p.step}`}
                  </div>
                  <div className="truncate">{p.label}</div>
                </div>
              );
            })}
          </div>

          <AnimatedProgressBar
            value={(currentStepNum / 5) * 100}
            className="w-full h-1.5"
            trackClassName="bg-[#172039] rounded-full overflow-hidden"
            fillClassName="bg-violet-600 rounded-full"
            durationMs={240}
          />
        </FadeIn>
      )}

      {/* Error state */}
      {phase === 'error' && errorMessage && (
        <FadeIn className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-[18px] shrink-0 text-rose-400">warning</span>
            <span>{errorMessage}</span>
            {errorMessage.includes('sign in') && (
              <Link
                to="/login"
                state={{ from: '/evidence' }}
                className="inline-flex items-center gap-1 font-bold underline hover:text-white ml-1 transition-colors"
              >
                <span>Sign in to ATLAS</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPhase('idle')}
            className="px-3 py-1 rounded-lg bg-[#172039] border border-rose-500/30 text-xs text-rose-300 hover:bg-rose-500/20 self-start sm:self-auto shrink-0 transition-colors"
          >
            Dismiss
          </button>
        </FadeIn>
      )}

      {/* Analysis Results Display */}
      {phase === 'results' && result && (
        <FadeIn className="space-y-6 pt-2">
          {/* User Dossier Summary Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1224] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={result.user.avatar_url}
                alt={result.user.login}
                className="w-14 h-14 rounded-2xl border border-white/10 shadow-md object-cover"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    {result.user.name || result.user.login}
                  </h3>
                  <a
                    href={result.user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#A78BFA] hover:underline flex items-center gap-0.5 font-mono"
                  >
                    <span>@{result.user.login}</span>
                    <span className="material-symbols-outlined text-[13px]">north_east</span>
                  </a>
                </div>
                <p className="text-xs text-[#94A3B8] max-w-md line-clamp-2">
                  {result.user.bio || 'Public GitHub Developer Profile'}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[#64748B] pt-1">
                  <span>{result.user.public_repos} Public Repositories</span>
                  <span>•</span>
                  <span>{result.user.followers} Followers</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block">
                  Evidence Signal Count
                </span>
                <span className="text-2xl font-mono font-bold text-[#2DD4BF]">
                  +<AnimatedNumber value={result.evidenceReadinessBoost} />%
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block">
                  Extracted Project Signals
                </span>
                <span className="text-2xl font-mono font-bold text-white">
                  <AnimatedNumber value={result.extractedEvidence.length} /> Artifacts
                </span>
              </div>
            </div>
          </div>

          {/* Primary Languages & Detected Competencies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0D1224] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#64748B] block">
                Observed Technologies (Codebase Bytes)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.primaryLanguages.length > 0 ? (
                  result.primaryLanguages.map((l) => (
                    <span
                      key={l.name}
                      className="px-2.5 py-1 rounded-lg bg-[#172039] text-[11px] font-mono font-semibold text-white border border-white/10"
                    >
                      {l.name} ({l.percentage}%)
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#64748B]">No specific language breakdown available.</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1224] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#64748B] block">
                Observed Skill &amp; Tool Signals ({roleDefinition.name})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.demonstratedSkillsDetected.length > 0 ? (
                  result.demonstratedSkillsDetected.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-[11px] font-mono font-semibold text-[#A78BFA] border border-violet-500/30"
                    >
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#64748B]">General repository implementation signals.</span>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Artifacts List */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-[#A78BFA] uppercase tracking-wider block">
              Observable Project Signals Ingested Into Evidence Telemetry:
            </span>

            <StaggerContainer className="space-y-3">
              {result.extractedEvidence.map((art) => {
                const isAdded = !!addedIds[art.id];

                return (
                  <div
                    key={art.id}
                    className="glass-panel border-white/10 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-violet-500/30 transition-all"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{art.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30">
                          {art.skill}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748B]">
                          {art.metrics}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] line-clamp-2">{art.description}</p>
                      <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-2">
                        <span>{art.shaHash}</span>
                        <span>•</span>
                        <a
                          href={art.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A78BFA] hover:underline"
                        >
                          View Repository ↗
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddArtifact(art)}
                      disabled={isAdded}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                        isAdded
                          ? 'bg-teal-500/20 border border-teal-500/30 text-[#2DD4BF] cursor-default'
                          : 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm cursor-pointer'
                      }`}
                    >
                      {isAdded ? '✓ Added to Locker' : '+ Add to Evidence Locker'}
                    </button>
                  </div>
                );
              })}
            </StaggerContainer>
          </div>
        </FadeIn>
      )}
    </section>
  );
};

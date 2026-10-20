import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  getOpportunities,
  calculateOpportunityMatch,
  getCandidateVisibility,
  saveCandidateVisibility,
  hasExpressedInterest,
} from '../data/opportunities';
import { CandidateVisibilitySettings } from '../types/opportunities';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { VisibilityApiService } from '../services/visibilityService';

export const OpportunitiesPage: React.FC = () => {
  const { state, hasProfile, careerReadiness, skillGaps } = useAtlas();

  // Load candidate visibility settings
  const [visibility, setVisibility] = useState<CandidateVisibilitySettings>(getCandidateVisibility);
  const [visibilitySavedToast, setVisibilitySavedToast] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'remote' | 'target'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch persisted remote visibility settings on mount if authenticated
  useEffect(() => {
    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      VisibilityApiService.getVisibilitySettings(token).then((res) => {
        if (res.success && res.data) {
          setVisibility(res.data);
          saveCandidateVisibility(res.data);
        }
      });
    }
  }, []);

  // Build candidate skills dictionary from state
  const candidateSkillsDict = useMemo(() => {
    const dict: Record<string, number> = {};
    if (state.selfRatings) {
      Object.entries(state.selfRatings).forEach(([k, v]) => {
        dict[k] = v;
      });
    }
    // Also include assessed skill gaps values
    skillGaps.forEach((g) => {
      dict[g.skill] = g.demonstrated;
      dict[g.displayName] = g.demonstrated;
    });
    return dict;
  }, [state.selfRatings, skillGaps]);

  const targetRole = state.targetRole || 'Data Analyst';

  // Extract candidate top demonstrated skills for display context
  const demonstratedSkillsList = useMemo(() => {
    if (skillGaps.length > 0) {
      return skillGaps.map((s) => s.displayName).slice(0, 4);
    }
    return ['SQL', 'Power BI', 'Excel', 'Data Storytelling'];
  }, [skillGaps]);

  // Compute matches for all opportunities
  const opportunities = useMemo(() => {
    const rawList = getOpportunities();
    return rawList.map((opp) => {
      const match = calculateOpportunityMatch(
        state.profile,
        candidateSkillsDict,
        state.evidence,
        opp
      );
      const isInterested = hasExpressedInterest(opp.id);
      return {
        ...opp,
        match,
        isInterested,
      };
    });
  }, [state.profile, candidateSkillsDict, state.evidence]);

  // Filtered list
  const filteredOpportunities = useMemo(() => {
    let list = opportunities;

    if (activeFilter === 'high') {
      list = list.filter((item) => item.match.overallMatch >= 80);
    } else if (activeFilter === 'remote') {
      list = list.filter((item) => item.location.toLowerCase().includes('remote'));
    } else if (activeFilter === 'target') {
      list = list.filter(
        (item) =>
          item.targetRoleCategory.toLowerCase().includes(targetRole.toLowerCase()) ||
          targetRole.toLowerCase().includes(item.targetRoleCategory.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.jobTitle.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.requirements.some((r) => r.skill.toLowerCase().includes(q))
      );
    }

    // Sort by overall match descending
    return [...list].sort((a, b) => b.match.overallMatch - a.match.overallMatch);
  }, [opportunities, activeFilter, searchQuery, targetRole]);

  const handleToggleVisibility = (key: keyof CandidateVisibilitySettings) => {
    const updated = {
      ...visibility,
      [key]: !visibility[key],
    };
    setVisibility(updated);
    saveCandidateVisibility(updated);
    setVisibilitySavedToast(true);
    setTimeout(() => setVisibilitySavedToast(false), 2200);

    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      VisibilityApiService.updateVisibilitySettings({ [key]: updated[key] }, token);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9]">
      <Header />

      <main className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex flex-col max-w-3xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#A78BFA] font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
              Demonstrated Capability · Opportunity Matching
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Opportunities matched to you.
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] mt-1.5 leading-relaxed">
              ATLAS connects your demonstrated capabilities and career direction with opportunities that fit your current empirical profile.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer"
              className="px-4 py-2.5 rounded-xl bg-[#0D1224] hover:bg-[#172039] text-white font-mono text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/10 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#A78BFA]">corporate_fare</span>
              <span>Employer Portal</span>
            </Link>
          </div>
        </section>

        {/* Dynamic Candidate Context Bar */}
        <section className="glass-panel border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block font-semibold">
                  Target Role
                </span>
                <span className="text-base text-white font-bold">
                  {targetRole}
                </span>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block font-semibold">
                  Calibrated Readiness
                </span>
                <span className="font-mono text-base font-bold text-[#2DD4BF]">
                  {hasProfile ? `${careerReadiness}%` : '68% (Baseline)'}
                </span>
              </div>

              <div className="h-8 w-px bg-white/10 hidden md:block"></div>

              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block font-semibold">
                  Active Demonstrations
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {demonstratedSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-lg bg-[#0D1224] border border-white/10 text-[11px] font-mono text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#64748B] font-mono">
                Evidence in locker:{' '}
                <strong className="text-white">
                  {state.evidence.length > 0 ? `${state.evidence.length} items` : '3 verified items'}
                </strong>
              </span>
              <Link
                to="/evidence"
                className="text-xs font-mono text-[#A78BFA] font-semibold hover:text-white transition-colors"
              >
                Manage Evidence →
              </Link>
            </div>
          </div>
        </section>

        {/* 2-Column Workspace: Left = Opportunities List, Right = Candidate Visibility Settings */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Opportunities Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-panel border-white/10 p-2 rounded-2xl bg-[#0D1224]/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-[#94A3B8] hover:bg-white/5'
                  }`}
                >
                  All Matches ({opportunities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('high')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'high'
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'text-[#94A3B8] hover:bg-white/5'
                  }`}
                >
                  Strong Alignment (≥80%)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('target')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'target'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-[#94A3B8] hover:bg-white/5'
                  }`}
                >
                  Target Role ({targetRole})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('remote')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === 'remote'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-[#94A3B8] hover:bg-white/5'
                  }`}
                >
                  Remote Only
                </button>
              </div>

              <div className="relative shrink-0">
                <input
                  type="text"
                  placeholder="Filter by skill, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-[#11182B] text-white border border-white/10 rounded-xl focus:outline-none focus:border-violet-500 placeholder-[#64748B] transition-colors"
                />
                <span className="material-symbols-outlined text-[16px] text-[#64748B] absolute left-2.5 top-2">
                  search
                </span>
              </div>
            </div>

            {/* Opportunities List */}
            {filteredOpportunities.length === 0 ? (
              <div className="glass-panel border-white/10 rounded-2xl p-10 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#64748B]">search_off</span>
                <h3 className="text-lg font-bold text-white">No opportunities matched your filter</h3>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                  Try clearing your search query or reset the filter tabs to view all available roles in the catalogue.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map((opp) => {
                  const { match, isInterested } = opp;
                  return (
                    <article
                      key={opp.id}
                      className="glass-panel border-white/10 rounded-2xl p-6 shadow-xl hover:border-violet-500/40 transition-all relative flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Card Top: Match % badge, Job Title, Company, Location */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Match Percentage Pill */}
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-bold text-[#A78BFA] font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span>
                                {match.overallMatch}% MATCH
                              </span>
                              <span className="text-[11px] text-[#64748B] font-mono font-medium uppercase tracking-wider">
                                {match.compatibilityLabel}
                              </span>
                              {isInterested && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30 text-[10px] font-mono font-bold">
                                  ✓ Interest Shared
                                </span>
                              )}
                            </div>

                            <h2 className="text-xl text-white font-bold tracking-tight pt-1">
                              {opp.jobTitle}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8]">
                              <span className="font-semibold text-white">{opp.company}</span>
                              <span className="text-white/20">•</span>
                              <span>{opp.location}</span>
                              <span className="text-white/20">•</span>
                              <span>{opp.employmentType}</span>
                              {opp.salaryRange && (
                                <>
                                  <span className="text-white/20">•</span>
                                  <span className="font-mono text-[#2DD4BF] font-semibold">{opp.salaryRange}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-mono text-[#64748B] block">
                              Posted {opp.postedDate}
                            </span>
                          </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {opp.shortDescription}
                        </p>

                        {/* Breakdown: Matched vs Development Area */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                          {/* Matched Skills */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-white font-bold block">
                              Matched Capabilities:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {match.matchedRequirements.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-[#2DD4BF] font-mono"
                                >
                                  <span>✓</span>
                                  {skill}
                                </span>
                              ))}
                              {match.evidenceMatches.some((e) => e.hasEvidence) && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-[#2DD4BF] font-mono">
                                  <span>✓</span>
                                  Portfolio Evidence
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Development Areas */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#A78BFA] font-bold block">
                              Development Gap:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {match.developmentGaps.length > 0 ? (
                                match.developmentGaps.slice(0, 2).map((gap) => (
                                  <span
                                    key={gap.skill}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 font-mono"
                                  >
                                    <span>△</span>
                                    {gap.skill} (-{gap.deficit}%)
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-[#2DD4BF] font-mono font-medium">
                                  ✓ All core requirements met
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: View Opportunity Action */}
                      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-[#64748B] font-mono italic">
                          Empirical match calibrated against your active dossier
                        </span>
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>View opportunity</span>
                          <span className="text-sm">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Rail: Candidate Career Visibility & Matching Insights (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Candidate Visibility Control Card */}
            <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#A78BFA] uppercase tracking-widest font-bold block">
                    Privacy Controls
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    Career Visibility
                  </h2>
                </div>
                <span className="material-symbols-outlined text-[#A78BFA] text-xl">
                  shield_person
                </span>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Candidate data is private by default. Control exactly what matched employers can discover from your ATLAS profile.
              </p>

              {visibilitySavedToast && (
                <div className="px-3 py-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-[#2DD4BF] text-xs font-mono font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <span>✓</span>
                  <span>Visibility preferences updated</span>
                </div>
              )}

              <div className="space-y-3.5 pt-1">
                {/* Toggle 1: Discover profile */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={visibility.allowDiscover}
                    onChange={() => handleToggleVisibility('allowDiscover')}
                    className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer accent-violet-600"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block group-hover:text-[#A78BFA] transition-colors">
                      Allow employers to discover my profile
                    </span>
                    <span className="text-[11px] text-[#64748B] leading-tight block">
                      Permits hiring teams to view your anonymized candidate card.
                    </span>
                  </div>
                </label>

                {/* Toggle 2: Allow contact */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={visibility.allowContact}
                    onChange={() => handleToggleVisibility('allowContact')}
                    className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer accent-violet-600"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block group-hover:text-[#A78BFA] transition-colors">
                      Allow matched employers to contact me
                    </span>
                    <span className="text-[11px] text-[#64748B] leading-tight block">
                      Enables hiring teams with {'>'}80% compatibility to reach out.
                    </span>
                  </div>
                </label>

                {/* Toggle 3: Show portfolio evidence */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={visibility.showPortfolioEvidence}
                    onChange={() => handleToggleVisibility('showPortfolioEvidence')}
                    className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer accent-violet-600"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block group-hover:text-[#A78BFA] transition-colors">
                      Show my portfolio evidence
                    </span>
                    <span className="text-[11px] text-[#64748B] leading-tight block">
                      Attaches verified scripts, dashboards and PRDs to your matches.
                    </span>
                  </div>
                </label>

                {/* Toggle 4: Show skill information */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={visibility.showSkillInfo}
                    onChange={() => handleToggleVisibility('showSkillInfo')}
                    className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer accent-violet-600"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block group-hover:text-[#A78BFA] transition-colors">
                      Show my skill information
                    </span>
                    <span className="text-[11px] text-[#64748B] leading-tight block">
                      Displays competency scores and assessment validations.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Why ATLAS Opportunity Match is different */}
            <div className="glass-panel border-white/10 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono text-[#A78BFA] uppercase tracking-widest font-bold block">
                ATLAS Methodology
              </span>
              <h3 className="text-base font-bold text-white">
                Demonstrated Capability Pipeline
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Rather than relying on self-declared resume buzzwords, ATLAS matches candidates based on:
              </p>
              <div className="space-y-1.5 text-xs text-white font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
                  <span>Calibrated competency assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span>
                  <span>Role-specific skill threshold requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                  <span>Artifacts in your Evidence Locker</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
                  <span>Sprint velocity on your Career Roadmap</span>
                </div>
              </div>
            </div>

            {/* Employer banner */}
            <div className="glass-panel border-white/10 rounded-2xl p-5 space-y-3 text-center">
              <span className="material-symbols-outlined text-2xl text-[#A78BFA]">
                group_add
              </span>
              <h4 className="text-base font-bold text-white">
                Hiring for this trajectory?
              </h4>
              <p className="text-xs text-[#94A3B8]">
                Post role requirements and find candidates whose verified capabilities match your engineering or analytics stack.
              </p>
              <Link
                to="/employer"
                className="inline-block w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-sm"
              >
                Access Employer Portal →
              </Link>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

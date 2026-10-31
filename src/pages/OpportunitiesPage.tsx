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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <main className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="flex flex-col max-w-3xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B6F5A] font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8B6F5A] animate-pulse"></span>
              Demonstrated Capability · Opportunity Matching
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#18283D] tracking-tight">
              Opportunities matched to you.
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] mt-1.5 leading-relaxed">
              ATLAS connects your demonstrated capabilities and career direction with opportunities that fit your current empirical profile.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer"
              className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#18283D] font-mono text-xs font-semibold transition-all flex items-center gap-1.5 border border-[#E5E7EB] shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">corporate_fare</span>
              <span>Employer Portal</span>
            </Link>
          </div>
        </section>

        {/* Dynamic Candidate Context Bar */}
        <section className="glass-panel border-[#E5E7EB] rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider block font-semibold">
                  Target Role
                </span>
                <span className="text-base text-[#18283D] font-bold">
                  {targetRole}
                </span>
              </div>

              <div className="h-8 w-px bg-[#E5E7EB] hidden sm:block"></div>

              <div>
                <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider block font-semibold">
                  Calibrated Readiness
                </span>
                <span className="font-mono text-base font-bold text-[#8B6F5A]">
                  {hasProfile ? `${careerReadiness}%` : '68% (Baseline)'}
                </span>
              </div>

              <div className="h-8 w-px bg-[#E5E7EB] hidden md:block"></div>

              <div>
                <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider block font-semibold">
                  Active Demonstrations
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {demonstratedSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E5E7EB] text-[11px] font-mono text-[#18283D]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#6B7280] font-mono">
                Evidence in locker:{' '}
                <strong className="text-[#18283D]">
                  {state.evidence.length > 0 ? `${state.evidence.length} items` : '3 verified items'}
                </strong>
              </span>
              <Link
                to="/evidence"
                className="text-xs font-mono text-[#8B6F5A] font-semibold hover:text-[#18283D] transition-colors"
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass-panel border-[#E5E7EB] p-2 rounded-2xl bg-[#FAF7F2]/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 whitespace-nowrap cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
                  }`}
                >
                  All Matches ({opportunities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('high')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 whitespace-nowrap cursor-pointer ${
                    activeFilter === 'high'
                      ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
                  }`}
                >
                  Strong Alignment (≥80%)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('target')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 whitespace-nowrap cursor-pointer ${
                    activeFilter === 'target'
                      ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
                  }`}
                >
                  Target Role ({targetRole})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('remote')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-180 whitespace-nowrap cursor-pointer ${
                    activeFilter === 'remote'
                      ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
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
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-[#FAF7F2] text-[#18283D] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#18283D] placeholder-[#6B7280] transition-colors"
                />
                <span className="material-symbols-outlined text-[16px] text-[#6B7280] absolute left-2.5 top-2">
                  search
                </span>
              </div>
            </div>

            {/* Opportunities List */}
            {filteredOpportunities.length === 0 ? (
              <div className="glass-panel border-[#E5E7EB] rounded-2xl p-10 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#6B7280]">search_off</span>
                <h3 className="text-lg font-bold text-[#18283D]">No opportunities matched your filter</h3>
                <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                  Try clearing your search query or reset the filter tabs to view all available roles in the catalogue.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold shadow-sm cursor-pointer"
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
                      className="glass-panel border-[#E5E7EB] rounded-2xl p-6 shadow-xl hover:border-[#8B6F5A]/60 hover:shadow-2xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all duration-200 ease-out relative flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Card Top: Match % badge, Job Title, Company, Location */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Match Percentage Pill */}
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#18283D]/30 text-xs font-bold text-[#8B6F5A] font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]"></span>
                                {match.overallMatch}% MATCH
                              </span>
                              <span className="text-[11px] text-[#6B7280] font-mono font-medium uppercase tracking-wider">
                                {match.compatibilityLabel}
                              </span>
                              {isInterested && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5] text-[10px] font-mono font-bold">
                                  ✓ Interest Shared
                                </span>
                              )}
                            </div>

                            <h2 className="text-xl text-[#18283D] font-bold tracking-tight pt-1">
                              {opp.jobTitle}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
                              <span className="font-semibold text-[#18283D]">{opp.company}</span>
                              <span className="text-[#6B7280]">•</span>
                              <span>{opp.location}</span>
                              <span className="text-[#6B7280]">•</span>
                              <span>{opp.employmentType}</span>
                              {opp.salaryRange && (
                                <>
                                  <span className="text-[#6B7280]">•</span>
                                  <span className="font-mono text-[#8B6F5A] font-semibold">{opp.salaryRange}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-mono text-[#6B7280] block">
                              Posted {opp.postedDate}
                            </span>
                          </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs text-[#6B7280] leading-relaxed">
                          {opp.shortDescription}
                        </p>

                        {/* Breakdown: Matched vs Development Area */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E7EB]">
                          {/* Matched Skills */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#18283D] font-bold block">
                              Matched Capabilities:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {match.matchedRequirements.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[11px] text-[#8B6F5A] font-mono"
                                >
                                  <span>✓</span>
                                  {skill}
                                </span>
                              ))}
                              {match.evidenceMatches.some((e) => e.hasEvidence) && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[11px] text-[#8B6F5A] font-mono">
                                  <span>✓</span>
                                  Portfolio Evidence
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Development Areas */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8B6F5A] font-bold block">
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
                                <span className="text-xs text-[#8B6F5A] font-mono font-medium">
                                  ✓ All core requirements met
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: View Opportunity Action */}
                      <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-[11px] text-[#6B7280] font-mono italic">
                          Empirical match calibrated against your active dossier
                        </span>
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="px-5 py-2 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
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
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#8B6F5A] uppercase tracking-widest font-bold block">
                    Privacy Controls
                  </span>
                  <h2 className="text-lg font-bold text-[#18283D]">
                    Career Visibility
                  </h2>
                </div>
                <span className="material-symbols-outlined text-[#8B6F5A] text-xl">
                  shield_person
                </span>
              </div>

              <p className="text-xs text-[#6B7280] leading-relaxed">
                Candidate data is private by default. Control exactly what matched employers can discover from your ATLAS profile.
              </p>

              {visibilitySavedToast && (
                <div className="px-3 py-2 rounded-xl bg-[#D8C3A5]/30 border border-[#D8C3A5] text-[#8B6F5A] text-xs font-mono font-semibold flex items-center gap-1.5 animate-in fade-in">
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
                    <span className="text-xs font-semibold text-[#18283D] block group-hover:text-[#8B6F5A] transition-colors">
                      Allow employers to discover my profile
                    </span>
                    <span className="text-[11px] text-[#6B7280] leading-tight block">
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
                    <span className="text-xs font-semibold text-[#18283D] block group-hover:text-[#8B6F5A] transition-colors">
                      Allow matched employers to contact me
                    </span>
                    <span className="text-[11px] text-[#6B7280] leading-tight block">
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
                    <span className="text-xs font-semibold text-[#18283D] block group-hover:text-[#8B6F5A] transition-colors">
                      Show my portfolio evidence
                    </span>
                    <span className="text-[11px] text-[#6B7280] leading-tight block">
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
                    <span className="text-xs font-semibold text-[#18283D] block group-hover:text-[#8B6F5A] transition-colors">
                      Show my skill information
                    </span>
                    <span className="text-[11px] text-[#6B7280] leading-tight block">
                      Displays competency scores and assessment validations.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Why ATLAS Opportunity Match is different */}
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono text-[#8B6F5A] uppercase tracking-widest font-bold block">
                ATLAS Methodology
              </span>
              <h3 className="text-base font-bold text-[#18283D]">
                Demonstrated Capability Pipeline
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Rather than relying on self-declared resume buzzwords, ATLAS matches candidates based on:
              </p>
              <div className="space-y-1.5 text-xs text-[#18283D] font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18283D]"></span>
                  <span>Calibrated competency assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]"></span>
                  <span>Role-specific skill threshold requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8C3A5]"></span>
                  <span>Artifacts in your Evidence Locker</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]"></span>
                  <span>Sprint velocity on your Career Roadmap</span>
                </div>
              </div>
            </div>

            {/* Employer banner */}
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-5 space-y-3 text-center">
              <span className="material-symbols-outlined text-2xl text-[#8B6F5A]">
                group_add
              </span>
              <h4 className="text-base font-bold text-[#18283D]">
                Hiring for this trajectory?
              </h4>
              <p className="text-xs text-[#6B7280]">
                Post role requirements and find candidates whose verified capabilities match your engineering or analytics stack.
              </p>
              <Link
                to="/employer"
                className="inline-block w-full py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold transition-all shadow-sm"
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

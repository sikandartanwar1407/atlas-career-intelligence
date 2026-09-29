import React, { useState, useMemo } from 'react';
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

export const OpportunitiesPage: React.FC = () => {
  const { state, hasProfile, careerReadiness, skillGaps } = useAtlas();

  // Load candidate visibility settings
  const [visibility, setVisibility] = useState<CandidateVisibilitySettings>(getCandidateVisibility);
  const [visibilitySavedToast, setVisibilitySavedToast] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'remote' | 'target'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="flex flex-col max-w-3xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6b4ea6] animate-pulse"></span>
              Demonstrated Capability · Opportunity Matching
            </span>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Opportunities matched to you.
            </h1>
            <p className="font-headline-sm text-headline-sm text-[#424845] mt-1.5 font-sans text-sm sm:text-base leading-relaxed">
              ATLAS connects your demonstrated capabilities and career direction with opportunities that fit your current profile.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer"
              className="px-4 py-2 rounded-lg bg-[#f0ebe1] hover:bg-[#e6e0d5] text-[#0d1f18] font-label-md text-xs font-semibold transition-colors flex items-center gap-1.5 border border-[#e2ddd3]"
            >
              <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">corporate_fare</span>
              <span>Employer Portal</span>
            </Link>
          </div>
        </section>

        {/* Dynamic Candidate Context Bar */}
        <section className="bg-white border border-[#e5e2dc] rounded-xl p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="font-label-sm text-[11px] text-[#737874] uppercase tracking-wider block font-semibold">
                  Target Role
                </span>
                <span className="font-title-md text-title-md text-[#0d1f18] font-bold">
                  {targetRole}
                </span>
              </div>

              <div className="h-8 w-px bg-[#e5e2dc] hidden sm:block"></div>

              <div>
                <span className="font-label-sm text-[11px] text-[#737874] uppercase tracking-wider block font-semibold">
                  Calibrated Readiness
                </span>
                <span className="font-mono text-base font-bold text-[#6b4ea6]">
                  {hasProfile ? `${careerReadiness}%` : '68% (Baseline)'}
                </span>
              </div>

              <div className="h-8 w-px bg-[#e5e2dc] hidden md:block"></div>

              <div>
                <span className="font-label-sm text-[11px] text-[#737874] uppercase tracking-wider block font-semibold">
                  Active Demonstrations
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {demonstratedSkillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-[#f4f0e6] border border-[#e5e0d6] text-[11px] font-medium text-[#0d1f18]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#737874]">
                Evidence in locker:{' '}
                <strong className="text-[#0d1f18]">
                  {state.evidence.length > 0 ? `${state.evidence.length} items` : '3 verified items'}
                </strong>
              </span>
              <Link
                to="/evidence"
                className="text-xs text-[#6b4ea6] font-semibold hover:underline"
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#f6f2e9]/70 p-2 rounded-xl border border-[#e5e0d6]">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilter === 'all'
                      ? 'bg-[#0d1f18] text-white shadow-2xs'
                      : 'text-[#424845] hover:bg-[#e8e3d8]'
                  }`}
                >
                  All Matches ({opportunities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('high')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilter === 'high'
                      ? 'bg-[#0d1f18] text-white shadow-2xs'
                      : 'text-[#424845] hover:bg-[#e8e3d8]'
                  }`}
                >
                  Strong Alignment (≥80%)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('target')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilter === 'target'
                      ? 'bg-[#0d1f18] text-white shadow-2xs'
                      : 'text-[#424845] hover:bg-[#e8e3d8]'
                  }`}
                >
                  Target Role ({targetRole})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('remote')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilter === 'remote'
                      ? 'bg-[#0d1f18] text-white shadow-2xs'
                      : 'text-[#424845] hover:bg-[#e8e3d8]'
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
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-white border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6] transition-colors"
                />
                <span className="material-symbols-outlined text-[16px] text-[#737874] absolute left-2.5 top-2">
                  search
                </span>
              </div>
            </div>

            {/* Opportunities List */}
            {filteredOpportunities.length === 0 ? (
              <div className="bg-white border border-[#e5e2dc] rounded-xl p-10 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#737874]">search_off</span>
                <h3 className="font-serif text-lg font-semibold text-[#0d1f18]">No opportunities matched your filter</h3>
                <p className="text-xs text-[#5a625d] max-w-md mx-auto">
                  Try clearing your search query or reset the filter tabs to view all available roles in the catalogue.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0d1f18] text-white text-xs font-medium hover:bg-[#22382f]"
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
                      className="bg-white border border-[#e5e2dc] rounded-xl p-6 shadow-xs hover:border-[#c8c2b7] transition-all relative flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Card Top: Match % badge, Job Title, Company, Location */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Match Percentage Pill */}
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f6f2e9] border border-[#e5e0d6] text-xs font-bold text-[#6b4ea6] font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
                                {match.overallMatch}% MATCH
                              </span>
                              <span className="text-[11px] text-[#737874] font-medium uppercase tracking-wider">
                                {match.compatibilityLabel}
                              </span>
                              {isInterested && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d2e7dc] text-[#0d1f18] text-[10px] font-bold">
                                  ✓ Interest Shared
                                </span>
                              )}
                            </div>

                            <h2 className="font-headline-sm text-xl text-[#0d1f18] font-bold tracking-tight pt-1">
                              {opp.jobTitle}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5a625d]">
                              <span className="font-semibold text-[#0d1f18]">{opp.company}</span>
                              <span className="text-[#c2c8c3]">•</span>
                              <span>{opp.location}</span>
                              <span className="text-[#c2c8c3]">•</span>
                              <span>{opp.employmentType}</span>
                              {opp.salaryRange && (
                                <>
                                  <span className="text-[#c2c8c3]">•</span>
                                  <span className="font-mono text-[#0d1f18]">{opp.salaryRange}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] text-[#737874] block">
                              Posted {opp.postedDate}
                            </span>
                          </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs text-[#424845] leading-relaxed">
                          {opp.shortDescription}
                        </p>

                        {/* Breakdown: Matched vs Development Area */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f4f0e6]">
                          {/* Matched Skills */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] uppercase tracking-wider text-[#0d1f18] font-bold block">
                              Matched Capabilities:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {match.matchedRequirements.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f9f5] border border-[#d2e7dc] text-[11px] text-[#0d1f18] font-medium"
                                >
                                  <span className="text-[#2e7d32] text-xs">✓</span>
                                  {skill}
                                </span>
                              ))}
                              {match.evidenceMatches.some((e) => e.hasEvidence) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f9f5] border border-[#d2e7dc] text-[11px] text-[#0d1f18] font-medium">
                                  <span className="text-[#2e7d32] text-xs">✓</span>
                                  Portfolio Evidence
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Development Areas */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] uppercase tracking-wider text-[#6b4ea6] font-bold block">
                              Development Gap:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {match.developmentGaps.length > 0 ? (
                                match.developmentGaps.slice(0, 2).map((gap) => (
                                  <span
                                    key={gap.skill}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fcf5ff] border border-[#eaddff] text-[11px] text-[#25005a] font-medium"
                                  >
                                    <span className="text-[#6b4ea6]">△</span>
                                    {gap.skill} (deficit: {gap.deficit}%)
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-[#2e7d32] font-medium">
                                  ✓ All core requirements met
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: View Opportunity Action */}
                      <div className="mt-5 pt-4 border-t border-[#f4f0e6] flex items-center justify-between">
                        <span className="text-[11px] text-[#737874] italic">
                          Empirical match calibrated against your active dossier
                        </span>
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="px-4 py-2 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 shadow-2xs"
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
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6b4ea6] uppercase tracking-widest font-bold block">
                    Privacy Controls
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#0d1f18]">
                    Career Visibility
                  </h2>
                </div>
                <span className="material-symbols-outlined text-[#737874] text-xl">
                  shield_person
                </span>
              </div>

              <p className="text-xs text-[#5a625d] leading-relaxed">
                Candidate data is private by default. Control exactly what matched employers can discover from your ATLAS profile.
              </p>

              {visibilitySavedToast && (
                <div className="px-3 py-2 rounded-lg bg-[#d2e7dc] text-[#0d1f18] text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
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
                    className="mt-0.5 rounded text-[#6b4ea6] focus:ring-[#6b4ea6] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#0d1f18] block group-hover:text-[#6b4ea6] transition-colors">
                      Allow employers to discover my profile
                    </span>
                    <span className="text-[11px] text-[#737874] leading-tight block">
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
                    className="mt-0.5 rounded text-[#6b4ea6] focus:ring-[#6b4ea6] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#0d1f18] block group-hover:text-[#6b4ea6] transition-colors">
                      Allow matched employers to contact me
                    </span>
                    <span className="text-[11px] text-[#737874] leading-tight block">
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
                    className="mt-0.5 rounded text-[#6b4ea6] focus:ring-[#6b4ea6] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#0d1f18] block group-hover:text-[#6b4ea6] transition-colors">
                      Show my portfolio evidence
                    </span>
                    <span className="text-[11px] text-[#737874] leading-tight block">
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
                    className="mt-0.5 rounded text-[#6b4ea6] focus:ring-[#6b4ea6] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#0d1f18] block group-hover:text-[#6b4ea6] transition-colors">
                      Show my skill information
                    </span>
                    <span className="text-[11px] text-[#737874] leading-tight block">
                      Displays competency scores and assessment validations.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Why ATLAS Opportunity Match is different */}
            <div className="bg-[#f6f2e9] border border-[#e5e0d6] rounded-xl p-5 space-y-3">
              <span className="text-[10px] text-[#6b4ea6] uppercase tracking-widest font-bold block">
                ATLAS Methodology
              </span>
              <h3 className="font-serif text-base font-bold text-[#0d1f18]">
                Demonstrated Capability Pipeline
              </h3>
              <p className="text-xs text-[#5a625d] leading-relaxed">
                Rather than relying on self-declared resume buzzwords, ATLAS matches candidates based on:
              </p>
              <div className="space-y-1.5 text-xs text-[#0d1f18] font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
                  <span>Calibrated competency assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
                  <span>Role-specific skill threshold requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
                  <span>Artifacts in your Evidence Locker</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6b4ea6]"></span>
                  <span>Sprint velocity on your Career Roadmap</span>
                </div>
              </div>
            </div>

            {/* Employer banner */}
            <div className="bg-white border border-[#e5e2dc] rounded-xl p-5 space-y-3 text-center">
              <span className="material-symbols-outlined text-2xl text-[#6b4ea6]">
                group_add
              </span>
              <h4 className="font-serif text-base font-bold text-[#0d1f18]">
                Hiring for this trajectory?
              </h4>
              <p className="text-xs text-[#5a625d]">
                Post role requirements and find candidates whose verified capabilities match your engineering or analytics stack.
              </p>
              <Link
                to="/employer"
                className="inline-block w-full py-2 rounded-lg bg-[#0d1f18] text-white text-xs font-semibold hover:bg-[#22382f] transition-colors"
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

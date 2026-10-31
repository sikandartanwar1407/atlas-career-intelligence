import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  getOpportunityById,
  calculateOpportunityMatch,
  recordApplicationInterest,
  hasExpressedInterest,
} from '../data/opportunities';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, skillGaps } = useAtlas();

  // Load opportunity
  const opportunity = useMemo(() => {
    if (!id) return undefined;
    return getOpportunityById(id);
  }, [id]);

  // Express interest state
  const [interestSubmitted, setInterestSubmitted] = useState<boolean>(() => {
    return id ? hasExpressedInterest(id) : false;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build candidate skills dict
  const candidateSkillsDict = useMemo(() => {
    const dict: Record<string, number> = {};
    if (state.selfRatings) {
      Object.entries(state.selfRatings).forEach(([k, v]) => {
        dict[k] = v;
      });
    }
    skillGaps.forEach((g) => {
      dict[g.skill] = g.demonstrated;
      dict[g.displayName] = g.demonstrated;
    });
    return dict;
  }, [state.selfRatings, skillGaps]);

  // Calculate detailed match
  const matchResult = useMemo(() => {
    if (!opportunity) return null;
    return calculateOpportunityMatch(
      state.profile,
      candidateSkillsDict,
      state.evidence,
      opportunity
    );
  }, [opportunity, state.profile, candidateSkillsDict, state.evidence]);

  if (!opportunity || !matchResult) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 pt-32 text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-[#6B7280]">
            search_off
          </span>
          <h2 className="text-2xl font-bold text-[#18283D]">
            Opportunity Not Found
          </h2>
          <p className="text-xs text-[#6B7280]">
            The requested opportunity could not be located in the current catalogue.
          </p>
          <Link
            to="/opportunities"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold shadow-sm"
          >
            ← Return to Opportunities
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleExpressInterest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      recordApplicationInterest(opportunity.id, state.profile?.id || 'self');
      setInterestSubmitted(true);
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563]">
      <Header />

      <main className="w-full pt-24 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#6B7280]">
          <Link to="/opportunities" className="hover:text-[#18283D] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Opportunities</span>
          </Link>
          <span className="text-[#6B7280]">/</span>
          <span className="text-[#18283D] font-medium truncate max-w-[280px]">
            {opportunity.jobTitle} at {opportunity.company}
          </span>
        </div>

        {/* Hero Match Analysis Header */}
        <section className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8B6F5A] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8B6F5A] animate-pulse"></span>
                ATLAS Match Analysis
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#18283D] font-bold tracking-tight">
                {opportunity.jobTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                <span className="font-semibold text-sm text-[#18283D]">{opportunity.company}</span>
                <span className="text-[#6B7280]">•</span>
                <span>{opportunity.location}</span>
                <span className="text-[#6B7280]">•</span>
                <span>{opportunity.employmentType}</span>
                {opportunity.salaryRange && (
                  <>
                    <span className="text-[#6B7280]">•</span>
                    <span className="font-mono text-[#8B6F5A] font-semibold">{opportunity.salaryRange}</span>
                  </>
                )}
                <span className="text-[#6B7280]">•</span>
                <span className="font-mono text-[#6B7280]">Posted {opportunity.postedDate}</span>
              </div>
            </div>

            {/* Match Compatibility Badge & Action */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0 bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
              <div className="text-left lg:text-right">
                <div className="flex items-center lg:justify-end gap-2">
                  <span className="font-mono text-4xl font-extrabold text-[#8B6F5A]">
                    {matchResult.overallMatch}%
                  </span>
                  <span className="text-xs font-mono font-bold text-[#18283D] uppercase tracking-wider">
                    Compatibility
                  </span>
                </div>
                <span className="text-[11px] text-[#6B7280] font-mono block mt-0.5">
                  Calibrated via {matchResult.skillMatches.length} role requirements
                </span>
              </div>

              {/* Express Interest Button / Confirmation */}
              {interestSubmitted ? (
                <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#D8C3A5]/30 border border-[#D8C3A5] text-[#8B6F5A] text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B6F5A]"></span>
                  <div>
                    <div className="font-bold">Interest submitted</div>
                    <div className="text-[11px] text-[#8B6F5A]/80">Your profile has been shared for this opportunity.</div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleExpressInterest}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Sharing profile...</span>
                  ) : (
                    <>
                      <span>Express interest</span>
                      <span className="text-sm">→</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 2-Column Detailed Comparison Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Skill Bars & Three Core Sections (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section 1: Visual Skill Comparison */}
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
                <div>
                  <span className="text-[10px] font-mono text-[#8B6F5A] uppercase tracking-widest font-bold block">
                    Quantitative Breakdown
                  </span>
                  <h2 className="text-xl font-bold text-[#18283D]">
                    Skill Requirements Comparison
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#6B7280]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-violet-600"></span>
                    Your Demonstrated Level
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#E5E7EB]"></span>
                    Role Requirement
                  </span>
                </div>
              </div>

              {/* Skill Bars */}
              <div className="space-y-5">
                {matchResult.skillMatches.map((item) => {
                  return (
                    <div key={item.skill} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#18283D]">{item.skill}</span>
                          {item.isPreferred && (
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8B6F5A] bg-[#D8C3A5]/25 border border-[#D8C3A5] px-1.5 py-0.5 rounded">
                              Preferred
                            </span>
                          )}
                          {item.isMet ? (
                            <span className="text-[11px] text-[#8B6F5A] font-mono font-semibold flex items-center gap-0.5">
                              <span>✓</span> Met
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-400 font-mono font-semibold flex items-center gap-0.5">
                              <span>△</span> -{item.deficit}% deficit
                            </span>
                          )}
                        </div>

                        <div className="font-mono text-xs text-[#6B7280]">
                          Candidate: <strong className="text-[#18283D]">{item.candidateLevel}%</strong>{' '}
                          / Required: <strong className="text-[#6B7280]">{item.requiredLevel}%</strong>
                        </div>
                      </div>

                      {/* Stacked Progress Bar Visual */}
                      <div className="w-full h-3 bg-[#E5E7EB] rounded-full overflow-hidden relative">
                        {/* Requirement marker line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-sm"
                          style={{ left: `${item.requiredLevel}%` }}
                          title={`Required: ${item.requiredLevel}%`}
                        ></div>
                        {/* Candidate bar */}
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.isMet ? 'bg-teal-500' : 'bg-violet-600/70'
                          }`}
                          style={{ width: `${Math.min(item.candidateLevel, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-[11px] text-[#6B7280] font-mono italic">
                * White vertical tick marks represent the minimum requirement set by the employer.
              </div>
            </div>

            {/* Section 2: Three Cards: You Already Match, Development Gaps, Evidence You Can Show */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: YOU ALREADY MATCH */}
              <div className="glass-panel border-[#E5E7EB] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#D8C3A5]/30 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <h3 className="text-xs font-bold font-mono text-[#18283D] uppercase tracking-wider">
                      You Already Match
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#6B7280]">
                    Capabilities where your calibrated score meets or exceeds the role threshold:
                  </p>

                  <ul className="space-y-2 pt-1">
                    {matchResult.matchedRequirements.map((req) => (
                      <li key={req} className="flex items-center gap-2 text-xs font-medium text-[#18283D]">
                        <span className="text-[#8B6F5A] font-bold">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                    {matchResult.matchedRequirements.length === 0 && (
                      <li className="text-xs text-[#6B7280] italic">
                        Take the assessment to calibrate matches.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB]">
                  <span className="text-[10px] text-[#8B6F5A] font-mono font-semibold block uppercase tracking-wider">
                    {matchResult.matchedRequirements.length} requirements satisfied
                  </span>
                </div>
              </div>

              {/* Card 2: DEVELOPMENT GAPS */}
              <div className="glass-panel border-[#E5E7EB] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center justify-center text-xs font-bold">
                      △
                    </span>
                    <h3 className="text-xs font-bold font-mono text-[#18283D] uppercase tracking-wider">
                      Development Gaps
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#6B7280]">
                    Areas to accelerate to achieve full candidate readiness:
                  </p>

                  <ul className="space-y-2 pt-1">
                    {matchResult.developmentGaps.map((gap) => (
                      <li key={gap.skill} className="flex items-start gap-2 text-xs font-medium text-[#18283D]">
                        <span className="text-rose-400 font-bold">△</span>
                        <div>
                          <span>{gap.skill}</span>
                          <span className="text-[10px] font-mono text-[#6B7280] block">
                            Target {gap.requiredLevel}% (currently {gap.candidateLevel}%)
                          </span>
                        </div>
                      </li>
                    ))}
                    {matchResult.developmentGaps.length === 0 && (
                      <li className="text-xs text-[#8B6F5A] font-semibold">
                        ✓ No critical skill gaps for this role!
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB]">
                  <Link
                    to="/skill-gaps"
                    className="text-[11px] text-[#8B6F5A] font-mono font-semibold hover:text-[#18283D] transition-colors block"
                  >
                    Open Skill Gaps Triage →
                  </Link>
                </div>
              </div>

              {/* Card 3: EVIDENCE YOU CAN SHOW */}
              <div className="glass-panel border-[#E5E7EB] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#D8C3A5]/30 border border-[#18283D]/30 text-[#8B6F5A] flex items-center justify-center text-xs font-bold">
                      🛡️
                    </span>
                    <h3 className="text-xs font-bold font-mono text-[#18283D] uppercase tracking-wider">
                      Evidence You Can Show
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#6B7280]">
                    Verified projects and artifacts relevant to this employer's requirements:
                  </p>

                  <ul className="space-y-2 pt-1">
                    {matchResult.evidenceMatches.map((ev) => (
                      <li key={ev.title} className="flex items-start gap-2 text-xs font-medium text-[#18283D]">
                        <span className={ev.hasEvidence ? 'text-[#8B6F5A] font-bold' : 'text-[#6B7280]'}>
                          {ev.hasEvidence ? '✓' : '○'}
                        </span>
                        <div>
                          <span>{ev.title}</span>
                          <span className="text-[10px] font-mono text-[#6B7280] block">
                            {ev.hasEvidence ? 'Verified in locker' : 'Recommended artifact'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB]">
                  <Link
                    to="/evidence"
                    className="text-[11px] text-[#8B6F5A] font-mono font-semibold hover:text-[#18283D] transition-colors block"
                  >
                    Add Evidence to Locker →
                  </Link>
                </div>
              </div>

            </div>

            {/* Job Description & Company Brief */}
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-[#18283D]">
                Role Scope &amp; Responsibilities
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                {opportunity.fullDescription}
              </p>

              <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[#6B7280] font-mono">
                  Target Trajectory: <strong className="text-[#18283D]">{opportunity.targetRoleCategory}</strong>
                </div>
                <div className="text-xs text-[#6B7280] font-mono">
                  Experience Level: <strong className="text-[#18283D]">{opportunity.experienceLevel}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: ATLAS Recommendation Card & Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ATLAS Recommendation Card */}
            <div className="glass-panel-elevated border-[#18283D]/30 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                  ★
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B6F5A]">
                  ATLAS Recommends
                </span>
              </div>

              <h4 className="text-base font-bold text-[#18283D] leading-snug">
                {matchResult.recommendationSummary}
              </h4>

              <p className="text-xs text-[#6B7280] leading-relaxed">
                Focusing on this primary gap will elevate your compatibility for this position into the top quartile.
              </p>

              <div className="pt-2">
                <Link
                  to="/career-roadmap"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>View {matchResult.primaryGapSkill} roadmap</span>
                  <span className="text-sm">→</span>
                </Link>
              </div>
            </div>

            {/* Express Interest Summary Card */}
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="text-base font-bold text-[#18283D]">
                Application Status
              </h4>

              {interestSubmitted ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] space-y-1">
                    <span className="text-xs font-bold text-[#18283D] flex items-center gap-1.5 font-mono">
                      <span className="text-[#8B6F5A]">✓</span> Profile Shared
                    </span>
                    <p className="text-[11px] text-[#6B7280]">
                      The talent team at {opportunity.company} can now review your verified skill profile and portfolio artifacts.
                    </p>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    You can manage which artifacts employers can see under your Career Visibility controls.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Ready to put your demonstrated capabilities forward? Expressing interest shares your verified profile and evidence locker with the hiring team.
                  </p>
                  <button
                    type="button"
                    onClick={handleExpressInterest}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sharing profile...</span>
                    ) : (
                      <>
                        <span>Express interest →</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Connect to existing systems */}
            <div className="glass-panel border-[#E5E7EB] rounded-2xl p-5 space-y-3 text-xs">
              <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-semibold block">
                Related Workspace Tools
              </span>
              <div className="space-y-2">
                <Link
                  to="/skill-gaps"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#D8C3A5]/20 hover:text-[#18283D] hover:-translate-y-0.5 text-[#18283D] transition-all"
                >
                  <span className="font-medium">Diagnose Skill Deficits</span>
                  <span className="text-[#8B6F5A]">→</span>
                </Link>
                <Link
                  to="/resources"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#D8C3A5]/20 hover:text-[#18283D] hover:-translate-y-0.5 text-[#18283D] transition-all"
                >
                  <span className="font-medium">Curated Study Resources</span>
                  <span className="text-[#8B6F5A]">→</span>
                </Link>
                <Link
                  to="/evidence"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#D8C3A5]/20 hover:text-[#18283D] hover:-translate-y-0.5 text-[#18283D] transition-all"
                >
                  <span className="font-medium">Locker &amp; Project Proofs</span>
                  <span className="text-[#8B6F5A]">→</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

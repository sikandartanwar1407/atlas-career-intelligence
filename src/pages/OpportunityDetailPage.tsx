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
      <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 pt-32 text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-[#737874]">
            search_off
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#0d1f18]">
            Opportunity Not Found
          </h2>
          <p className="text-xs text-[#5a625d]">
            The requested opportunity could not be located in the current catalogue.
          </p>
          <Link
            to="/opportunities"
            className="inline-block px-5 py-2.5 rounded-lg bg-[#0d1f18] text-white text-xs font-semibold"
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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#737874]">
          <Link to="/opportunities" className="hover:text-[#0d1f18] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Opportunities</span>
          </Link>
          <span>/</span>
          <span className="text-[#0d1f18] font-medium truncate max-w-[280px]">
            {opportunity.jobTitle} at {opportunity.company}
          </span>
        </div>

        {/* Hero Match Analysis Header */}
        <section className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6b4ea6]"></span>
                ATLAS Match Analysis
              </span>

              <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl text-[#0d1f18] font-bold tracking-tight">
                {opportunity.jobTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5a625d]">
                <span className="font-semibold text-sm text-[#0d1f18]">{opportunity.company}</span>
                <span className="text-[#c2c8c3]">•</span>
                <span>{opportunity.location}</span>
                <span className="text-[#c2c8c3]">•</span>
                <span>{opportunity.employmentType}</span>
                {opportunity.salaryRange && (
                  <>
                    <span className="text-[#c2c8c3]">•</span>
                    <span className="font-mono text-[#0d1f18] font-semibold">{opportunity.salaryRange}</span>
                  </>
                )}
                <span className="text-[#c2c8c3]">•</span>
                <span>Posted {opportunity.postedDate}</span>
              </div>
            </div>

            {/* Match Compatibility Badge & Action */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0 bg-[#fbf9f4] p-4 sm:p-5 rounded-xl border border-[#ebe6dc]">
              <div className="text-left lg:text-right">
                <div className="flex items-center lg:justify-end gap-2">
                  <span className="font-mono text-3xl font-extrabold text-[#6b4ea6]">
                    {matchResult.overallMatch}%
                  </span>
                  <span className="font-label-sm text-xs font-bold text-[#0d1f18] uppercase tracking-wider">
                    Compatibility
                  </span>
                </div>
                <span className="text-[11px] text-[#737874] block mt-0.5">
                  Calibrated via {matchResult.skillMatches.length} role requirements
                </span>
              </div>

              {/* Express Interest Button / Confirmation */}
              {interestSubmitted ? (
                <div className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#d2e7dc] border border-[#b2d7c4] text-[#0d1f18] text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2e7d32]"></span>
                  <div>
                    <div className="font-bold">Interest submitted</div>
                    <div className="text-[11px] text-[#22382f]">Your profile has been shared for this opportunity.</div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleExpressInterest}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
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
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f4f0e6]">
                <div>
                  <span className="text-[10px] text-[#6b4ea6] uppercase tracking-widest font-bold block">
                    Quantitative Breakdown
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#0d1f18]">
                    Skill Requirements Comparison
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-[#737874]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#6b4ea6]"></span>
                    Your Demonstrated Level
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#d6d0c4]"></span>
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
                          <span className="font-bold text-[#0d1f18]">{item.skill}</span>
                          {item.isPreferred && (
                            <span className="text-[10px] uppercase tracking-wider text-[#737874] bg-[#f4f0e6] px-1.5 py-0.5 rounded">
                              Preferred
                            </span>
                          )}
                          {item.isMet ? (
                            <span className="text-[11px] text-[#2e7d32] font-semibold flex items-center gap-0.5">
                              <span>✓</span> Met
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6b4ea6] font-semibold flex items-center gap-0.5">
                              <span>△</span> -{item.deficit}% deficit
                            </span>
                          )}
                        </div>

                        <div className="font-mono text-xs text-[#5a625d]">
                          Candidate: <strong className="text-[#0d1f18]">{item.candidateLevel}%</strong>{' '}
                          / Required: <strong className="text-[#737874]">{item.requiredLevel}%</strong>
                        </div>
                      </div>

                      {/* Stacked Progress Bar Visual */}
                      <div className="w-full h-3 bg-[#ebe6dc] rounded-full overflow-hidden relative">
                        {/* Requirement marker line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-[#0d1f18] z-20"
                          style={{ left: `${item.requiredLevel}%` }}
                          title={`Required: ${item.requiredLevel}%`}
                        ></div>
                        {/* Candidate bar */}
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.isMet ? 'bg-[#6b4ea6]' : 'bg-[#987fc5]'
                          }`}
                          style={{ width: `${Math.min(item.candidateLevel, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-[11px] text-[#737874] italic">
                * Black vertical tick marks represent the minimum requirement set by the employer.
              </div>
            </div>

            {/* Section 2: Three Cards: You Already Match, Development Gaps, Evidence You Can Show */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: YOU ALREADY MATCH */}
              <div className="bg-white border border-[#e5e2dc] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#f4f9f5] border border-[#d2e7dc] text-[#2e7d32] flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <h3 className="font-serif text-sm font-bold text-[#0d1f18] uppercase tracking-wider">
                      You Already Match
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#737874]">
                    Capabilities where your calibrated score meets or exceeds the role threshold:
                  </p>

                  <ul className="space-y-2 pt-1">
                    {matchResult.matchedRequirements.map((req) => (
                      <li key={req} className="flex items-center gap-2 text-xs font-medium text-[#0d1f18]">
                        <span className="text-[#2e7d32] font-bold">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                    {matchResult.matchedRequirements.length === 0 && (
                      <li className="text-xs text-[#737874] italic">
                        Take the assessment to calibrate matches.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#f4f0e6]">
                  <span className="text-[10px] text-[#2e7d32] font-semibold block uppercase tracking-wider">
                    {matchResult.matchedRequirements.length} requirements satisfied
                  </span>
                </div>
              </div>

              {/* Card 2: DEVELOPMENT GAPS */}
              <div className="bg-white border border-[#e5e2dc] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#fcf5ff] border border-[#eaddff] text-[#6b4ea6] flex items-center justify-center text-xs font-bold">
                      △
                    </span>
                    <h3 className="font-serif text-sm font-bold text-[#0d1f18] uppercase tracking-wider">
                      Development Gaps
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#737874]">
                    Areas to accelerate to achieve full candidate readiness:
                  </p>

                  <ul className="space-y-2 pt-1">
                    {matchResult.developmentGaps.map((gap) => (
                      <li key={gap.skill} className="flex items-start gap-2 text-xs font-medium text-[#0d1f18]">
                        <span className="text-[#6b4ea6] font-bold">△</span>
                        <div>
                          <span>{gap.skill}</span>
                          <span className="text-[10px] text-[#737874] block">
                            Target {gap.requiredLevel}% (currently {gap.candidateLevel}%)
                          </span>
                        </div>
                      </li>
                    ))}
                    {matchResult.developmentGaps.length === 0 && (
                      <li className="text-xs text-[#2e7d32] font-semibold">
                        ✓ No critical skill gaps for this role!
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#f4f0e6]">
                  <Link
                    to="/skill-gaps"
                    className="text-[11px] text-[#6b4ea6] font-semibold hover:underline block"
                  >
                    Open Skill Gaps Triage →
                  </Link>
                </div>
              </div>

              {/* Card 3: EVIDENCE YOU CAN SHOW */}
              <div className="bg-white border border-[#e5e2dc] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#f6f2e9] border border-[#e5e0d6] text-[#0d1f18] flex items-center justify-center text-xs font-bold">
                      🛡️
                    </span>
                    <h3 className="font-serif text-sm font-bold text-[#0d1f18] uppercase tracking-wider">
                      Evidence You Can Show
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#737874]">
                    Verified projects and artifacts relevant to this employer's requirements:
                  </p>

                  <ul className="space-y-2 pt-1">
                    {matchResult.evidenceMatches.map((ev) => (
                      <li key={ev.title} className="flex items-start gap-2 text-xs font-medium text-[#0d1f18]">
                        <span className={ev.hasEvidence ? 'text-[#2e7d32] font-bold' : 'text-[#737874]'}>
                          {ev.hasEvidence ? '✓' : '○'}
                        </span>
                        <div>
                          <span>{ev.title}</span>
                          <span className="text-[10px] text-[#737874] block">
                            {ev.hasEvidence ? 'Verified in locker' : 'Recommended artifact'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#f4f0e6]">
                  <Link
                    to="/evidence"
                    className="text-[11px] text-[#6b4ea6] font-semibold hover:underline block"
                  >
                    Add Evidence to Locker →
                  </Link>
                </div>
              </div>

            </div>

            {/* Job Description & Company Brief */}
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#0d1f18]">
                Role Scope & Responsibilities
              </h3>
              <p className="text-xs sm:text-sm text-[#424845] leading-relaxed">
                {opportunity.fullDescription}
              </p>

              <div className="pt-4 border-t border-[#f4f0e6] flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[#737874]">
                  Target Trajectory: <strong className="text-[#0d1f18]">{opportunity.targetRoleCategory}</strong>
                </div>
                <div className="text-xs text-[#737874]">
                  Experience Level: <strong className="text-[#0d1f18]">{opportunity.experienceLevel}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: ATLAS Recommendation Card & Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ATLAS Recommendation Card */}
            <div className="bg-[#fcf9f2] border-2 border-[#6b4ea6]/20 rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6b4ea6] text-white flex items-center justify-center text-xs font-bold">
                  ★
                </span>
                <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-[#6b4ea6]">
                  ATLAS Recommends
                </span>
              </div>

              <h4 className="font-serif text-base font-bold text-[#0d1f18] leading-snug">
                {matchResult.recommendationSummary}
              </h4>

              <p className="text-xs text-[#5a625d] leading-relaxed">
                Focusing on this primary gap will elevate your compatibility for this position into the top quartile.
              </p>

              <div className="pt-2">
                <Link
                  to="/career-roadmap"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#6b4ea6] hover:bg-[#593d91] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <span>View {matchResult.primaryGapSkill} roadmap</span>
                  <span className="text-sm">→</span>
                </Link>
              </div>
            </div>

            {/* Express Interest Summary Card */}
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="font-serif text-base font-bold text-[#0d1f18]">
                Application Status
              </h4>

              {interestSubmitted ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#f4f9f5] border border-[#d2e7dc] space-y-1">
                    <span className="text-xs font-bold text-[#0d1f18] flex items-center gap-1.5">
                      <span className="text-[#2e7d32]">✓</span> Profile Shared
                    </span>
                    <p className="text-[11px] text-[#424845]">
                      The talent team at {opportunity.company} can now review your verified skill profile and portfolio artifacts.
                    </p>
                  </div>
                  <p className="text-[11px] text-[#737874]">
                    You can manage which artifacts employers can see under your Career Visibility controls.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#5a625d] leading-relaxed">
                    Ready to put your demonstrated capabilities forward? Expressing interest shares your verified profile and evidence locker with the hiring team.
                  </p>
                  <button
                    type="button"
                    onClick={handleExpressInterest}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
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
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-5 space-y-3 text-xs">
              <span className="text-[10px] text-[#737874] uppercase tracking-wider font-semibold block">
                Related Workspace Tools
              </span>
              <div className="space-y-2">
                <Link
                  to="/skill-gaps"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f6f2e9] text-[#0d1f18] transition-colors"
                >
                  <span className="font-medium">Diagnose Skill Deficits</span>
                  <span className="text-[#6b4ea6]">→</span>
                </Link>
                <Link
                  to="/resources"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f6f2e9] text-[#0d1f18] transition-colors"
                >
                  <span className="font-medium">Curated Study Resources</span>
                  <span className="text-[#6b4ea6]">→</span>
                </Link>
                <Link
                  to="/evidence"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f6f2e9] text-[#0d1f18] transition-colors"
                >
                  <span className="font-medium">Locker & Project Proofs</span>
                  <span className="text-[#6b4ea6]">→</span>
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

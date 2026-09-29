import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { getOpportunities } from '../data/opportunities';
import { useAccount } from '../context/AccountContext';

export const EmployerPortalPage: React.FC = () => {
  const { employerProfile, isEmployerVerified, verifyEmployerAccount } = useAccount();
  const opportunities = useMemo(() => getOpportunities(), []);

  const totalMatchedCount = useMemo(() => {
    return opportunities.reduce((acc, curr) => acc + (curr.matchedCount || 18), 0);
  }, [opportunities]);

  const activeOpportunities = useMemo(() => {
    return opportunities.filter((o) => o.status !== 'closed');
  }, [opportunities]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Verification Warning Banner if Pending */}
        {!isEmployerVerified && (
          <div className="bg-[#fff9eb] border border-[#ffe099] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#b45309] text-2xl shrink-0 mt-0.5">
                pending
              </span>
              <div>
                <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider block">
                  Verification Pending
                </span>
                <p className="text-xs text-[#78350f] mt-0.5">
                  Complete company verification to unlock direct candidate capability interviews and full portfolio access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={verifyEmployerAccount}
                className="px-4 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold tracking-wide transition-colors shadow-2xs"
              >
                Simulate Verification →
              </button>
              <Link
                to="/employer/onboarding"
                className="px-3 py-2 rounded-xl border border-[#ffe099] text-[#78350f] text-xs font-semibold hover:bg-[#fff3d4] transition-colors"
              >
                Review Status
              </Link>
            </div>
          </div>
        )}

        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="flex flex-col max-w-3xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6b4ea6]"></span>
              ATLAS FOR EMPLOYERS · Demonstrated Capability Pipeline
            </span>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Find talent through demonstrated capability.
            </h1>
            <p className="font-headline-sm text-headline-sm text-[#424845] mt-1.5 font-sans text-sm sm:text-base leading-relaxed">
              ATLAS helps employers discover candidates whose demonstrated skills align with the requirements of their roles.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer/opportunities/new"
              className="px-5 py-2.5 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Post an opportunity</span>
            </Link>
          </div>
        </section>

        {/* Employer Stats Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs space-y-1">
            <span className="text-[11px] text-[#737874] uppercase tracking-wider font-semibold block">
              Active Opportunities
            </span>
            <span className="font-mono text-3xl font-extrabold text-[#0d1f18]">
              {activeOpportunities.length} Roles
            </span>
            <span className="text-xs text-[#2e7d32] font-medium block pt-1">
              ✓ Calibrated against ATLAS skill catalogue
            </span>
          </div>

          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs space-y-1">
            <span className="text-[11px] text-[#737874] uppercase tracking-wider font-semibold block">
              Matched Candidates
            </span>
            <span className="font-mono text-3xl font-extrabold text-[#6b4ea6]">
              {totalMatchedCount} Candidates
            </span>
            <span className="text-xs text-[#5a625d] block pt-1">
              Evaluated with quantitative skill scores
            </span>
          </div>

          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs space-y-1">
            <span className="text-[11px] text-[#737874] uppercase tracking-wider font-semibold block">
              New Matches (This Sprint)
            </span>
            <span className="font-mono text-3xl font-extrabold text-[#0d1f18]">
              12 Candidates
            </span>
            <span className="text-xs text-[#6b4ea6] font-medium block pt-1">
              ★ Top quartile empirical compatibility
            </span>
          </div>
        </section>

        {/* YOUR OPPORTUNITIES Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-2">
            <div>
              <span className="text-[10px] text-[#6b4ea6] uppercase tracking-widest font-bold block">
                Capability Portfolios
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#0d1f18]">
                Your Opportunities
              </h2>
            </div>
            <Link
              to="/employer/opportunities"
              className="text-xs text-[#6b4ea6] font-semibold hover:underline"
            >
              Manage All Opportunities ({opportunities.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.slice(0, 6).map((opp) => {
              const count = opp.matchedCount || 24;
              const interested = opp.interestedCount || 3;
              const isClosed = opp.status === 'closed';

              return (
                <div
                  key={opp.id}
                  className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs hover:border-[#c8c2b7] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f6f2e9] text-[#6b4ea6] text-[11px] font-bold">
                        {opp.targetRoleCategory}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isClosed
                            ? 'bg-[#ebe6dc] text-[#737874]'
                            : 'bg-[#d2e7dc] text-[#0d1f18]'
                        }`}
                      >
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-headline-sm text-xl font-bold text-[#0d1f18]">
                        {opp.jobTitle}
                      </h3>
                      <span className="text-xs font-medium text-[#5a625d]">
                        {opp.location} • {opp.employmentType}
                      </span>
                    </div>

                    {/* Matched Count Highlight Box */}
                    <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#ebe6dc] space-y-1">
                      <div className="text-sm font-bold text-[#0d1f18]">
                        {count} candidates matched
                      </div>
                      <div className="text-[11px] text-[#6b4ea6] font-medium">
                        {interested} candidates expressed interest
                      </div>
                    </div>

                    {/* Core Requirements */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-[#737874] font-semibold block">
                        Requirements Calibrated:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opp.requirements.slice(0, 4).map((r) => (
                          <span
                            key={r.skill}
                            className="px-2 py-0.5 rounded bg-[#f4f0e6] text-[10px] text-[#0d1f18] font-medium"
                          >
                            {r.skill} ≥{r.minLevel}%
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#f4f0e6] flex items-center justify-between">
                    <span className="text-[11px] text-[#737874]">
                      {opp.postedDate}
                    </span>
                    <Link
                      to={`/employer/opportunities/${opp.id}/matches`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>View matches</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Capability Alignment Note */}
        <section className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="font-serif text-lg font-bold text-[#0d1f18]">
              Need candidates with custom engineering benchmarks?
            </h3>
            <p className="text-xs text-[#5a625d] leading-relaxed">
              Create a custom role with required skills, preferred topics, and minimum capability percentages. ATLAS will match candidate dossiers immediately.
            </p>
          </div>
          <Link
            to="/employer/opportunities/new"
            className="px-5 py-2.5 rounded-xl bg-[#6b4ea6] hover:bg-[#593d91] text-white text-xs font-semibold tracking-wide transition-colors shrink-0 shadow-2xs"
          >
            + Post New Opportunity
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
};

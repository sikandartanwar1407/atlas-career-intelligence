import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { getOpportunities } from '../data/opportunities';
import { useAccount } from '../context/AccountContext';

export const EmployerPortalPage: React.FC = () => {
  const { isEmployerVerified, verifyEmployerAccount } = useAccount();
  const opportunities = useMemo(() => getOpportunities(), []);

  const totalMatchedCount = useMemo(() => {
    return opportunities.reduce((acc, curr) => acc + (curr.matchedCount || 18), 0);
  }, [opportunities]);

  const activeOpportunities = useMemo(() => {
    return opportunities.filter((o) => o.status !== 'closed');
  }, [opportunities]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Verification Warning Banner if Pending */}
        {!isEmployerVerified && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-2xl shrink-0 mt-0.5">
                pending
              </span>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Verification Pending
                </span>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Complete company verification to unlock direct candidate capability interviews and full portfolio access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={verifyEmployerAccount}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-md active:scale-[0.98]"
              >
                Simulate Verification →
              </button>
              <Link
                to="/employer/onboarding"
                className="px-3 py-2 rounded-xl border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/10 transition-colors"
              >
                Review Status
              </Link>
            </div>
          </div>
        )}

        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex flex-col max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-violet-400 font-bold">
                ATLAS FOR EMPLOYERS · Demonstrated Capability Pipeline
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Find talent through demonstrated capability.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              ATLAS matches your open engineering and analysis roles with candidates whose verified skill diagnostics meet your precise thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer/opportunities/new"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Post an Opportunity</span>
            </Link>
          </div>
        </section>

        {/* Employer Stats Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-2 backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Active Opportunities
            </span>
            <div className="font-mono text-3xl font-extrabold text-white">
              {activeOpportunities.length} Roles
            </div>
            <span className="text-xs text-teal-400 font-medium flex items-center gap-1.5 pt-1">
              <span>✓</span> Calibrated against ATLAS skill catalogue
            </span>
          </div>

          <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-2 backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Matched Candidates
            </span>
            <div className="font-mono text-3xl font-extrabold text-violet-400">
              {totalMatchedCount} Candidates
            </div>
            <span className="text-xs text-slate-400 block pt-1">
              Evaluated with quantitative skill scores
            </span>
          </div>

          <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-2 backdrop-blur-sm">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              New Matches (This Sprint)
            </span>
            <div className="font-mono text-3xl font-extrabold text-white">
              12 Candidates
            </div>
            <span className="text-xs text-violet-300 font-medium flex items-center gap-1.5 pt-1">
              <span>★</span> Top quartile empirical compatibility
            </span>
          </div>
        </section>

        {/* YOUR OPPORTUNITIES Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-2">
            <div>
              <span className="text-[10px] text-violet-400 uppercase tracking-widest font-bold block">
                Capability Portfolios
              </span>
              <h2 className="text-2xl font-bold text-white">
                Your Opportunities
              </h2>
            </div>
            <Link
              to="/employer/opportunities"
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors flex items-center gap-1"
            >
              <span>Manage All Opportunities ({opportunities.length})</span>
              <span>→</span>
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
                  className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-5 backdrop-blur-sm group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-semibold">
                        {opp.targetRoleCategory}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isClosed
                            ? 'bg-slate-800 text-slate-400 border border-white/10'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                        {opp.jobTitle}
                      </h3>
                      <span className="text-xs font-medium text-slate-400">
                        {opp.location} • {opp.employmentType}
                      </span>
                    </div>

                    {/* Matched Count Highlight Box */}
                    <div className="p-3.5 rounded-xl bg-[#0D1224]/80 border border-white/10 space-y-1">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-teal-400">{count}</span>
                        <span>candidates matched</span>
                      </div>
                      <div className="text-[11px] text-violet-300 font-medium">
                        {interested} candidates expressed interest
                      </div>
                    </div>

                    {/* Core Requirements */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Requirements Calibrated:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opp.requirements.slice(0, 4).map((r) => (
                          <span
                            key={r.skill}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-mono"
                          >
                            {r.skill} ≥{r.minLevel}%
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {opp.postedDate}
                    </span>
                    <Link
                      to={`/employer/opportunities/${opp.id}/matches`}
                      className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center gap-1 shadow-sm active:scale-[0.98]"
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
        <section className="bg-[#11182B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-sm">
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-lg font-bold text-white">
              Need candidates with custom engineering benchmarks?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Create a custom role with required skills, preferred topics, and minimum capability percentages. ATLAS will match candidate dossiers immediately.
            </p>
          </div>
          <Link
            to="/employer/opportunities/new"
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all shrink-0 shadow-sm active:scale-[0.98]"
          >
            + Post New Opportunity
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
};

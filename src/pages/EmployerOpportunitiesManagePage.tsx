import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { getOpportunities, toggleOpportunityStatus } from '../data/opportunities';
import { Opportunity } from '../types/opportunities';

export const EmployerOpportunitiesManagePage: React.FC = () => {
  const [opportunitiesList, setOpportunitiesList] = useState<Opportunity[]>(() => getOpportunities());
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [toastMessage, setToastMessage] = useState('');

  const displayedList = useMemo(() => {
    if (filter === 'active') return opportunitiesList.filter((o) => o.status !== 'closed');
    if (filter === 'closed') return opportunitiesList.filter((o) => o.status === 'closed');
    return opportunitiesList;
  }, [opportunitiesList, filter]);

  const handleToggleStatus = (id: string) => {
    const updated = toggleOpportunityStatus(id);
    if (updated) {
      setOpportunitiesList(getOpportunities());
      const newStatus = updated.status === 'closed' ? 'closed' : 'activated';
      setToastMessage(`Opportunity has been ${newStatus}.`);
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/employer" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Opportunity Management</span>
        </div>

        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex flex-col max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-violet-400 font-bold">
                ATLAS FOR EMPLOYERS · Role Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Manage Company Opportunities
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Track candidate pipeline volumes, review expressed candidate interest, and calibrate role requirement thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer/opportunities/new"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Create Opportunity</span>
            </Link>
          </div>
        </section>

        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in backdrop-blur-sm">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter Bar */}
        <section className="flex items-center justify-between bg-[#11182B]/80 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 ml-2">Filter:</span>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              All ({opportunitiesList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Active ({opportunitiesList.filter((o) => o.status !== 'closed').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'closed'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Closed ({opportunitiesList.filter((o) => o.status === 'closed').length})
            </button>
          </div>

          <div className="text-xs text-slate-400 pr-2">
            Showing <span className="font-mono text-white">{displayedList.length}</span> roles
          </div>
        </section>

        {/* Opportunities List */}
        <section className="space-y-4">
          {displayedList.map((opp) => {
            const isClosed = opp.status === 'closed';
            const matchedCount = opp.matchedCount || 24;
            const interestedCount = opp.interestedCount || 5;

            return (
              <div
                key={opp.id}
                className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl hover:border-violet-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm group"
              >
                {/* Left: Role Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isClosed
                          ? 'bg-slate-800 text-slate-400 border border-white/10'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isClosed ? 'CLOSED' : 'ACTIVE'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Created {opp.postedDate}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                    {opp.jobTitle}
                  </h3>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-violet-400 font-semibold">{opp.targetRoleCategory}</span>
                    <span>•</span>
                    <span>{opp.location}</span>
                    <span>•</span>
                    <span>{opp.employmentType}</span>
                    {opp.salaryRange && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-teal-300">{opp.salaryRange}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Center: Match & Interest Counts */}
                <div className="flex items-center gap-4 bg-[#0D1224]/80 border border-white/10 p-4 rounded-xl shrink-0">
                  <div className="text-center px-2">
                    <span className="font-mono text-2xl font-bold text-white block">
                      {matchedCount}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Matched Candidates
                    </span>
                  </div>

                  <div className="h-8 w-px bg-white/10"></div>

                  <div className="text-center px-2">
                    <span className="font-mono text-2xl font-bold text-violet-400 block">
                      {interestedCount}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Interested Candidates
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col items-end gap-2.5 shrink-0">
                  <Link
                    to={`/employer/opportunities/${opp.id}/matches`}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <span>View matches</span>
                    <span>→</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-medium transition-colors"
                      title="Preview candidate view"
                    >
                      View Role
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(opp.id)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {isClosed ? 'Reopen' : 'Close Role'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

      </main>

      <Footer />
    </div>
  );
};

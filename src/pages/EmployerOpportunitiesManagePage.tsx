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

  const handleToggleStatus = (id: string, currentStatus?: string) => {
    const updated = toggleOpportunityStatus(id);
    if (updated) {
      setOpportunitiesList(getOpportunities());
      const newStatus = updated.status === 'closed' ? 'closed' : 'activated';
      setToastMessage(`Opportunity has been ${newStatus}.`);
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#737874]">
          <Link to="/employer" className="hover:text-[#0d1f18] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-[#0d1f18] font-medium">Opportunity Management</span>
        </div>

        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e5e2dc]">
          <div className="flex flex-col max-w-3xl">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6b4ea6]"></span>
              ATLAS FOR EMPLOYERS · Role Management
            </span>
            <h1 className="font-headline-xl text-headline-xl text-[#0d1f18] tracking-tight">
              Manage Company Opportunities
            </h1>
            <p className="font-headline-sm text-headline-sm text-[#424845] mt-1.5 font-sans text-sm sm:text-base leading-relaxed">
              Track candidate pipeline volumes, review expressed candidate interest, and calibrate role requirement thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer/opportunities/new"
              className="px-5 py-2.5 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Create Opportunity</span>
            </Link>
          </div>
        </section>

        {toastMessage && (
          <div className="p-3 rounded-xl bg-[#d2e7dc] text-[#0d1f18] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter Bar */}
        <section className="flex items-center justify-between bg-[#f8f5ee] p-2.5 rounded-xl border border-[#e5e0d6]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0d1f18] ml-2">Filter:</span>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#0d1f18] text-white shadow-2xs'
                  : 'text-[#424845] hover:bg-[#ebe6dc]'
              }`}
            >
              All ({opportunitiesList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-[#0d1f18] text-white shadow-2xs'
                  : 'text-[#424845] hover:bg-[#ebe6dc]'
              }`}
            >
              Active ({opportunitiesList.filter((o) => o.status !== 'closed').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('closed')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'closed'
                  ? 'bg-[#0d1f18] text-white shadow-2xs'
                  : 'text-[#424845] hover:bg-[#ebe6dc]'
              }`}
            >
              Closed ({opportunitiesList.filter((o) => o.status === 'closed').length})
            </button>
          </div>

          <div className="text-xs text-[#737874] pr-2">
            Showing {displayedList.length} roles
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
                className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs hover:border-[#c8c2b7] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Role Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isClosed
                          ? 'bg-[#ebe6dc] text-[#737874]'
                          : 'bg-[#d2e7dc] text-[#0d1f18]'
                      }`}
                    >
                      {isClosed ? 'CLOSED' : 'ACTIVE'}
                    </span>
                    <span className="text-xs text-[#737874]">
                      Created {opp.postedDate}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-xl font-bold text-[#0d1f18]">
                    {opp.jobTitle}
                  </h3>

                  <div className="text-xs text-[#5a625d] flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{opp.targetRoleCategory}</span>
                    <span>•</span>
                    <span>{opp.location}</span>
                    <span>•</span>
                    <span>{opp.employmentType}</span>
                    {opp.salaryRange && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#0d1f18]">{opp.salaryRange}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Center: Match & Interest Counts */}
                <div className="flex items-center gap-4 bg-[#fbf9f4] border border-[#ebe6dc] p-4 rounded-xl shrink-0">
                  <div className="text-center px-2">
                    <span className="font-mono text-xl font-bold text-[#0d1f18] block">
                      {matchedCount}
                    </span>
                    <span className="text-[10px] text-[#737874] uppercase tracking-wider font-semibold">
                      Matched Candidates
                    </span>
                  </div>

                  <div className="h-8 w-px bg-[#e5e2dc]"></div>

                  <div className="text-center px-2">
                    <span className="font-mono text-xl font-bold text-[#6b4ea6] block">
                      {interestedCount}
                    </span>
                    <span className="text-[10px] text-[#737874] uppercase tracking-wider font-semibold">
                      Interested Candidates
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                  <Link
                    to={`/employer/opportunities/${opp.id}/matches`}
                    className="px-4 py-2 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View matches</span>
                    <span>→</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="px-3 py-1.5 rounded-lg border border-[#e5e2dc] text-[#424845] hover:bg-[#f6f2e9] text-xs font-medium transition-colors"
                      title="Preview candidate view"
                    >
                      View Role
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(opp.id, opp.status)}
                      className="px-3 py-1.5 rounded-lg border border-[#e5e2dc] text-xs font-medium text-[#737874] hover:text-[#0d1f18] hover:bg-[#f6f2e9] transition-colors"
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

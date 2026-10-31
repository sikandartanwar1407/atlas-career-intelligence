import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { MOCK_EMPLOYER_CANDIDATES } from '../data/opportunities';

export const EmployerCandidatesPage: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'match' | 'evidence'>('match');

  const candidates = useMemo(() => {
    let list = [...MOCK_EMPLOYER_CANDIDATES];

    if (roleFilter !== 'all') {
      list = list.filter((c) => c.targetRole.toLowerCase().includes(roleFilter.toLowerCase()));
    }

    if (sortBy === 'match') {
      list.sort((a, b) => b.overallMatch - a.overallMatch);
    } else {
      list.sort((a, b) => b.evidenceCount - a.evidenceCount);
    }

    return list;
  }, [roleFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-100 selection:bg-[#D8C3A5]/40 selection:text-[#18283D]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/employer" className="hover:text-[#8B6F5A] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-[#18283D] font-medium">Candidate Pipeline</span>
        </div>

        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div className="flex flex-col max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-[#8B6F5A] font-bold">
                ATLAS FOR EMPLOYERS · Demonstrated Talent
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18283D] tracking-tight">
              Candidate Capability Pipeline
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore evaluated candidates whose quantitative skill scores and verified project artifacts align with your engineering and data roles.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer/opportunities"
              className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs text-xs font-semibold transition-all flex items-center gap-2 border border-[#E5E7EB] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">work</span>
              <span>View Active Roles</span>
            </Link>
          </div>
        </section>

        {/* Sort and Filter Control Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FAF7F2]/80 p-3 rounded-xl border border-[#E5E7EB] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Sort by:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSortBy('match')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-180 cursor-pointer ${
                  sortBy === 'match'
                    ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
                }`}
              >
                Overall Alignment
              </button>
              <button
                type="button"
                onClick={() => setSortBy('evidence')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-180 cursor-pointer ${
                  sortBy === 'evidence'
                    ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
                }`}
              >
                Verified Evidence
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Target Career:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-lg text-[#18283D] focus:outline-none focus:border-[#8B6F5A]/50"
            >
              <option value="all">All Trajectories</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Business Analyst">Business Analyst</option>
            </select>
          </div>
        </section>

        {/* Candidate Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.map((cand) => {
            return (
              <article
                key={cand.id}
                className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 shadow-xl hover:border-[#8B6F5A]/60 hover:shadow-2xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all duration-200 ease-out flex flex-col justify-between space-y-4 backdrop-blur-sm group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D8C3A5]/25 border border-[#18283D]/30 font-mono text-xs font-bold text-[#8B6F5A]">
                          {cand.overallMatch}% ATLAS COMPATIBILITY
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          {cand.experienceLevel}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-[#18283D] group-hover:text-[#8B6F5A] transition-colors pt-1">
                        {cand.name}
                      </h3>

                      <div className="text-xs text-slate-400">
                        Target: <strong className="text-[#8B6F5A]">{cand.targetRole}</strong>
                      </div>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                      {cand.name.split(' ').map((p) => p[0]).join('')}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#E5E7EB]">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold block">
                      Strong alignment:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.keySkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-md bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[11px] font-medium text-[#8B6F5A] font-mono"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF7F2]/80 border border-[#E5E7EB]">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                        Evidence Proofs
                      </span>
                      <span className="font-bold text-[#18283D] text-xs flex items-center gap-1.5">
                        <span className="text-[#8B6F5A]">🛡️</span> {cand.evidenceCount} relevant projects
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5]">
                      <span className="text-[10px] text-[#8B6F5A] uppercase tracking-wider font-semibold block mb-0.5">
                        Primary Gap
                      </span>
                      <span className="font-medium text-violet-200 text-xs truncate block font-mono">
                        △ {cand.primaryDevelopmentGap}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Visibility: Active</span>
                  </span>
                  <Link
                    to={`/employer/candidates/${cand.id}`}
                    className="px-4 py-2 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold tracking-wide transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>View candidate</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {/* Privacy Note */}
        <section className="p-4 rounded-xl bg-[#FAF7F2]/60 border border-[#E5E7EB] text-xs text-slate-400 flex items-center gap-3 backdrop-blur-sm">
          <span className="material-symbols-outlined text-[#8B6F5A] text-xl shrink-0">
            privacy_tip
          </span>
          <p>
            Candidate identities and contact coordinates are gated by default. Candidate profiles shown here have granted permission to be discoverable by verified employers.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
};

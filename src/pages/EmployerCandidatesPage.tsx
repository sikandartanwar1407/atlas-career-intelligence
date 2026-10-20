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
          <span className="text-white font-medium">Candidate Pipeline</span>
        </div>

        {/* Editorial Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex flex-col max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-violet-400 font-bold">
                ATLAS FOR EMPLOYERS · Demonstrated Talent
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Candidate Capability Pipeline
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore evaluated candidates whose quantitative skill scores and verified project artifacts align with your engineering and data roles.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/employer/opportunities"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2 border border-white/10 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[16px]">work</span>
              <span>View Active Roles</span>
            </Link>
          </div>
        </section>

        {/* Sort and Filter Control Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#11182B]/80 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Sort by:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSortBy('match')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'match'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Overall Alignment
              </button>
              <button
                type="button"
                onClick={() => setSortBy('evidence')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'evidence'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
              className="px-3 py-1.5 text-xs bg-[#0D1224] border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
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
                className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4 backdrop-blur-sm group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 font-mono text-xs font-bold text-violet-300">
                          {cand.overallMatch}% ATLAS COMPATIBILITY
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          {cand.experienceLevel}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors pt-1">
                        {cand.name}
                      </h3>

                      <div className="text-xs text-slate-400">
                        Target: <strong className="text-teal-400">{cand.targetRole}</strong>
                      </div>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                      {cand.name.split(' ').map((p) => p[0]).join('')}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold block">
                      Strong alignment:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.keySkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-[11px] font-medium text-teal-300 font-mono"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#0D1224]/80 border border-white/10">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                        Evidence Proofs
                      </span>
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span className="text-teal-400">🛡️</span> {cand.evidenceCount} relevant projects
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                      <span className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold block mb-0.5">
                        Primary Gap
                      </span>
                      <span className="font-medium text-violet-200 text-xs truncate block font-mono">
                        △ {cand.primaryDevelopmentGap}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Visibility: Active</span>
                  </span>
                  <Link
                    to={`/employer/candidates/${cand.id}`}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-1 shadow-sm active:scale-[0.98]"
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
        <section className="p-4 rounded-xl bg-[#11182B]/60 border border-white/10 text-xs text-slate-400 flex items-center gap-3 backdrop-blur-sm">
          <span className="material-symbols-outlined text-violet-400 text-xl shrink-0">
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

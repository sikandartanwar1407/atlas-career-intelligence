import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { getOpportunityById, getEmployerMatches } from '../data/opportunities';

export const EmployerMatchesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sortBy, setSortBy] = useState<'match' | 'evidence' | 'skills'>('match');
  const [filterRole, setFilterRole] = useState<string>('all');

  const opportunity = useMemo(() => {
    return id ? getOpportunityById(id) : undefined;
  }, [id]);

  const candidates = useMemo(() => {
    return id ? getEmployerMatches(id) : [];
  }, [id]);

  const displayedCandidates = useMemo(() => {
    let list = [...candidates];

    if (filterRole !== 'all') {
      list = list.filter((c) => c.targetRole.toLowerCase().includes(filterRole.toLowerCase()));
    }

    if (sortBy === 'match') {
      list.sort((a, b) => b.overallMatch - a.overallMatch);
    } else if (sortBy === 'evidence') {
      list.sort((a, b) => b.evidenceCount - a.evidenceCount);
    } else if (sortBy === 'skills') {
      list.sort((a, b) => b.keySkills.length - a.keySkills.length);
    }

    return list;
  }, [candidates, sortBy, filterRole]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#737874]">
          <Link to="/employer" className="hover:text-[#0d1f18] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Portal</span>
          </Link>
          <span>/</span>
          <span className="text-[#0d1f18] font-medium">Candidate Match Pipeline</span>
        </div>

        {/* Opportunity Context Header */}
        <section className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6b4ea6]"></span>
                Evaluated Talent Pipeline
              </span>
              <h1 className="font-headline-xl text-2xl sm:text-3xl text-[#0d1f18] font-bold tracking-tight">
                {opportunity?.jobTitle || 'Role Match Pipeline'}
              </h1>
              <div className="text-xs text-[#5a625d]">
                {opportunity?.company} • {opportunity?.location} • {opportunity?.employmentType}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2 rounded-xl bg-[#f6f2e9] border border-[#e5e0d6] text-right">
                <span className="font-mono text-xl font-bold text-[#6b4ea6] block">
                  {candidates.length} Candidates
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#737874] font-semibold">
                  Matched
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Sort and Filter Control Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#f8f5ee] p-3 rounded-xl border border-[#e5e0d6]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#0d1f18]">Sort by:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSortBy('match')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'match'
                    ? 'bg-[#0d1f18] text-white shadow-2xs'
                    : 'text-[#424845] hover:bg-[#ebe6dc]'
                }`}
              >
                Overall Match
              </button>
              <button
                type="button"
                onClick={() => setSortBy('evidence')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'evidence'
                    ? 'bg-[#0d1f18] text-white shadow-2xs'
                    : 'text-[#424845] hover:bg-[#ebe6dc]'
                }`}
              >
                Evidence Proofs
              </button>
              <button
                type="button"
                onClick={() => setSortBy('skills')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'skills'
                    ? 'bg-[#0d1f18] text-white shadow-2xs'
                    : 'text-[#424845] hover:bg-[#ebe6dc]'
                }`}
              >
                Skill Breadth
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737874]">Target Goal:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-[#d6d0c4] rounded-lg focus:outline-none"
            >
              <option value="all">All Goals</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Business Analyst">Business Analyst</option>
            </select>
          </div>
        </section>

        {/* Candidate Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedCandidates.map((cand) => {
            return (
              <article
                key={cand.id}
                className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs hover:border-[#c8c2b7] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Card Header: Match % badge + Anonymized Candidate Name */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f6f2e9] border border-[#e5e0d6] font-mono text-xs font-bold text-[#6b4ea6]">
                          {cand.overallMatch}% MATCH
                        </span>
                        <span className="text-[11px] text-[#737874] uppercase tracking-wider font-semibold">
                          {cand.experienceLevel}
                        </span>
                      </div>

                      <h3 className="font-headline-sm text-xl font-bold text-[#0d1f18] pt-1">
                        {cand.name}
                      </h3>

                      <div className="text-xs text-[#5a625d]">
                        Target Trajectory:{' '}
                        <strong className="text-[#0d1f18]">{cand.targetRole}</strong>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-[#0d1f18] text-[#fcf9f3] flex items-center justify-center text-xs font-bold shrink-0">
                      {cand.name.split(' ').map((p) => p[0]).join('')}
                    </div>
                  </div>

                  {/* Key Strong Skills */}
                  <div className="space-y-1.5 pt-2 border-t border-[#f4f0e6]">
                    <span className="text-[11px] uppercase tracking-wider text-[#0d1f18] font-bold block">
                      Strong Demonstrated Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.keySkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded bg-[#f4f9f5] border border-[#d2e7dc] text-[11px] font-medium text-[#0d1f18]"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verified Evidence count & Primary development gap */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#fbf9f4] border border-[#ebe6dc]">
                      <span className="text-[10px] text-[#737874] uppercase tracking-wider font-semibold block">
                        Verified Evidence
                      </span>
                      <span className="font-bold text-[#0d1f18] text-xs">
                        🛡️ {cand.evidenceCount} verified projects
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#fcf5ff] border border-[#eaddff]">
                      <span className="text-[10px] text-[#6b4ea6] uppercase tracking-wider font-semibold block">
                        Primary Gap
                      </span>
                      <span className="font-medium text-[#25005a] text-xs truncate block">
                        △ {cand.primaryDevelopmentGap}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-[#f4f0e6] flex items-center justify-between">
                  <span className="text-[11px] text-[#737874]">
                    Profile discoverability: Active
                  </span>
                  <Link
                    to={`/employer/candidates/${cand.id}`}
                    className="px-4 py-2 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1 shadow-2xs"
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
        <section className="p-4 rounded-xl bg-white border border-[#e5e2dc] text-xs text-[#737874] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#6b4ea6] text-xl">
            privacy_tip
          </span>
          <p>
            Candidate privacy is strictly respected. Candidates only appear in this pipeline if they have enabled discovery in their ATLAS Career Visibility preferences.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
};

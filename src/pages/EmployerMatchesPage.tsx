import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { getOpportunityById, getEmployerMatches } from '../data/opportunities';
import { EmployerCandidate } from '../types/opportunities';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { EmployerApiService } from '../services/employerService';

export const EmployerMatchesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sortBy, setSortBy] = useState<'match' | 'evidence' | 'skills'>('match');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [remoteCandidates, setRemoteCandidates] = useState<EmployerCandidate[] | null>(null);

  useEffect(() => {
    if (!id) return;
    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      EmployerApiService.getOpportunityMatches(id, token).then((res) => {
        if (res.success && res.data && res.data.matches && res.data.matches.length > 0) {
          const mapped: EmployerCandidate[] = res.data.matches.map((m) => ({
            id: m.candidate_id,
            name: m.full_name,
            targetRole: m.target_role,
            experienceLevel: m.experience_level,
            overallMatch: m.overall_match,
            keySkills: m.matched_skills.length > 0 ? m.matched_skills : m.demonstrated_skills,
            evidenceCount: m.evidence_count,
            primaryDevelopmentGap: m.skill_gaps[0]
              ? `${m.skill_gaps[0].skill} (${m.skill_gaps[0].deficit}pt gap)`
              : 'None detected',
            demonstratedSkills: m.demonstrated_skills.map((s) => ({ skill: s, level: 75 })),
            verifiedEvidence: [],
            roadmapProgress: {
              currentMilestone: 'Sprint 03: Verified Competency Milestones',
              progressPercent: m.overall_match,
              completedSprints: 3,
              totalSprints: 5,
            },
            isDiscoverable: m.is_discoverable,
          }));
          setRemoteCandidates(mapped);
        }
      });
    }
  }, [id]);

  const opportunity = useMemo(() => {
    return id ? getOpportunityById(id) : undefined;
  }, [id]);

  const candidates = useMemo(() => {
    if (remoteCandidates !== null && remoteCandidates.length > 0) {
      return remoteCandidates;
    }
    return id ? getEmployerMatches(id) : [];
  }, [id, remoteCandidates]);

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
    <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/employer" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Portal</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Candidate Match Pipeline</span>
        </div>

        {/* Opportunity Context Header */}
        <section className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                <span className="text-xs uppercase tracking-widest text-violet-400 font-bold">
                  Evaluated Talent Pipeline
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
                {opportunity?.jobTitle || 'Role Match Pipeline'}
              </h1>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>{opportunity?.company}</span>
                <span>•</span>
                <span>{opportunity?.location}</span>
                <span>•</span>
                <span>{opportunity?.employmentType}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-5 py-3 rounded-xl bg-[#0D1224]/80 border border-white/10 text-right backdrop-blur-sm">
                <span className="font-mono text-2xl font-bold text-violet-400 block">
                  {candidates.length} Candidates
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Empirically Calibrated
                </span>
              </div>
            </div>
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
                Overall Match
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
                Evidence Proofs
              </button>
              <button
                type="button"
                onClick={() => setSortBy('skills')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'skills'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Skill Breadth
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Target Goal:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#0D1224] border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50"
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
                className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4 backdrop-blur-sm group"
              >
                <div className="space-y-4">
                  {/* Card Header: Match % badge + Anonymized Candidate Name */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 font-mono text-xs font-bold text-violet-300">
                          {cand.overallMatch}% MATCH
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          {cand.experienceLevel}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors pt-1">
                        {cand.name}
                      </h3>

                      <div className="text-xs text-slate-400">
                        Target Trajectory:{' '}
                        <strong className="text-teal-400">{cand.targetRole}</strong>
                      </div>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                      {cand.name.split(' ').map((p) => p[0]).join('')}
                    </div>
                  </div>

                  {/* Key Strong Skills */}
                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold block">
                      Strong Demonstrated Skills:
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

                  {/* Verified Evidence count & Primary development gap */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#0D1224]/80 border border-white/10">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                        Verified Evidence
                      </span>
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span className="text-teal-400">🛡️</span> {cand.evidenceCount} verified projects
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

                {/* Card Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Discoverable: Active</span>
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
            Candidate privacy is strictly respected. Candidates only appear in this pipeline if they have enabled discovery in their ATLAS Career Visibility preferences.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
};

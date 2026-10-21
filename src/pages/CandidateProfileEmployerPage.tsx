import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { getCandidateById } from '../data/opportunities';

export const CandidateProfileEmployerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invitationSent, setInvitationSent] = useState(false);

  const candidate = useMemo(() => {
    return id ? getCandidateById(id) : undefined;
  }, [id]);

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100">
        <EmployerHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 pt-32 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Candidate Record Not Found
          </h2>
          <p className="text-xs text-slate-400">
            This candidate record may have been removed or set to private.
          </p>
          <Link
            to="/employer"
            className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-sm"
          >
            ← Return to Employer Portal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSendInterviewInvite = () => {
    setInvitationSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/employer" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Portal</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{candidate.name} Candidate Profile</span>
        </div>

        {/* Candidate Dossier Hero */}
        <section className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                {candidate.name.split(' ').map((p) => p[0]).join('')}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-300 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/30">
                    {candidate.experienceLevel} Candidate
                  </span>
                  <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                    <span>✓</span> Verified ATLAS Profile
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {candidate.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-400">
                  Target Trajectory: <strong className="text-teal-400">{candidate.targetRole}</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              {invitationSent ? (
                <div className="px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-2 backdrop-blur-sm animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>Capability Interview Request Sent</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendInterviewInvite}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span>Contact for Interview</span>
                </button>
              )}

              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>Discoverability preference: Public</span>
              </span>
            </div>
          </div>
        </section>

        {/* 2-Column Detail Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Demonstrated Skills & Verified Evidence (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Demonstrated Skills Breakdown */}
            <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">
                  Calibrated Competencies
                </h2>
                <span className="text-xs text-slate-400">
                  Empirically assessed against role benchmarks
                </span>
              </div>

              <div className="space-y-4">
                {candidate.demonstratedSkills.map((sk) => (
                  <div key={sk.skill} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white font-mono">{sk.skill}</span>
                      <span className="font-mono font-bold text-violet-400">{sk.level}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0D1224] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all duration-300"
                        style={{ width: `${sk.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Project Evidence */}
            <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Verified Evidence Locker
                  </h2>
                  <span className="text-xs text-slate-400">
                    Artifacts uploaded and validated in candidate portfolio
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 font-bold text-xs font-mono">
                  {candidate.verifiedEvidence.length} Artifacts
                </span>
              </div>

              <div className="space-y-3">
                {candidate.verifiedEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-[#0D1224]/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {ev.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-300 font-semibold font-mono">
                          Verified
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Associated Skill: <strong className="text-violet-300 font-mono">{ev.skill}</strong> • {ev.type}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Validated {ev.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Roadmap Velocity & Privacy Shield (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Roadmap Velocity Card */}
            <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-sm">
              <span className="text-[10px] text-violet-400 uppercase tracking-widest font-bold block">
                Continuous Learning Velocity
              </span>
              <h3 className="text-base font-bold text-white">
                Career Roadmap Progress
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sprint Completion:</span>
                  <span className="font-mono font-bold text-teal-400">
                    {candidate.roadmapProgress.completedSprints} of {candidate.roadmapProgress.totalSprints} Sprints
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#0D1224] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${candidate.roadmapProgress.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D1224]/80 border border-white/10 text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Active Sprint Milestone:
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {candidate.roadmapProgress.currentMilestone}
                </span>
              </div>
            </div>

            {/* Privacy Policy Guarantee */}
            <div className="bg-[#11182B]/60 border border-white/10 rounded-2xl p-6 shadow-xl space-y-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-400 text-xl">
                  verified_user
                </span>
                <h4 className="text-sm font-bold text-white">
                  ATLAS Candidate Privacy Standard
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Candidate contact coordinates are securely gated. Reaching out through ATLAS triggers a capability interview invitation sent to the candidate's verified address.
              </p>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

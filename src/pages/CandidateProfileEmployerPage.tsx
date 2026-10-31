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
      <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-100">
        <EmployerHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 pt-32 text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#18283D]">
            Candidate Record Not Found
          </h2>
          <p className="text-xs text-slate-400">
            This candidate record may have been removed or set to private.
          </p>
          <Link
            to="/employer"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold transition-all shadow-sm"
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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-100 selection:bg-[#D8C3A5]/40 selection:text-[#18283D]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/employer" className="hover:text-[#8B6F5A] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Portal</span>
          </Link>
          <span>/</span>
          <span className="text-[#18283D] font-medium">{candidate.name} Candidate Profile</span>
        </div>

        {/* Candidate Dossier Hero */}
        <section className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                {candidate.name.split(' ').map((p) => p[0]).join('')}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8B6F5A] bg-[#D8C3A5]/25 px-2.5 py-0.5 rounded-full border border-[#18283D]/30">
                    {candidate.experienceLevel} Candidate
                  </span>
                  <span className="text-xs text-[#8B6F5A] font-semibold flex items-center gap-1">
                    <span>✓</span> Verified ATLAS Profile
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18283D]">
                  {candidate.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-400">
                  Target Trajectory: <strong className="text-[#8B6F5A]">{candidate.targetRole}</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              {invitationSent ? (
                <div className="px-4 py-2.5 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] text-xs font-semibold flex items-center gap-2 backdrop-blur-sm animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>Capability Interview Request Sent</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendInterviewInvite}
                  className="px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-sm"
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
            <div className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#18283D]">
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
                      <span className="font-bold text-[#18283D] font-mono">{sk.skill}</span>
                      <span className="font-mono font-bold text-[#8B6F5A]">{sk.level}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5E7EB]">
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
            <div className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-lg font-bold text-[#18283D]">
                    Verified Evidence Locker
                  </h2>
                  <span className="text-xs text-slate-400">
                    Artifacts uploaded and validated in candidate portfolio
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#18283D]/30 text-[#8B6F5A] font-bold text-xs font-mono">
                  {candidate.verifiedEvidence.length} Artifacts
                </span>
              </div>

              <div className="space-y-3">
                {candidate.verifiedEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-[#FAF7F2]/80 border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#18283D]">
                          {ev.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] text-[#8B6F5A] font-semibold font-mono">
                          Verified
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Associated Skill: <strong className="text-[#8B6F5A] font-mono">{ev.skill}</strong> • {ev.type}
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
            <div className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-sm">
              <span className="text-[10px] text-[#8B6F5A] uppercase tracking-widest font-bold block">
                Continuous Learning Velocity
              </span>
              <h3 className="text-base font-bold text-[#18283D]">
                Career Roadmap Progress
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sprint Completion:</span>
                  <span className="font-mono font-bold text-[#8B6F5A]">
                    {candidate.roadmapProgress.completedSprints} of {candidate.roadmapProgress.totalSprints} Sprints
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5E7EB]">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${candidate.roadmapProgress.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2]/80 border border-[#E5E7EB] text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Active Sprint Milestone:
                </span>
                <span className="font-semibold text-[#18283D] mt-0.5 block">
                  {candidate.roadmapProgress.currentMilestone}
                </span>
              </div>
            </div>

            {/* Privacy Policy Guarantee */}
            <div className="bg-[#FAF7F2]/60 border border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B6F5A] text-xl">
                  verified_user
                </span>
                <h4 className="text-sm font-bold text-[#18283D]">
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

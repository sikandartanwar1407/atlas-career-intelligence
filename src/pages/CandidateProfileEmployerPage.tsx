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
      <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
        <EmployerHeader />
        <main className="flex-1 max-w-xl mx-auto px-4 pt-32 text-center space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#0d1f18]">
            Candidate Record Not Found
          </h2>
          <p className="text-xs text-[#5a625d]">
            This candidate record may have been removed or set to private.
          </p>
          <Link
            to="/employer"
            className="inline-block px-5 py-2.5 rounded-lg bg-[#0d1f18] text-white text-xs font-semibold"
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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#737874]">
          <Link to="/employer" className="hover:text-[#0d1f18] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Portal</span>
          </Link>
          <span>/</span>
          <span className="text-[#0d1f18] font-medium">{candidate.name} Candidate Profile</span>
        </div>

        {/* Candidate Dossier Hero */}
        <section className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0d1f18] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                {candidate.name.split(' ').map((p) => p[0]).join('')}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-xs font-bold uppercase tracking-wider text-[#6b4ea6] bg-[#f6f2e9] px-2.5 py-0.5 rounded-full border border-[#e5e0d6]">
                    {candidate.experienceLevel} Candidate
                  </span>
                  <span className="text-xs text-[#2e7d32] font-semibold flex items-center gap-1">
                    <span>✓</span> Verified ATLAS Profile
                  </span>
                </div>

                <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[#0d1f18]">
                  {candidate.name}
                </h1>

                <p className="text-xs sm:text-sm text-[#5a625d]">
                  Target Trajectory: <strong className="text-[#0d1f18]">{candidate.targetRole}</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              {invitationSent ? (
                <div className="px-4 py-2.5 rounded-lg bg-[#d2e7dc] border border-[#b2d7c4] text-[#0d1f18] text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2e7d32]"></span>
                  <span>Capability Interview Request Sent</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendInterviewInvite}
                  className="px-5 py-2.5 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span>Contact for Interview</span>
                </button>
              )}

              <span className="text-[11px] text-[#737874]">
                Candidate discoverability preference: Public
              </span>
            </div>
          </div>
        </section>

        {/* 2-Column Detail Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Demonstrated Skills & Verified Evidence (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Demonstrated Skills Breakdown */}
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f4f0e6]">
                <h2 className="font-serif text-lg font-bold text-[#0d1f18]">
                  Calibrated Competencies
                </h2>
                <span className="text-xs text-[#737874]">
                  Empirically assessed against role benchmarks
                </span>
              </div>

              <div className="space-y-4">
                {candidate.demonstratedSkills.map((sk) => (
                  <div key={sk.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0d1f18]">{sk.skill}</span>
                      <span className="font-mono font-bold text-[#6b4ea6]">{sk.level}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#ebe6dc] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6b4ea6] rounded-full transition-all duration-300"
                        style={{ width: `${sk.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Project Evidence */}
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f4f0e6]">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#0d1f18]">
                    Verified Evidence Locker
                  </h2>
                  <span className="text-xs text-[#5a625d]">
                    Artifacts uploaded and validated in candidate portfolio
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#f6f2e9] text-[#0d1f18] font-bold text-xs">
                  {candidate.verifiedEvidence.length} Artifacts
                </span>
              </div>

              <div className="space-y-3">
                {candidate.verifiedEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-[#fbf9f4] border border-[#ebe6dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0d1f18]">
                          {ev.title}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#f4f9f5] border border-[#d2e7dc] text-[10px] text-[#2e7d32] font-semibold">
                          Verified
                        </span>
                      </div>
                      <div className="text-xs text-[#5a625d]">
                        Associated Skill: <strong className="text-[#0d1f18]">{ev.skill}</strong> • {ev.type}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-[#737874] block">
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
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs space-y-4">
              <span className="text-[10px] text-[#6b4ea6] uppercase tracking-widest font-bold block">
                Continuous Learning Velocity
              </span>
              <h3 className="font-serif text-base font-bold text-[#0d1f18]">
                Career Roadmap Progress
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5a625d]">Sprint Completion:</span>
                  <span className="font-mono font-bold text-[#0d1f18]">
                    {candidate.roadmapProgress.completedSprints} of {candidate.roadmapProgress.totalSprints} Sprints
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#ebe6dc] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2e7d32] rounded-full"
                    style={{ width: `${candidate.roadmapProgress.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#fbf9f4] border border-[#ebe6dc] text-xs">
                <span className="text-[10px] text-[#737874] uppercase tracking-wider font-semibold block">
                  Active Sprint Milestone:
                </span>
                <span className="font-semibold text-[#0d1f18] mt-0.5 block">
                  {candidate.roadmapProgress.currentMilestone}
                </span>
              </div>
            </div>

            {/* Privacy Policy Guarantee */}
            <div className="bg-[#f6f2e9] border border-[#e5e0d6] rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6b4ea6] text-xl">
                  verified_user
                </span>
                <h4 className="font-serif text-sm font-bold text-[#0d1f18]">
                  ATLAS Candidate Privacy Standard
                </h4>
              </div>
              <p className="text-xs text-[#5a625d] leading-relaxed">
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

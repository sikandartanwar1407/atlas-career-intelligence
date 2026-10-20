import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { useAtlas } from '../context/AtlasContext';
import { Footer } from '../components/Footer';

export const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchAccount, employerProfile } = useAccount();
  const { hasProfile } = useAtlas();

  const handleSelectCandidate = () => {
    switchAccount('candidate');
    if (hasProfile) {
      navigate('/diagnosis');
    } else {
      navigate('/onboarding');
    }
  };

  const handleSelectEmployer = () => {
    switchAccount('employer');
    if (employerProfile && employerProfile.companyName) {
      navigate('/employer');
    } else {
      navigate('/employer/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9] relative overflow-hidden">
      {/* Clean Header Bar */}
      <header className="h-16 border-b border-white/[0.08] bg-[#080B16]/90 backdrop-blur-xl px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#11182B] border border-violet-500/30 shadow-sm flex items-center justify-center transition-colors group-hover:border-violet-500/50">
            <div className="w-3.5 h-3.5 rounded-full border border-violet-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
            </div>
          </div>
          <span className="font-sans text-lg text-white font-extrabold tracking-tight">
            ATLAS
          </span>
        </Link>
        <div className="text-xs font-mono text-[#94A3B8]">
          Autonomous Career Intelligence
        </div>
      </header>

      {/* Main Role Selection Content */}
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col justify-center">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-violet-400 inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
            Account Architecture · Role Selection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How will you use ATLAS?
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Choose your dedicated workspace. Candidates calibrate their competency and discover matched opportunities; employers evaluate verified talent against role requirements.
          </p>
        </div>

        {/* Two Dedicated Account Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* Option 1: CANDIDATE */}
          <div
            onClick={handleSelectCandidate}
            className="glass-panel-elevated rounded-2xl p-7 sm:p-8 border border-white/10 hover:border-violet-500/50 shadow-xl hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group space-y-6 card-interactive"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined text-2xl">person</span>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-violet-300 bg-violet-500/15 px-2.5 py-1 rounded-full border border-violet-500/30">
                  Candidate
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-white group-hover:text-violet-300 transition-colors">
                  I’m a Candidate
                </h2>
                <p className="font-medium text-xs sm:text-sm text-violet-200/80">
                  Build my career intelligence profile.
                </p>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Calibrate readiness for your target role, diagnose competency gaps against industry thresholds, assemble verified project evidence, and receive transparent opportunity matches.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/[0.08] text-xs text-[#CBD5E1]">
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Calibrated competency assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Actionable sprint roadmap & gap triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Verified Evidence Locker & matching feed</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-violet-600 group-hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Continue as Candidate</span>
              <span className="text-sm">→</span>
            </button>
          </div>

          {/* Option 2: EMPLOYER */}
          <div
            onClick={handleSelectEmployer}
            className="glass-panel-elevated rounded-2xl p-7 sm:p-8 border border-white/10 hover:border-teal-500/50 shadow-xl hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group space-y-6 card-interactive"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-[#080B16] transition-all shadow-sm">
                  <span className="material-symbols-outlined text-2xl">domain</span>
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-teal-300 bg-teal-500/15 px-2.5 py-1 rounded-full border border-teal-500/30">
                  Employer
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-white group-hover:text-teal-300 transition-colors">
                  I’m an Employer
                </h2>
                <p className="font-medium text-xs sm:text-sm text-teal-200/80">
                  Discover verified talent matching role benchmarks.
                </p>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Post roles calibrated around required skills, set quantitative threshold benchmarks, review peer-evaluated project artifacts, and interview verified talent directly.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/[0.08] text-xs text-[#CBD5E1]">
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Skill-calibrated opportunity posting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Empirical candidate match pipelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Verified project evidence & privacy controls</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-teal-500 group-hover:bg-teal-400 text-[#080B16] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Continue as Employer</span>
              <span className="text-sm">→</span>
            </button>
          </div>

        </div>

        {/* Footer note */}
        <div className="text-center pt-8 text-xs font-mono text-[#64748B]">
          <span>You can switch between Candidate and Employer viewpoints at any time from your account menu.</span>
        </div>

      </main>

      <Footer />
    </div>
  );
};

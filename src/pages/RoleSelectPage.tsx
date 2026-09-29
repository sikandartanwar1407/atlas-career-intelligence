import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { useAtlas } from '../context/AtlasContext';
import { Footer } from '../components/Footer';

export const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchAccount, isEmployerVerified, employerProfile } = useAccount();
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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      {/* Clean Header Bar */}
      <header className="h-16 border-b border-[#e5e2dc] bg-[#fcf9f3]/95 px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#0d1f18] flex items-center justify-center relative bg-white shadow-xs">
            <div className="w-4 h-4 rounded-full border border-dashed border-[#6b4ea6] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d1f18]"></div>
            </div>
          </div>
          <span className="font-headline-sm text-headline-sm text-[#0d1f18] tracking-tight font-medium">
            ATLAS
          </span>
        </Link>
        <div className="text-xs text-[#737874]">
          Empirical Capability Platform
        </div>
      </header>

      {/* Main Role Selection Content */}
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col justify-center">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
          <span className="font-label-sm text-xs font-semibold uppercase tracking-widest text-[#6b4ea6] inline-block">
            Account Architecture · Role Selection
          </span>
          <h1 className="font-headline-xl text-3xl sm:text-4xl text-[#0d1f18] font-bold tracking-tight">
            How will you use ATLAS?
          </h1>
          <p className="font-headline-sm text-[#424845] text-sm sm:text-base leading-relaxed">
            Choose your dedicated workspace. Candidates calibrate their competency and discover matched opportunities; employers evaluate verified talent against role requirements.
          </p>
        </div>

        {/* Two Dedicated Account Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* Option 1: CANDIDATE */}
          <div
            onClick={handleSelectCandidate}
            className="bg-white border-2 border-[#e5e2dc] hover:border-[#6b4ea6] rounded-2xl p-7 sm:p-8 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#f6f2e9] border border-[#e5e0d6] flex items-center justify-center text-[#6b4ea6] group-hover:bg-[#6b4ea6] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">person</span>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#6b4ea6] bg-[#fbf9f4] px-2.5 py-1 rounded-full border border-[#ebe6dc]">
                  Candidate
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl font-bold text-[#0d1f18] group-hover:text-[#6b4ea6] transition-colors">
                  I’m a Candidate
                </h2>
                <p className="font-medium text-xs sm:text-sm text-[#0d1f18]">
                  Build my career intelligence profile.
                </p>
              </div>

              <p className="text-xs text-[#5a625d] leading-relaxed">
                Calibrate readiness for your target role, diagnose competency gaps against industry thresholds, assemble verified project evidence, and receive transparent opportunity matches.
              </p>

              <div className="space-y-2 pt-2 border-t border-[#f4f0e6] text-xs text-[#424845]">
                <div className="flex items-center gap-2">
                  <span className="text-[#2e7d32] font-bold">✓</span>
                  <span>Calibrated competency assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2e7d32] font-bold">✓</span>
                  <span>Actionable sprint roadmap & gap triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2e7d32] font-bold">✓</span>
                  <span>Verified Evidence Locker & matching feed</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-[#0d1f18] group-hover:bg-[#6b4ea6] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue as Candidate</span>
              <span className="text-sm">→</span>
            </button>
          </div>

          {/* Option 2: EMPLOYER */}
          <div
            onClick={handleSelectEmployer}
            className="bg-white border-2 border-[#e5e2dc] hover:border-[#0d1f18] rounded-2xl p-7 sm:p-8 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#f6f2e9] border border-[#e5e0d6] flex items-center justify-center text-[#0d1f18] group-hover:bg-[#0d1f18] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">domain</span>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#0d1f18] bg-[#fbf9f4] px-2.5 py-1 rounded-full border border-[#ebe6dc]">
                  Employer
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl font-bold text-[#0d1f18]">
                  I’m an Employer
                </h2>
                <p className="font-medium text-xs sm:text-sm text-[#0d1f18]">
                  Discover candidates whose demonstrated capabilities match your opportunities.
                </p>
              </div>

              <p className="text-xs text-[#5a625d] leading-relaxed">
                Post roles calibrated around required skills, set quantitative threshold benchmarks, review peer-evaluated project artifacts, and interview verified talent directly.
              </p>

              <div className="space-y-2 pt-2 border-t border-[#f4f0e6] text-xs text-[#424845]">
                <div className="flex items-center gap-2">
                  <span className="text-[#2e7d32] font-bold">✓</span>
                  <span>Skill-calibrated opportunity posting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2e7d32] font-bold">✓</span>
                  <span>Empirical candidate match pipelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2e7d32] font-bold">✓</span>
                  <span>Verified project evidence & privacy controls</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-[#0d1f18] group-hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue as Employer</span>
              <span className="text-sm">→</span>
            </button>
          </div>

        </div>

        {/* Footer note */}
        <div className="text-center pt-8 text-xs text-[#737874]">
          <span>You can switch between Candidate and Employer viewpoints at any time from your account menu.</span>
        </div>

      </main>

      <Footer />
    </div>
  );
};

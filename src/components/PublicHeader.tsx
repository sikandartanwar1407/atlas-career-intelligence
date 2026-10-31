import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';

export const PublicHeader: React.FC = () => {
  const { state, hasProfile, loadDemoProfile } = useAtlas();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignInAction = () => {
    if (hasProfile) {
      navigate('/diagnosis');
    } else {
      navigate('/login');
    }
  };

  const handleLoadDemo = () => {
    loadDemoProfile();
    setShowSignInModal(false);
    navigate('/diagnosis');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#E5E7EB] shadow-[0_4px_20px_rgba(24,40,61,0.06)]">
        <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 focus:outline-none shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#18283D]/30 shadow-sm flex items-center justify-center transition-colors group-hover:border-[#18283D]/50">
              <div className="w-4 h-4 rounded-full border border-[#18283D]/80 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-xl text-[#18283D] font-extrabold tracking-tight">
                ATLAS
              </span>
              <span className="text-[9px] font-mono text-[#6B7280] tracking-widest uppercase">
                Career Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] hover:text-[#18283D] transition-colors"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('career-paths')}
              className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] hover:text-[#18283D] transition-colors"
            >
              Career paths
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('why-atlas')}
              className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] hover:text-[#18283D] transition-colors"
            >
              Why ATLAS
            </button>
            <Link
              to="/employer"
              className="text-xs font-semibold uppercase tracking-wider text-[#8B6F5A] hover:text-[#18283D] transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]"></span>
              <span>For Employers</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={handleSignInAction}
              className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] hover:text-[#18283D] px-3 py-2 rounded-lg hover:bg-[#D8C3A5]/20 transition-colors"
            >
              {hasProfile ? 'Resume Workspace' : 'Sign in'}
            </button>

            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all duration-180 shadow-sm border border-transparent btn-interactive"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/onboarding"
              className="px-3 py-1.5 rounded-lg bg-[#18283D] text-[#FAF7F2] text-[11px] font-semibold uppercase tracking-wider shadow-sm"
            >
              Profile →
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:-translate-y-0.5 rounded-xl border border-[#E5E7EB] transition-all"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-b border-[#E5E7EB] px-4 pt-3 pb-6 space-y-4 animate-fade-in-down shadow-2xl">
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('career-paths')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40"
              >
                Career paths
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('why-atlas')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40"
              >
                Why ATLAS
              </button>
              <Link
                to="/employer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#8B6F5A] hover:bg-[#D8C3A5]/20"
              >
                For Employers →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignInAction();
                }}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#8B6F5A] hover:bg-[#D8C3A5]/20"
              >
                {hasProfile ? 'Resume Workspace →' : 'Sign in to ATLAS →'}
              </button>
            </div>

            <div className="pt-2 border-t border-[#E5E7EB]">
              <Link
                to="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-transparent transition-all duration-180"
              >
                <span>Create my profile</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18283D]/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel-elevated rounded-2xl border border-[#E5E7EB] shadow-xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-2xl font-bold text-[#18283D] tracking-tight">Sign in to ATLAS</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">Resume your calibrated career workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="text-[#6B7280] hover:text-[#18283D] p-1 rounded-lg hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {hasProfile ? (
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-2">
                <span className="text-[11px] font-mono text-[#6B7280] uppercase tracking-wider font-semibold block">
                  Active Local Profile Detected:
                </span>
                <div className="font-bold text-lg text-[#18283D]">{state.profile.fullName}</div>
                <div className="text-xs text-[#8B6F5A]">Target Role: {state.targetRole}</div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignInModal(false);
                    navigate('/diagnosis');
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider shadow-sm border border-transparent transition-all duration-180"
                >
                  Enter Workspace as {state.profile.fullName.split(' ')[0]} →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  No existing candidate profile was found on this device. Create your profile to establish your personalized career goal, competency assessment, and roadmap.
                </p>

                <div className="space-y-2.5 pt-2">
                  <Link
                    to="/onboarding"
                    onClick={() => setShowSignInModal(false)}
                    className="w-full py-3 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-transparent transition-all duration-180"
                  >
                    <span>Build new career profile</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLoadDemo}
                    className="w-full py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] active:translate-y-0 text-[#18283D] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-180"
                  >
                    <span>⚡ Explore with Demo Profile</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#E5E7EB] text-center">
              <span className="text-[11px] font-mono text-[#6B7280]">
                ATLAS saves your calibrated journey locally in this browser.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

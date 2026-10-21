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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080B16]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 focus:outline-none shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#11182B] border border-violet-500/30 shadow-sm flex items-center justify-center transition-colors group-hover:border-violet-500/50">
              <div className="w-4 h-4 rounded-full border border-violet-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-xl text-white font-extrabold tracking-tight">
                ATLAS
              </span>
              <span className="text-[9px] font-mono text-[#94A3B8] tracking-widest uppercase">
                Career Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white transition-colors"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('career-paths')}
              className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white transition-colors"
            >
              Career paths
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('why-atlas')}
              className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white transition-colors"
            >
              Why ATLAS
            </button>
            <Link
              to="/employer"
              className="text-xs font-semibold uppercase tracking-wider text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              <span>For Employers</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={handleSignInAction}
              className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1] hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              {hasProfile ? 'Resume Workspace' : 'Sign in'}
            </button>

            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm btn-interactive"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/onboarding"
              className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[11px] font-semibold uppercase tracking-wider shadow-sm"
            >
              Profile →
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#94A3B8] hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/5"
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
          <div className="md:hidden bg-[#0D1224] border-b border-white/10 px-4 pt-3 pb-6 space-y-4 animate-fade-in-down shadow-2xl">
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#CBD5E1] hover:text-white hover:bg-white/[0.04]"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('career-paths')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#CBD5E1] hover:text-white hover:bg-white/[0.04]"
              >
                Career paths
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('why-atlas')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#CBD5E1] hover:text-white hover:bg-white/[0.04]"
              >
                Why ATLAS
              </button>
              <Link
                to="/employer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-teal-400 hover:bg-teal-500/10"
              >
                For Employers →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignInAction();
                }}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-violet-400 hover:bg-violet-500/10"
              >
                {hasProfile ? 'Resume Workspace →' : 'Sign in to ATLAS →'}
              </button>
            </div>

            <div className="pt-2 border-t border-white/[0.08]">
              <Link
                to="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel-elevated rounded-2xl border border-white/10 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Sign in to ATLAS</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Resume your calibrated career workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/[0.04]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {hasProfile ? (
              <div className="p-4 rounded-xl bg-[#11182B] border border-white/10 space-y-2">
                <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider font-semibold block">
                  Active Local Profile Detected:
                </span>
                <div className="font-bold text-lg text-white">{state.profile.fullName}</div>
                <div className="text-xs text-violet-300">Target Role: {state.targetRole}</div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignInModal(false);
                    navigate('/diagnosis');
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                >
                  Enter Workspace as {state.profile.fullName.split(' ')[0]} →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  No existing candidate profile was found on this device. Create your profile to establish your personalized career goal, competency assessment, and roadmap.
                </p>

                <div className="space-y-2.5 pt-2">
                  <Link
                    to="/onboarding"
                    onClick={() => setShowSignInModal(false)}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <span>Build new career profile</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLoadDemo}
                    className="w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>⚡ Explore with Demo Profile</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/[0.08] text-center">
              <span className="text-[11px] font-mono text-[#64748B]">
                ATLAS saves your calibrated journey locally in this browser.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

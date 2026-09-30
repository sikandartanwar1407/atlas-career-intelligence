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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcf9f3]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(13,31,24,0.04)] border-b border-[#e5e2dc]/60">
        <div className="h-18 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none shrink-0 group">
            <div className="w-8 h-8 rounded-full border border-[#0d1f18] flex items-center justify-center relative bg-white shadow-xs group-hover:border-[#6b4ea6] transition-colors">
              <div className="w-4 h-4 rounded-full border border-dashed border-[#6b4ea6] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d1f18]"></div>
              </div>
            </div>
            <span className="font-headline-sm text-headline-sm text-[#0d1f18] tracking-tight font-medium">
              ATLAS
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-semibold uppercase tracking-wider text-[#424845] hover:text-[#0d1f18] transition-colors"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('career-paths')}
              className="text-xs font-semibold uppercase tracking-wider text-[#424845] hover:text-[#0d1f18] transition-colors"
            >
              Career paths
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('why-atlas')}
              className="text-xs font-semibold uppercase tracking-wider text-[#424845] hover:text-[#0d1f18] transition-colors"
            >
              Why ATLAS
            </button>
            <Link
              to="/employer"
              className="text-xs font-semibold uppercase tracking-wider text-[#6b4ea6] hover:text-[#503780] transition-colors"
            >
              For Employers
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={handleSignInAction}
              className="text-xs font-semibold uppercase tracking-wider text-[#424845] hover:text-[#0d1f18] px-3 py-2 rounded-md hover:bg-[#f6f3ed] transition-colors"
            >
              {hasProfile ? 'Resume Workspace' : 'Sign in'}
            </button>

            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Create my profile</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/onboarding"
              className="px-3 py-1.5 rounded bg-[#0d1f18] text-white text-[11px] font-semibold uppercase tracking-wider"
            >
              Profile →
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0d1f18] hover:bg-[#ebe8e2] rounded"
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
          <div className="md:hidden bg-[#fcf9f3] border-b border-[#e5e2dc] px-4 pt-3 pb-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 px-3 rounded text-sm font-semibold text-[#0d1f18] hover:bg-[#f6f3ed]"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('career-paths')}
                className="text-left py-2 px-3 rounded text-sm font-semibold text-[#0d1f18] hover:bg-[#f6f3ed]"
              >
                Career paths
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('why-atlas')}
                className="text-left py-2 px-3 rounded text-sm font-semibold text-[#0d1f18] hover:bg-[#f6f3ed]"
              >
                Why ATLAS
              </button>
              <Link
                to="/employer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2 px-3 rounded text-sm font-semibold text-[#6b4ea6] hover:bg-[#f6f3ed]"
              >
                For Employers →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignInAction();
                }}
                className="text-left py-2 px-3 rounded text-sm font-semibold text-[#0d1f18] hover:bg-[#f6f3ed]"
              >
                {hasProfile ? 'Resume Workspace →' : 'Sign in to ATLAS →'}
              </button>
            </div>

            <div className="pt-2 border-t border-[#e5e2dc]">
              <Link
                to="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-lg bg-[#0d1f18] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1f18]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#e5e2dc] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0d1f18]">Sign in to ATLAS</h3>
                <p className="text-xs text-[#737874] mt-0.5">Resume your calibrated career workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className="text-[#737874] hover:text-[#0d1f18] p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {hasProfile ? (
              <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] space-y-2">
                <span className="text-[11px] text-[#737874] uppercase tracking-wider font-semibold block">
                  Active Local Profile Detected:
                </span>
                <div className="font-bold text-base text-[#0d1f18]">{state.profile.fullName}</div>
                <div className="text-xs text-[#424845]">Target Role: {state.targetRole}</div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignInModal(false);
                    navigate('/diagnosis');
                  }}
                  className="w-full mt-3 py-2.5 rounded bg-[#0d1f18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#22382f]"
                >
                  Enter Workspace as {state.profile.fullName.split(' ')[0]} →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#424845] leading-relaxed">
                  No existing candidate profile was found on this device. Create your profile to establish your personalized career goal, competency assessment, and roadmap.
                </p>

                <div className="space-y-2.5 pt-2">
                  <Link
                    to="/onboarding"
                    onClick={() => setShowSignInModal(false)}
                    className="w-full py-3 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Build new career profile</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLoadDemo}
                    className="w-full py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] hover:bg-[#f6f3ed] text-[#0d1f18] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>⚡ Explore with Demo Profile</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#f1eee7] text-center">
              <span className="text-[11px] text-[#737874]">
                ATLAS saves your calibrated journey locally in this browser.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { useAccount } from '../context/AccountContext';

export const Header: React.FC = () => {
  const { state, hasProfile, careerReadiness, resetAssessment, resetAtlas } = useAtlas();
  const { switchAccount } = useAccount();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Application sections
  const navLinks = [
    { to: '/diagnosis', label: 'Overview', icon: 'dashboard' },
    { to: '/skill-gaps', label: 'Skill Gaps', icon: 'tune' },
    { to: '/resources', label: 'Resources', icon: 'auto_stories' },
    { to: '/career-roadmap', label: 'Roadmap', icon: 'timeline' },
    { to: '/evidence', label: 'Evidence', icon: 'lock' },
    { to: '/opportunities', label: 'Opportunities', icon: 'work' },
    { to: '/career-map', label: 'Career Map', icon: 'explore' },
  ];

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'AT';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleRetakeAssessment = () => {
    resetAssessment();
    setProfileDropdownOpen(false);
    navigate('/assessment');
  };

  const handleResetData = () => {
    resetAtlas();
    setProfileDropdownOpen(false);
    navigate('/onboarding');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080B16]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: ATLAS Logo & Workspace Identifier */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none group">
            {/* Brand Mark */}
            <div className="w-8 h-8 rounded-xl bg-[#11182B] border border-violet-500/30 shadow-sm flex items-center justify-center transition-colors group-hover:border-violet-500/50">
              <div className="w-3.5 h-3.5 rounded-full border border-violet-400/80 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg text-white font-extrabold tracking-tight">
                ATLAS
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-mono text-violet-300 font-semibold uppercase tracking-wider">
                Candidate
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Core Application Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === '/career-roadmap' && location.pathname.startsWith('/roadmap/')) ||
              (item.to === '/opportunities' && location.pathname.startsWith('/opportunities/'));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-violet-600/20 text-white font-semibold border border-violet-500/40'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Readiness Indicator & User Profile Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Assessment Prompt CTA for Unassessed Candidates */}
          {hasProfile && !state.assessmentCompleted && (
            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all"
              title="Take dynamic role competency assessment"
            >
              <span className="material-symbols-outlined text-[15px]">quiz</span>
              <span className="hidden sm:inline">Start Assessment</span>
              <span className="sm:hidden">Assess</span>
            </Link>
          )}

          {/* Readiness Score Capsule */}
          <Link
            to={hasProfile ? '/diagnosis' : '/onboarding'}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11182B] border border-white/10 hover:border-violet-500/30 text-xs transition-all shadow-sm group"
            title="Calibrated Career Readiness"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] group-hover:text-white transition-colors">
              Readiness
            </span>
            <span className="font-bold text-teal-400 font-mono text-xs shadow-xs">
              {hasProfile ? `${careerReadiness}%` : '—'}
            </span>
          </Link>

          {/* User Profile Capsule Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-[#11182B] border border-white/10 hover:border-violet-500/40 hover:bg-[#172039] transition-all group focus:outline-none"
              aria-label="User account and profile menu"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {getInitials(state.profile?.fullName)}
              </div>
              <span className="text-xs font-medium text-white hidden md:inline max-w-[120px] truncate">
                {state.profile?.fullName ? state.profile.fullName.split(' ')[0] : (hasProfile ? 'User' : 'Get Started')}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#94A3B8] group-hover:text-white transition-colors">
                {profileDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Profile Menu Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0D1224] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 z-50 text-xs animate-scale-in origin-top-right backdrop-blur-2xl">
                <div className="px-4 py-3 border-b border-white/[0.08]">
                  <div className="font-semibold text-sm text-white truncate">
                    {state.profile?.fullName || 'Anonymous Candidate'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {state.profile?.email || state.profile?.college || 'ATLAS Career Profile'}
                  </div>
                  {state.targetRole && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-[10px] font-mono font-semibold text-violet-300">
                      <span>Target:</span>
                      <span className="text-white">{state.targetRole}</span>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-violet-400">account_circle</span>
                    <span>View Profile & Dossier</span>
                  </Link>

                  <Link
                    to="/onboarding"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-teal-400">tune</span>
                    <span>Edit Profile & Goal</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleRetakeAssessment}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-indigo-400">assignment</span>
                    <span>{state.assessmentCompleted ? 'Retake Assessment' : 'Start Assessment'}</span>
                  </button>

                  <Link
                    to="/reassessment"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-cyan-400">history</span>
                    <span>Reassessment & Progress</span>
                  </Link>

                  <div className="border-t border-white/[0.06] my-1"></div>

                  <Link
                    to="/employer"
                    onClick={() => {
                      switchAccount('employer');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-2 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition-colors font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                      <span>Switch to Employer View</span>
                    </div>
                    <span>→</span>
                  </Link>

                  <Link
                    to="/role-select"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span>Account Role Select</span>
                  </Link>
                </div>

                <div className="border-t border-white/[0.08] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset ATLAS Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors border border-white/5"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D1224] border-b border-white/10 px-6 py-4 space-y-3 animate-fade-in-down shadow-2xl">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#11182B] border border-white/10">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-wider block">Target Career</span>
              <span className="font-semibold text-xs text-white">{state.targetRole || 'Not Set'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-wider block">Readiness</span>
              <span className="font-mono text-sm font-bold text-teal-400">
                {hasProfile ? `${careerReadiness}%` : '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navLinks.map((item) => {
              const isActive =
                location.pathname === item.to ||
                (item.to === '/career-roadmap' && location.pathname.startsWith('/roadmap/')) ||
                (item.to === '/opportunities' && location.pathname.startsWith('/opportunities/'));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-center text-xs transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white font-semibold shadow-sm'
                      : 'bg-[#11182B] border border-white/5 text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Profile & Dossier →
            </Link>
            <Link
              to="/employer"
              onClick={() => {
                switchAccount('employer');
                setMobileMenuOpen(false);
              }}
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Employer Portal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

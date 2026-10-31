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
    { to: '/resume-matcher', label: 'AI Matcher', icon: 'psychology' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#E5E7EB] shadow-[0_4px_20px_rgba(24,40,61,0.06)]">
      <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: ATLAS Logo & Workspace Identifier */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none group">
            {/* Brand Mark */}
            <img src="/logo.png" alt="ATLAS Logo" className="w-8 h-8 rounded-lg object-contain shadow-xs transition-transform group-hover:scale-105" />
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg text-[#18283D] font-extrabold tracking-tight">
                ATLAS
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] font-mono text-[#8B6F5A] font-semibold uppercase tracking-wider">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-180 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-[#FAF7F2] text-xs font-semibold shadow-sm transition-all duration-180 border border-transparent"
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
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E5E7EB] hover:border-[#18283D]/30 text-xs transition-all shadow-sm group"
            title="Calibrated Career Readiness"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B7280] group-hover:text-[#18283D] transition-colors">
              Readiness
            </span>
            <span className="font-bold text-[#8B6F5A] font-mono text-xs shadow-xs">
              {hasProfile ? `${careerReadiness}%` : '—'}
            </span>
          </Link>

          {/* User Profile Capsule Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] hover:border-[#8B6F5A]/60 hover:shadow-md hover:-translate-y-0.5 hover:bg-[#D8C3A5]/10 transition-all group focus:outline-none"
              aria-label="User account and profile menu"
            >
              <div className="w-7 h-7 rounded-lg bg-[#18283D] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shadow-sm">
                {getInitials(state.profile?.fullName)}
              </div>
              <span className="text-xs font-medium text-[#18283D] hidden md:inline max-w-[120px] truncate">
                {state.profile?.fullName ? state.profile.fullName.split(' ')[0] : (hasProfile ? 'User' : 'Get Started')}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#6B7280] group-hover:text-[#18283D] transition-colors">
                {profileDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Profile Menu Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FAF7F2] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.12)] py-2 z-50 text-xs animate-scale-in origin-top-right backdrop-blur-2xl">
                <div className="px-4 py-3 border-b border-[#E5E7EB]">
                  <div className="font-semibold text-sm text-[#18283D] truncate">
                    {state.profile?.fullName || 'Anonymous Candidate'}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                    {state.profile?.email || state.profile?.college || 'ATLAS Career Profile'}
                  </div>
                  {state.targetRole && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] font-mono font-semibold text-[#8B6F5A]">
                      <span>Target:</span>
                      <span className="text-[#18283D]">{state.targetRole}</span>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">account_circle</span>
                    <span>View Profile & Dossier</span>
                  </Link>

                  <Link
                    to="/onboarding"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">tune</span>
                    <span>Edit Profile & Goal</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleRetakeAssessment}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">assignment</span>
                    <span>{state.assessmentCompleted ? 'Retake Assessment' : 'Start Assessment'}</span>
                  </button>

                  <Link
                    to="/reassessment"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">history</span>
                    <span>Reassessment & Progress</span>
                  </Link>

                  <div className="border-t border-[#E5E7EB] my-1"></div>

                  <Link
                    to="/employer"
                    onClick={() => {
                      switchAccount('employer');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-2 text-[#8B6F5A] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors font-medium"
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
                    className="flex items-center gap-2.5 px-4 py-2 text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span>Account Role Select</span>
                  </Link>
                </div>

                <div className="border-t border-[#E5E7EB] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors font-medium"
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
            className="lg:hidden p-2 rounded-xl text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:-translate-y-0.5 transition-all border border-[#E5E7EB]"
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
        <div className="lg:hidden bg-[#FAF7F2] border-b border-[#E5E7EB] px-6 py-4 space-y-3 animate-fade-in-down shadow-2xl">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase font-mono tracking-wider block">Target Career</span>
              <span className="font-semibold text-xs text-[#18283D]">{state.targetRole || 'Not Set'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#6B7280] uppercase font-mono tracking-wider block">Readiness</span>
              <span className="font-mono text-sm font-bold text-[#8B6F5A]">
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
                      ? 'bg-[#18283D] text-[#FAF7F2] font-semibold shadow-sm'
                      : 'bg-[#FAF7F2] border border-[#E5E7EB] text-[#4B5563] hover:text-[#18283D]'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium text-[#8B6F5A] hover:text-[#18283D]"
            >
              Profile & Dossier →
            </Link>
            <Link
              to="/employer"
              onClick={() => {
                switchAccount('employer');
                setMobileMenuOpen(false);
              }}
              className="font-medium text-[#8B6F5A] hover:text-[#18283D]"
            >
              Employer Portal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

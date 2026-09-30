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

  // 7 standard application sections
  const navLinks = [
    { to: '/diagnosis', label: 'Overview' },
    { to: '/skill-gaps', label: 'Skill Gaps' },
    { to: '/resources', label: 'Resources' },
    { to: '/career-roadmap', label: 'Roadmap' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/opportunities', label: 'Opportunities' },
    { to: '/career-map', label: 'Career Map' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcf9f3]/95 backdrop-blur-md border-b border-[#e5e2dc]">
      <div className="h-16 max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-6">
        
        {/* Left: ATLAS Logo */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none group">
            {/* Minimal Brand Target Logo */}
            <div className="w-8 h-8 rounded-full border border-[#0d1f18] flex items-center justify-center relative bg-white shadow-xs group-hover:border-[#6b4ea6] transition-colors">
              <div className="w-4 h-4 rounded-full border border-dashed border-[#6b4ea6] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d1f18]"></div>
              </div>
            </div>
            <span className="font-headline-sm text-headline-sm text-[#0d1f18] tracking-tight font-medium">
              ATLAS
            </span>
          </Link>
        </div>

        {/* Center: Core Application Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === '/career-roadmap' && location.pathname.startsWith('/roadmap/')) ||
              (item.to === '/opportunities' && location.pathname.startsWith('/opportunities/'));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#ebe6dc] text-[#0d1f18] font-semibold shadow-2xs'
                    : 'text-[#5a625d] hover:text-[#0d1f18] hover:bg-[#f3eee4] font-medium'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Readiness Indicator & User Profile Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {/* First-time Assessment Header CTA for Unassessed Candidates */}
          {hasProfile && !state.assessmentCompleted && (
            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6b4ea6] text-white hover:bg-[#583d8b] text-xs font-semibold shadow-xs transition-colors animate-pulse"
              title="Take your 15-question competency assessment"
            >
              <span className="material-symbols-outlined text-[15px]">quiz</span>
              <span>Start Assessment</span>
            </Link>
          )}

          {/* Readiness Indicator */}
          <Link
            to={hasProfile ? '/diagnosis' : '/onboarding'}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f0e6] border border-[#e2ddd3] hover:border-[#c8c2b7] text-xs transition-colors"
            title="Current Calibrated Career Readiness"
          >
            <span className="text-[11px] uppercase tracking-wider text-[#68706b] font-semibold">
              Readiness
            </span>
            <span className="font-bold text-[#6b4ea6] font-mono text-xs">
              {hasProfile ? `${careerReadiness}%` : '—'}
            </span>
          </Link>

          {/* User Profile Capsule Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-[#f0ebe1] transition-colors group focus:outline-none"
              aria-label="User account and profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#0d1f18] text-[#fcf9f3] flex items-center justify-center text-xs font-semibold shadow-xs">
                {getInitials(state.profile?.fullName)}
              </div>
              <span className="text-xs font-medium text-[#0d1f18] hidden sm:inline max-w-[130px] truncate">
                {state.profile?.fullName ? state.profile.fullName.split(' ')[0] : (hasProfile ? 'User' : 'Get Started')}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#737874]">
                {profileDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Profile Menu Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#e5e2dc] shadow-lg py-2 z-50 text-xs animate-scale-in origin-top-right">
                <div className="px-4 py-2.5 border-b border-[#f1eee7]">
                  <div className="font-semibold text-sm text-[#0d1f18] truncate">
                    {state.profile?.fullName || 'Anonymous Candidate'}
                  </div>
                  <div className="text-[11px] text-[#737874] truncate">
                    {state.profile?.email || state.profile?.college || 'ATLAS Career Profile'}
                  </div>
                  {state.targetRole && (
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-[#f6f3ed] text-[10px] font-bold text-[#6b4ea6]">
                      Target: {state.targetRole}
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#0d1f18] hover:bg-[#f6f3ed] font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737874]">account_circle</span>
                    <span>View Profile & Dossier</span>
                  </Link>

                  <Link
                    to="/onboarding"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#0d1f18] hover:bg-[#f6f3ed] font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737874]">tune</span>
                    <span>Edit Profile & Goal</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleRetakeAssessment}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#0d1f18] hover:bg-[#f6f3ed] font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737874]">assignment</span>
                    <span>{state.assessmentCompleted ? 'Retake Assessment' : 'Start Assessment'}</span>
                  </button>

                  <Link
                    to="/employer"
                    onClick={() => {
                      switchAccount('employer');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-2 text-[#6b4ea6] hover:bg-[#f6f3ed] font-medium"
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
                    className="flex items-center gap-2.5 px-4 py-2 text-[#737874] hover:bg-[#f6f3ed] font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span>Account Role Select</span>
                  </Link>
                </div>

                <div className="border-t border-[#f1eee7] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/5 font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">restart_alt</span>
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
            className="md:hidden p-1.5 rounded-lg text-[#0d1f18] hover:bg-[#ebe8e2]"
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
        <div className="md:hidden bg-[#fcf9f3] border-b border-[#e5e2dc] px-6 py-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#f4f0e6] border border-[#e2ddd3]">
            <div>
              <span className="text-[10px] text-[#737874] uppercase tracking-wider block font-semibold">Target Career</span>
              <span className="font-semibold text-xs text-[#0d1f18]">{state.targetRole || 'Not Set'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#737874] uppercase tracking-wider block font-semibold">Readiness</span>
              <span className="font-mono text-xs font-bold text-[#6b4ea6]">
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
                  className={`p-2.5 rounded-lg text-center text-xs transition-colors ${
                    isActive
                      ? 'bg-[#0d1f18] text-white font-semibold'
                      : 'bg-white border border-[#e5e2dc] text-[#0d1f18] font-medium'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#e5e2dc] flex items-center justify-between text-xs">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium text-[#6b4ea6] hover:underline"
            >
              Profile & Dossier →
            </Link>
            <Link
              to="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium text-[#737874] hover:text-[#0d1f18]"
            >
              Edit Goal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

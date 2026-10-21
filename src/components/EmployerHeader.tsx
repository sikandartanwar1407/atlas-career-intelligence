import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';

export const EmployerHeader: React.FC = () => {
  const { employerProfile, isEmployerVerified, switchAccount, verifyEmployerAccount } = useAccount();
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

  // 4 standard employer workspace sections
  const employerNavLinks = [
    { to: '/employer', label: 'Dashboard', icon: 'dashboard' },
    { to: '/employer/profile', label: 'Company Profile', icon: 'business' },
    { to: '/employer/opportunities', label: 'Opportunities', icon: 'work' },
    { to: '/employer/candidates', label: 'Candidates', icon: 'group' },
  ];

  const handleSwitchToCandidate = () => {
    switchAccount('candidate');
    setProfileDropdownOpen(false);
    navigate('/opportunities');
  };

  const getCompanyInitials = (name?: string) => {
    if (!name || !name.trim()) return 'EM';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080B16]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: ATLAS FOR EMPLOYERS Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/employer" className="flex items-center gap-2.5 focus:outline-none group">
            <div className="w-8 h-8 rounded-xl bg-[#11182B] border border-teal-500/30 shadow-sm flex items-center justify-center transition-colors group-hover:border-teal-500/50">
              <div className="w-3.5 h-3.5 rounded-full border border-teal-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg text-white font-extrabold tracking-tight">
                ATLAS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider">
                Employer
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Dedicated Employer Workspace Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {employerNavLinks.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === '/employer/opportunities' &&
                location.pathname.startsWith('/employer/opportunities') &&
                location.pathname !== '/employer/opportunities/new') ||
              (item.to === '/employer/candidates' &&
                location.pathname.startsWith('/employer/candidates'));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/40'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Verification Status & Employer Profile Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Company Verification Badge */}
          {isEmployerVerified ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-400 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Verified Entity</span>
            </div>
          ) : (
            <Link
              to="/employer/onboarding"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
              title="Click to complete employer verification"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Verification Pending</span>
            </Link>
          )}

          {/* Quick Post CTA */}
          <Link
            to="/employer/opportunities/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-sm transition-all btn-interactive"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">Post Opportunity</span>
            <span className="sm:hidden">Post</span>
          </Link>

          {/* Employer Profile Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-[#11182B] border border-white/10 hover:border-teal-500/40 hover:bg-[#172039] transition-all group focus:outline-none"
              aria-label="Employer account menu"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center text-xs font-bold shadow-sm">
                {getCompanyInitials(employerProfile?.companyName)}
              </div>
              <span className="text-xs font-medium text-white hidden md:inline max-w-[120px] truncate">
                {employerProfile?.companyName || 'Employer'}
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
                    {employerProfile?.companyName || 'Organization Profile'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {employerProfile?.companyEmail || employerProfile?.companyWebsite || 'ATLAS Employer Portal'}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-[10px] font-mono text-teal-300">
                    <span>Status:</span>
                    <span className="text-white capitalize">{employerProfile?.verificationStatus || 'Verified'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/employer/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-teal-400">business</span>
                    <span>Company Profile & Branding</span>
                  </Link>

                  <Link
                    to="/employer/opportunities"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-cyan-400">work</span>
                    <span>Manage Opportunities</span>
                  </Link>

                  <Link
                    to="/employer/candidates"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-violet-400">group</span>
                    <span>Search Verified Candidates</span>
                  </Link>

                  {!isEmployerVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        verifyEmployerAccount();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-emerald-400 hover:bg-emerald-500/10 transition-colors font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Instant Verify Company</span>
                    </button>
                  )}

                  <div className="border-t border-white/[0.06] my-1"></div>

                  <button
                    type="button"
                    onClick={handleSwitchToCandidate}
                    className="w-full text-left flex items-center justify-between px-4 py-2 text-violet-300 hover:text-violet-200 hover:bg-violet-500/10 transition-colors font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <span>Switch to Candidate View</span>
                    </div>
                    <span>→</span>
                  </button>

                  <Link
                    to="/role-select"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span>Role Selection</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors border border-white/5"
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
        <div className="md:hidden bg-[#0D1224] border-b border-white/10 px-6 py-4 space-y-3 animate-fade-in-down shadow-2xl">
          <div className="p-3 rounded-xl bg-[#11182B] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-wider block">Company</span>
              <span className="font-semibold text-xs text-white">{employerProfile?.companyName || 'Employer'}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
              {isEmployerVerified ? 'Verified' : 'Pending'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {employerNavLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `p-2.5 rounded-xl text-center text-xs transition-all ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-[#11182B] border border-white/5 text-[#CBD5E1] hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSwitchToCandidate}
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Candidate View →
            </button>
            <Link
              to="/employer/opportunities/new"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bold text-teal-400 hover:text-teal-300"
            >
              + Post Role
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

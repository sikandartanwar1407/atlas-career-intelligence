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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#E5E7EB] shadow-[0_4px_20px_rgba(24,40,61,0.06)]">
      <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Left: ATLAS FOR EMPLOYERS Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/employer" className="flex items-center gap-2.5 focus:outline-none group">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#8B6F5A]/40 shadow-sm flex items-center justify-center transition-colors group-hover:border-[#8B6F5A]/60">
              <div className="w-3.5 h-3.5 rounded-full border border-[#8B6F5A] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D8C3A5]"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg text-[#18283D] font-extrabold tracking-tight">
                ATLAS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] font-mono text-[#8B6F5A] font-bold uppercase tracking-wider">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-180 ${
                  isActive
                    ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40 hover:-translate-y-0.5 border border-transparent'
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
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-600 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Verified Entity</span>
            </div>
          ) : (
            <Link
              to="/employer/onboarding"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-medium text-amber-700 hover:bg-amber-500/20 transition-colors"
              title="Click to complete employer verification"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span>Verification Pending</span>
            </Link>
          )}

          {/* Quick Post CTA */}
          <Link
            to="/employer/opportunities/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-[#FAF7F2] text-xs font-bold shadow-sm transition-all duration-180 border border-transparent btn-interactive"
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
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] hover:border-[#8B6F5A]/60 hover:shadow-md hover:-translate-y-0.5 hover:bg-[#D8C3A5]/10 transition-all group focus:outline-none"
              aria-label="Employer account menu"
            >
              <div className="w-7 h-7 rounded-lg bg-[#8B6F5A] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shadow-sm">
                {getCompanyInitials(employerProfile?.companyName)}
              </div>
              <span className="text-xs font-medium text-[#18283D] hidden md:inline max-w-[120px] truncate">
                {employerProfile?.companyName || 'Employer'}
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
                    {employerProfile?.companyName || 'Organization Profile'}
                  </div>
                  <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                    {employerProfile?.companyEmail || employerProfile?.companyWebsite || 'ATLAS Employer Portal'}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] font-mono text-[#8B6F5A]">
                    <span>Status:</span>
                    <span className="text-[#18283D] capitalize">{employerProfile?.verificationStatus || 'Verified'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/employer/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">business</span>
                    <span>Company Profile & Branding</span>
                  </Link>

                  <Link
                    to="/employer/opportunities"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">work</span>
                    <span>Manage Opportunities</span>
                  </Link>

                  <Link
                    to="/employer/candidates"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#4B5563] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#8B6F5A]">group</span>
                    <span>Search Verified Candidates</span>
                  </Link>

                  {!isEmployerVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        verifyEmployerAccount();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-emerald-600 hover:bg-emerald-500/10 transition-colors font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Instant Verify Company</span>
                    </button>
                  )}

                  <div className="border-t border-[#E5E7EB] my-1"></div>

                  <button
                    type="button"
                    onClick={handleSwitchToCandidate}
                    className="w-full text-left flex items-center justify-between px-4 py-2 text-[#8B6F5A] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors font-medium"
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
                    className="flex items-center gap-2.5 px-4 py-2 text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 transition-colors"
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
            className="md:hidden p-2 rounded-xl text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:-translate-y-0.5 transition-all border border-[#E5E7EB]"
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
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E5E7EB] px-6 py-4 space-y-3 animate-fade-in-down shadow-2xl">
          <div className="p-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase font-mono tracking-wider block">Company</span>
              <span className="font-semibold text-xs text-[#18283D]">{employerProfile?.companyName || 'Employer'}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D8C3A5]/30 text-[#8B6F5A]">
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
                      ? 'bg-[#18283D] text-[#FAF7F2] font-bold shadow-sm'
                      : 'bg-[#FAF7F2] border border-[#E5E7EB] text-[#4B5563] hover:text-[#18283D]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSwitchToCandidate}
              className="font-medium text-[#8B6F5A] hover:text-[#18283D]"
            >
              Candidate View →
            </button>
            <Link
              to="/employer/opportunities/new"
              onClick={() => setMobileMenuOpen(false)}
              className="font-bold text-[#8B6F5A] hover:text-[#18283D]"
            >
              + Post Role
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

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
    { to: '/employer', label: 'Dashboard' },
    { to: '/employer/profile', label: 'Company Profile' },
    { to: '/employer/opportunities', label: 'Opportunities' },
    { to: '/employer/candidates', label: 'Candidates' },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcf9f3]/95 backdrop-blur-md border-b border-[#e5e2dc]">
      <div className="h-16 max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-6">
        
        {/* Left: ATLAS FOR EMPLOYERS Logo */}
        <div className="flex items-center shrink-0">
          <Link to="/employer" className="flex items-center gap-2.5 focus:outline-none group">
            <div className="w-8 h-8 rounded-full border border-[#0d1f18] flex items-center justify-center relative bg-white shadow-xs group-hover:border-[#6b4ea6] transition-colors">
              <div className="w-4 h-4 rounded-full border border-dashed border-[#6b4ea6] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d1f18]"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-[#0d1f18] tracking-tight font-medium">
                ATLAS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#f4f0e6] border border-[#e2ddd3] text-[10px] uppercase font-bold text-[#6b4ea6] tracking-wider">
                FOR EMPLOYERS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Dedicated Employer Workspace Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
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

        {/* Right: Verification Status & Employer Profile Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Company Verification Badge */}
          {isEmployerVerified ? (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f9f5] border border-[#d2e7dc] text-xs font-semibold text-[#2e7d32]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]"></span>
              <span>Verified Company</span>
            </div>
          ) : (
            <Link
              to="/employer/onboarding"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff9eb] border border-[#ffe099] text-xs font-semibold text-[#b45309] hover:bg-[#fff3d4] transition-colors"
              title="Click to complete employer verification"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#b45309] animate-pulse"></span>
              <span>Verification Pending</span>
            </Link>
          )}

          {/* Quick Post CTA */}
          <Link
            to="/employer/opportunities/new"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <span>+ Post Opportunity</span>
          </Link>

          {/* Employer Profile Capsule Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-[#f0ebe1] transition-colors group focus:outline-none"
              aria-label="Employer account menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#0d1f18] text-[#fcf9f3] flex items-center justify-center text-xs font-semibold shadow-xs">
                {getCompanyInitials(employerProfile?.companyName)}
              </div>
              <span className="text-xs font-medium text-[#0d1f18] hidden sm:inline max-w-[140px] truncate">
                {employerProfile?.companyName || 'Employer Account'}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#737874]">
                {profileDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* Profile Menu Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-[#e5e2dc] shadow-lg py-2 z-50 text-xs animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-[#f1eee7]">
                  <div className="font-semibold text-sm text-[#0d1f18] truncate">
                    {employerProfile?.companyName || 'Company Account'}
                  </div>
                  <div className="text-[11px] text-[#737874] truncate">
                    {employerProfile?.companyEmail || 'talent@company.com'}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#737874] uppercase tracking-wider font-semibold">
                      Status:
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEmployerVerified
                          ? 'bg-[#f4f9f5] text-[#2e7d32] border border-[#d2e7dc]'
                          : 'bg-[#fff9eb] text-[#b45309] border border-[#ffe099]'
                      }`}
                    >
                      {isEmployerVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/employer/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#0d1f18] hover:bg-[#f6f3ed] font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737874]">domain</span>
                    <span>Company Profile & Settings</span>
                  </Link>

                  <Link
                    to="/employer/opportunities"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#0d1f18] hover:bg-[#f6f3ed] font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737874]">work</span>
                    <span>Manage Opportunities</span>
                  </Link>

                  <Link
                    to="/employer/opportunities/new"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#0d1f18] hover:bg-[#f6f3ed] font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#737874]">add_circle</span>
                    <span>Post New Opportunity</span>
                  </Link>

                  {!isEmployerVerified && (
                    <button
                      type="button"
                      onClick={() => {
                        verifyEmployerAccount();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#6b4ea6] hover:bg-[#f6f3ed] font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">verified</span>
                      <span>Prototype: Simulate Verification</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-[#f1eee7] pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleSwitchToCandidate}
                    className="w-full text-left flex items-center justify-between px-4 py-2 text-[#0d1f18] hover:bg-[#f6f3ed] font-medium group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">person</span>
                      <span>Switch to Candidate View</span>
                    </div>
                    <span className="text-[#6b4ea6] font-bold">→</span>
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
              <span className="text-[10px] text-[#737874] uppercase tracking-wider block font-semibold">
                Company Workspace
              </span>
              <span className="font-semibold text-xs text-[#0d1f18]">
                {employerProfile?.companyName || 'Acme Analytics'}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isEmployerVerified ? 'bg-[#f4f9f5] text-[#2e7d32]' : 'bg-[#fff9eb] text-[#b45309]'
              }`}
            >
              {isEmployerVerified ? 'Verified' : 'Pending'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {employerNavLinks.map((item) => {
              const isActive = location.pathname === item.to;
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
              to="/employer/opportunities/new"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium text-[#6b4ea6] hover:underline"
            >
              + Post Opportunity
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleSwitchToCandidate();
              }}
              className="font-medium text-[#0d1f18] hover:underline"
            >
              Candidate View →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { Footer } from '../components/Footer';

export const EmployerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { employerProfile, createEmployerAccount, verifyEmployerAccount, isEmployerVerified } = useAccount();

  // Step 1 = Form, Step 2 = Verification
  const [step, setStep] = useState<'profile' | 'verification'>(
    employerProfile?.companyName ? 'verification' : 'profile'
  );

  const [companyName, setCompanyName] = useState(employerProfile?.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState(employerProfile?.companyWebsite || '');
  const [companyEmail, setCompanyEmail] = useState(employerProfile?.companyEmail || '');
  const [industry, setIndustry] = useState(employerProfile?.industry || 'Analytics & Technology');
  const [companySize, setCompanySize] = useState(employerProfile?.companySize || '51–200 employees');
  const [companyLocation, setCompanyLocation] = useState(employerProfile?.companyLocation || '');
  const [companyDescription, setCompanyDescription] = useState(employerProfile?.companyDescription || '');
  const [companyLogoText, setCompanyLogoText] = useState(employerProfile?.companyLogoText || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyEmail.trim() || !companyDescription.trim()) {
      setErrorMsg('Please complete company name, corporate email, and company description.');
      return;
    }

    createEmployerAccount({
      companyName: companyName.trim(),
      companyWebsite: companyWebsite.trim(),
      companyEmail: companyEmail.trim(),
      industry,
      companySize,
      companyLocation: companyLocation.trim() || 'Remote',
      companyDescription: companyDescription.trim(),
      companyLogoText: companyLogoText.trim() || companyName.slice(0, 2).toUpperCase(),
    });

    setStep('verification');
  };

  const handleCompleteVerification = () => {
    verifyEmployerAccount();
  };

  const handleEnterWorkspace = () => {
    navigate('/employer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-100 selection:bg-[#D8C3A5]/40 selection:text-[#18283D]">
      {/* Header Bar */}
      <header className="h-16 border-b border-[#E5E7EB] bg-[#F3F4F6]/80 backdrop-blur-md px-6 lg:px-10 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#18283D]/30 flex items-center justify-center font-bold text-[#18283D] text-sm shadow-sm">
            A
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#18283D] tracking-tight">
              ATLAS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[10px] uppercase font-bold text-[#8B6F5A] tracking-wider">
              FOR EMPLOYERS
            </span>
          </div>
        </Link>
        <Link to="/role-select" className="text-xs text-slate-400 hover:text-[#18283D] transition-colors">
          Switch Account Role
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'profile'
                  ? 'bg-[#18283D] text-[#FAF7F2] shadow-sm'
                  : 'bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#D8C3A5]'
              }`}
            >
              {step === 'verification' ? '✓' : '1'}
            </div>
            <span className="text-xs font-semibold text-[#18283D]">Company Profile</span>
          </div>

          <div className="h-0.5 w-16 bg-[#E5E7EB]"></div>

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'verification'
                  ? 'bg-[#18283D] text-[#FAF7F2] shadow-sm'
                  : 'bg-[#E5E7EB] text-[#6B7280] border border-[#E5E7EB]'
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold text-[#6B7280]">Verification</span>
          </div>
        </div>

        {step === 'profile' ? (
          /* STEP 1: Company Profile Form */
          <div className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 backdrop-blur-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8B6F5A]">
                Employer Onboarding · Step 01
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18283D]">
                Create your company account.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Establish your corporate profile to calibrate role requirements against ATLAS candidate capabilities.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Analytics"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Company Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="talent@company.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                  >
                    <option value="Analytics & Decision Intelligence">Analytics & Decision Intelligence</option>
                    <option value="Enterprise Software & Cloud">Enterprise Software & Cloud</option>
                    <option value="Fintech & Financial Services">Fintech & Financial Services</option>
                    <option value="Healthcare & Bio-Informatics">Healthcare & Bio-Informatics</option>
                    <option value="Consumer Tech & Media">Consumer Tech & Media</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                  >
                    <option value="1–10 employees">1–10 employees (Seed)</option>
                    <option value="11–50 employees">11–50 employees (Early Stage)</option>
                    <option value="51–200 employees">51–200 employees (Scale-up)</option>
                    <option value="201–1,000 employees">201–1,000 employees (Mid-Market)</option>
                    <option value="1,000+ employees">1,000+ employees (Enterprise)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Headquarters / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Company Logo Text or Initials
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. AA"
                    value={companyLogoText}
                    onChange={(e) => setCompanyLogoText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Company Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Briefly describe your products, engineering culture, and technical stack..."
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E5E7EB]">
                <Link to="/role-select" className="text-xs text-slate-400 hover:text-[#18283D] transition-colors">
                  ← Back to Role Select
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  Create Company Profile →
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Company Verification State */
          <div className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 text-center backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center text-3xl font-bold mx-auto shadow-md">
              ✓
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B6F5A]">
                Company Profile Created
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18283D]">
                Complete verification to access employer matching.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                To protect candidate privacy and preserve capability matching integrity, company accounts complete verification before accessing active candidate pipelines.
              </p>
            </div>

            {/* Verification State Box */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#FAF7F2]/80 border border-[#E5E7EB] text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="font-bold text-xs text-[#18283D]">
                    {companyName || employerProfile?.companyName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {companyEmail || employerProfile?.companyEmail}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isEmployerVerified
                      ? 'bg-[#D8C3A5]/25 text-[#8B6F5A] border border-[#D8C3A5]'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isEmployerVerified ? 'Verified ✓' : 'Pending Verification ⏳'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-[#8B6F5A] font-bold' : 'text-amber-400'}>
                    {isEmployerVerified ? '✓' : '○'}
                  </span>
                  <span>Domain validation: {companyWebsite || employerProfile?.companyWebsite || 'Verified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-[#8B6F5A] font-bold' : 'text-amber-400'}>
                    {isEmployerVerified ? '✓' : '○'}
                  </span>
                  <span>Corporate email confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-[#8B6F5A] font-bold' : 'text-amber-400'}>
                    {isEmployerVerified ? '✓' : '○'}
                  </span>
                  <span>ATLAS Capability Matching Authorization</span>
                </div>
              </div>

              {!isEmployerVerified ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteVerification}
                    className="w-full py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Simulate Verification (Prototype Demo)</span>
                  </button>
                  <span className="text-[10px] text-slate-500 text-center block mt-1.5 italic">
                    Prototype note: Simulates employer verification without external commercial checks.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-xs text-[#8B6F5A] font-semibold text-center">
                  ✓ Verification successfully completed. Candidate matching is unlocked.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep('profile')}
                className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-[#6B7280] text-xs font-semibold hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                Edit Profile Info
              </button>
              <button
                type="button"
                onClick={handleEnterWorkspace}
                className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold tracking-wide transition-all w-full sm:w-auto shadow-sm"
              >
                Enter Employer Workspace →
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

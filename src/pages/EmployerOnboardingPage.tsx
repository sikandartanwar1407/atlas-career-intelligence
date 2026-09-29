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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      {/* Header Bar */}
      <header className="h-16 border-b border-[#e5e2dc] bg-[#fcf9f3]/95 px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#0d1f18] flex items-center justify-center relative bg-white shadow-xs">
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
        <Link to="/role-select" className="text-xs text-[#737874] hover:text-[#0d1f18]">
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
                  ? 'bg-[#0d1f18] text-white'
                  : 'bg-[#d2e7dc] text-[#0d1f18]'
              }`}
            >
              {step === 'verification' ? '✓' : '1'}
            </div>
            <span className="text-xs font-semibold text-[#0d1f18]">Company Profile</span>
          </div>

          <div className="h-0.5 w-16 bg-[#e5e2dc]"></div>

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'verification'
                  ? 'bg-[#0d1f18] text-white'
                  : 'bg-[#ebe6dc] text-[#737874]'
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold text-[#0d1f18]">Verification</span>
          </div>
        </div>

        {step === 'profile' ? (
          /* STEP 1: Company Profile Form */
          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="font-label-sm text-xs font-semibold uppercase tracking-widest text-[#6b4ea6]">
                Employer Onboarding · Step 01
              </span>
              <h1 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[#0d1f18]">
                Create your company account.
              </h1>
              <p className="text-xs sm:text-sm text-[#424845]">
                Establish your corporate profile to calibrate role requirements against ATLAS candidate capabilities.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Analytics"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Company Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="talent@company.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
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
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                  >
                    <option value="1–10 employees">1–10 employees (Seed)</option>
                    <option value="11–50 employees">11–50 employees (Early Stage)</option>
                    <option value="51–200 employees">51–200 employees (Scale-up)</option>
                    <option value="201–1,000 employees">201–1,000 employees (Mid-Market)</option>
                    <option value="1,000+ employees">1,000+ employees (Enterprise)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Headquarters / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Company Logo Text or Initials
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. AA"
                    value={companyLogoText}
                    onChange={(e) => setCompanyLogoText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-[#0d1f18] block">
                    Company Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Briefly describe your products, engineering culture, and technical stack..."
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#f4f0e6]">
                <Link to="/role-select" className="text-xs text-[#737874] hover:underline">
                  ← Back to Role Select
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors shadow-xs"
                >
                  Create Company Profile →
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Company Verification State */
          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f4f9f5] border border-[#d2e7dc] text-[#2e7d32] flex items-center justify-center text-3xl font-bold mx-auto">
              ✓
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-[#2e7d32]">
                Company Profile Created
              </span>
              <h2 className="font-headline-xl text-2xl sm:text-3xl font-bold text-[#0d1f18]">
                Complete verification to access employer matching.
              </h2>
              <p className="text-xs sm:text-sm text-[#424845] leading-relaxed">
                To protect candidate privacy and preserve capability matching integrity, company accounts complete verification before accessing active candidate pipelines.
              </p>
            </div>

            {/* Verification State Box */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#fbf9f4] border border-[#ebe6dc] text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e2dc]">
                <div>
                  <div className="font-bold text-xs text-[#0d1f18]">
                    {companyName || employerProfile?.companyName}
                  </div>
                  <div className="text-[11px] text-[#737874]">
                    {companyEmail || employerProfile?.companyEmail}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isEmployerVerified
                      ? 'bg-[#d2e7dc] text-[#0d1f18] border border-[#b2d7c4]'
                      : 'bg-[#fff9eb] text-[#b45309] border border-[#ffe099]'
                  }`}
                >
                  {isEmployerVerified ? 'Verified ✓' : 'Pending Verification ⏳'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#5a625d]">
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-[#2e7d32] font-bold' : 'text-[#b45309]'}>
                    {isEmployerVerified ? '✓' : '○'}
                  </span>
                  <span>Domain validation: {companyWebsite || employerProfile?.companyWebsite || 'Verified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-[#2e7d32] font-bold' : 'text-[#b45309]'}>
                    {isEmployerVerified ? '✓' : '○'}
                  </span>
                  <span>Corporate email confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-[#2e7d32] font-bold' : 'text-[#b45309]'}>
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
                    className="w-full py-2.5 rounded-xl bg-[#6b4ea6] hover:bg-[#593d91] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Simulate Verification (Prototype Demo)</span>
                  </button>
                  <span className="text-[10px] text-[#737874] text-center block mt-1.5 italic">
                    Prototype note: Simulates employer verification without external commercial checks.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#d2e7dc]/60 text-xs text-[#0d1f18] font-semibold text-center">
                  ✓ Verification successfully completed. Candidate matching is unlocked.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep('profile')}
                className="px-5 py-2.5 rounded-xl border border-[#d6d0c4] text-[#424845] text-xs font-semibold hover:bg-[#ede8de] transition-colors w-full sm:w-auto"
              >
                Edit Profile Info
              </button>
              <button
                type="button"
                onClick={handleEnterWorkspace}
                className="px-6 py-2.5 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors w-full sm:w-auto shadow-xs"
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

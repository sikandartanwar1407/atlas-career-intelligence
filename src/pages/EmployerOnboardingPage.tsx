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
    <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      {/* Header Bar */}
      <header className="h-16 border-b border-white/10 bg-[#080B16]/80 backdrop-blur-md px-6 lg:px-10 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#11182B] border border-violet-500/30 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            A
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-tight">
              ATLAS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] uppercase font-bold text-violet-400 tracking-wider">
              FOR EMPLOYERS
            </span>
          </div>
        </Link>
        <Link to="/role-select" className="text-xs text-slate-400 hover:text-white transition-colors">
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
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}
            >
              {step === 'verification' ? '✓' : '1'}
            </div>
            <span className="text-xs font-semibold text-white">Company Profile</span>
          </div>

          <div className="h-0.5 w-16 bg-white/10"></div>

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'verification'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold text-slate-400">Verification</span>
          </div>
        </div>

        {step === 'profile' ? (
          /* STEP 1: Company Profile Form */
          <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 backdrop-blur-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                Employer Onboarding · Step 01
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 font-mono"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <Link to="/role-select" className="text-xs text-slate-400 hover:text-white transition-colors">
                  ← Back to Role Select
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98]"
                >
                  Create Company Profile →
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Company Verification State */
          <div className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 text-center backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-3xl font-bold mx-auto shadow-md">
              ✓
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Company Profile Created
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Complete verification to access employer matching.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                To protect candidate privacy and preserve capability matching integrity, company accounts complete verification before accessing active candidate pipelines.
              </p>
            </div>

            {/* Verification State Box */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#0D1224]/80 border border-white/10 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <div className="font-bold text-xs text-white">
                    {companyName || employerProfile?.companyName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {companyEmail || employerProfile?.companyEmail}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isEmployerVerified
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isEmployerVerified ? 'Verified ✓' : 'Pending Verification ⏳'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-teal-400 font-bold' : 'text-amber-400'}>
                    {isEmployerVerified ? '✓' : '○'}
                  </span>
                  <span>Domain validation: {companyWebsite || employerProfile?.companyWebsite || 'Verified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-teal-400 font-bold' : 'text-amber-400'}>
                    {isEmployerVerified ? '✓' : '○'}
                  </span>
                  <span>Corporate email confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isEmployerVerified ? 'text-teal-400 font-bold' : 'text-amber-400'}>
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
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Simulate Verification (Prototype Demo)</span>
                  </button>
                  <span className="text-[10px] text-slate-500 text-center block mt-1.5 italic">
                    Prototype note: Simulates employer verification without external commercial checks.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300 font-semibold text-center">
                  ✓ Verification successfully completed. Candidate matching is unlocked.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep('profile')}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-colors w-full sm:w-auto"
              >
                Edit Profile Info
              </button>
              <button
                type="button"
                onClick={handleEnterWorkspace}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all w-full sm:w-auto shadow-sm active:scale-[0.98]"
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

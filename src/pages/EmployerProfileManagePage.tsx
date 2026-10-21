import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { useAccount } from '../context/AccountContext';

export const EmployerProfileManagePage: React.FC = () => {
  const { employerProfile, updateEmployerProfile, isEmployerVerified, verifyEmployerAccount } = useAccount();

  const [companyName, setCompanyName] = useState(employerProfile?.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState(employerProfile?.companyWebsite || '');
  const [companyEmail, setCompanyEmail] = useState(employerProfile?.companyEmail || '');
  const [industry, setIndustry] = useState(employerProfile?.industry || 'Analytics & Technology');
  const [companySize, setCompanySize] = useState(employerProfile?.companySize || '51–200 employees');
  const [companyLocation, setCompanyLocation] = useState(employerProfile?.companyLocation || '');
  const [companyDescription, setCompanyDescription] = useState(employerProfile?.companyDescription || '');
  const [savedToast, setSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployerProfile({
      companyName,
      companyWebsite,
      companyEmail,
      industry,
      companySize,
      companyLocation,
      companyDescription,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-slate-100 selection:bg-violet-500/30 selection:text-white">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/employer" className="hover:text-violet-400 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Company Profile</span>
        </div>

        {/* Header */}
        <section className="space-y-2 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-violet-400 font-bold">
              ATLAS FOR EMPLOYERS · Corporate Profile
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Company Profile & Verification
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Manage your verified corporate presence, industry classification, and candidate discovery credentials.
          </p>
        </section>

        {savedToast && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 backdrop-blur-sm animate-in fade-in">
            <span>✓</span>
            <span>Company profile details updated successfully.</span>
          </div>
        )}

        {/* Verification Status Card */}
        <section className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Corporate Verification Status:
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isEmployerVerified
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isEmployerVerified ? 'Verified Company ✓' : 'Pending Verification ⏳'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isEmployerVerified
                ? 'Your company domain and capability matching credentials are verified.'
                : 'Complete verification to unlock full candidate capability dossiers and direct interview outreach.'}
            </p>
          </div>

          {!isEmployerVerified && (
            <button
              type="button"
              onClick={verifyEmployerAccount}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all shrink-0 shadow-sm active:scale-[0.98]"
            >
              Simulate Verification (Demo)
            </button>
          )}
        </section>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="bg-[#11182B]/80 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-400 text-xl">
              business
            </span>
            <span>Corporate Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Corporate Website
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              />
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
                <option value="1–10 employees">1–10 employees</option>
                <option value="11–50 employees">11–50 employees</option>
                <option value="51–200 employees">51–200 employees</option>
                <option value="201–1,000 employees">201–1,000 employees</option>
                <option value="1,000+ employees">1,000+ employees</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Location
              </label>
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Company Description
              </label>
              <textarea
                rows={4}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0D1224] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98]"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

      </main>

      <Footer />
    </div>
  );
};

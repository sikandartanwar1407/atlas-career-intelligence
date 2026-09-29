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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#737874]">
          <Link to="/employer" className="hover:text-[#0d1f18] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-[#0d1f18] font-medium">Company Profile</span>
        </div>

        {/* Header */}
        <section className="space-y-1 pb-4 border-b border-[#e5e2dc]">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold">
            ATLAS FOR EMPLOYERS · Corporate Profile
          </span>
          <h1 className="font-headline-xl text-3xl font-bold text-[#0d1f18] tracking-tight">
            Company Profile & Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#424845]">
            Manage your verified corporate presence, industry classification, and candidate discovery credentials.
          </p>
        </section>

        {savedToast && (
          <div className="p-3 rounded-xl bg-[#d2e7dc] text-[#0d1f18] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span>✓</span>
            <span>Company profile details updated successfully.</span>
          </div>
        )}

        {/* Verification Status Card */}
        <section className="bg-white border border-[#e5e2dc] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0d1f18]">
                Corporate Verification Status:
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isEmployerVerified
                    ? 'bg-[#f4f9f5] text-[#2e7d32] border border-[#d2e7dc]'
                    : 'bg-[#fff9eb] text-[#b45309] border border-[#ffe099]'
                }`}
              >
                {isEmployerVerified ? 'Verified Company ✓' : 'Pending Verification ⏳'}
              </span>
            </div>
            <p className="text-xs text-[#5a625d]">
              {isEmployerVerified
                ? 'Your company domain and capability matching credentials are verified.'
                : 'Complete verification to unlock full candidate capability dossiers and direct interview outreach.'}
            </p>
          </div>

          {!isEmployerVerified && (
            <button
              type="button"
              onClick={verifyEmployerAccount}
              className="px-4 py-2 rounded-xl bg-[#6b4ea6] hover:bg-[#593d91] text-white text-xs font-semibold tracking-wide transition-colors shrink-0 shadow-2xs"
            >
              Simulate Verification (Demo)
            </button>
          )}
        </section>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="font-serif text-lg font-bold text-[#0d1f18]">
            Corporate Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0d1f18] block">
                Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0d1f18] block">
                Corporate Website
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0d1f18] block">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0d1f18] block">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
              />
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
                <option value="1–10 employees">1–10 employees</option>
                <option value="11–50 employees">11–50 employees</option>
                <option value="51–200 employees">51–200 employees</option>
                <option value="201–1,000 employees">201–1,000 employees</option>
                <option value="1,000+ employees">1,000+ employees</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0d1f18] block">
                Location
              </label>
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-[#0d1f18] block">
                Company Description
              </label>
              <textarea
                rows={4}
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#f4f0e6] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors shadow-2xs"
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

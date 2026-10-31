import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EmployerHeader } from '../components/EmployerHeader';
import { Footer } from '../components/Footer';
import { saveOpportunity } from '../data/opportunities';
import { OpportunityRequirement } from '../types/opportunities';

const DEFAULT_SKILL_CATALOGUE = [
  'SQL',
  'Power BI',
  'Excel',
  'Python',
  'Data Storytelling',
  'JavaScript',
  'React',
  'TypeScript',
  'Machine Learning',
  'Communication',
  'Problem Solving',
  'Process Modeling',
  'Figma / Design Systems',
  'Cybersecurity Fundamentals',
];

export const CreateOpportunityPage: React.FC = () => {
  const navigate = useNavigate();

  // Basic info fields
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Student' | 'Fresher' | 'Early Career' | 'Experienced'>('Fresher');
  const [targetRoleCategory, setTargetRoleCategory] = useState('Data Analyst');
  const [salaryRange, setSalaryRange] = useState('');

  // Configured requirements list
  const [requirements, setRequirements] = useState<OpportunityRequirement[]>([
    { skill: 'SQL', type: 'required', minLevel: 70 },
    { skill: 'Power BI', type: 'required', minLevel: 65 },
    { skill: 'Excel', type: 'required', minLevel: 60 },
    { skill: 'Python', type: 'preferred', minLevel: 50 },
  ]);

  const [selectedCatalogueSkill, setSelectedCatalogueSkill] = useState(DEFAULT_SKILL_CATALOGUE[4]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddRequirement = () => {
    if (!selectedCatalogueSkill) return;
    if (requirements.some((r) => r.skill === selectedCatalogueSkill)) {
      setErrorMsg(`${selectedCatalogueSkill} is already added.`);
      return;
    }
    setErrorMsg('');
    setRequirements([
      ...requirements,
      { skill: selectedCatalogueSkill, type: 'required', minLevel: 65 },
    ]);
  };

  const handleRemoveRequirement = (skill: string) => {
    setRequirements(requirements.filter((r) => r.skill !== skill));
  };

  const handleUpdateRequirement = (
    skill: string,
    updates: Partial<OpportunityRequirement>
  ) => {
    setRequirements(
      requirements.map((r) => (r.skill === skill ? { ...r, ...updates } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !company.trim() || !description.trim()) {
      setErrorMsg('Please fill in role title, company name, and job description.');
      return;
    }
    if (requirements.length === 0) {
      setErrorMsg('Please add at least one required skill for empirical matching.');
      return;
    }

    const created = saveOpportunity({
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      location,
      employmentType,
      targetRoleCategory,
      experienceLevel,
      shortDescription: description.slice(0, 140) + '...',
      fullDescription: description.trim(),
      salaryRange: salaryRange.trim() || undefined,
      requirements,
      requiredEvidenceTypes: [
        `${requirements[0]?.skill || 'Project'} Evidence Portfolio`,
        'Demonstrated Project Artifact',
      ],
    });

    navigate(`/employer/opportunities/${created.id}/matches`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-100 selection:bg-[#D8C3A5]/40 selection:text-[#18283D]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/employer" className="hover:text-[#8B6F5A] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Portal</span>
          </Link>
          <span>/</span>
          <span className="text-[#18283D] font-medium">Create Opportunity</span>
        </div>

        {/* Page Heading */}
        <section className="space-y-2 pb-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-[#8B6F5A] font-bold">
              Capability Calibration
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18283D] tracking-tight">
            Post an opportunity.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Define the exact competency thresholds required. ATLAS will immediately match your opening with evaluated candidates.
          </p>
        </section>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-sm animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Role Overview */}
          <div className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-[#18283D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#18283D]/30 text-xs flex items-center justify-center font-mono font-bold">
                1
              </span>
              <span>Role Identity & Context</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Data Analyst"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Analytics"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Target Role Category
                </label>
                <select
                  value={targetRoleCategory}
                  onChange={(e) => setTargetRoleCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                >
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote or San Francisco, CA (Hybrid)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                >
                  <option value="Fresher">Fresher (0-1 yrs)</option>
                  <option value="Student">Student</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Early Career">Early Career (1-3 yrs)</option>
                  <option value="Experienced">Experienced (3+ yrs)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Compensation Range (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $70,000 – $85,000"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Role Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe key responsibilities, project scope, and daily engineering or analysis workflows..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-xl text-[#18283D] placeholder-slate-500 focus:outline-none focus:border-[#8B6F5A]/50 focus:ring-1 focus:ring-[#18283D]/30 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Capability & Skill Threshold Calibration */}
          <div className="bg-[#FAF7F2]/80 border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
            <div>
              <h2 className="text-lg font-bold text-[#18283D] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#D8C3A5]/30 text-[#8B6F5A] border border-[#18283D]/30 text-xs flex items-center justify-center font-mono font-bold">
                  2
                </span>
                <span>Capability Requirements & Minimum Thresholds</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select skills from the ATLAS catalogue. Set whether each skill is Required or Preferred, and specify the minimum expected level (0–100%).
              </p>
            </div>

            {/* Add Skill Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-[#FAF7F2]/80 border border-[#E5E7EB]">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                  Add from ATLAS Skill Catalogue:
                </label>
                <select
                  value={selectedCatalogueSkill}
                  onChange={(e) => setSelectedCatalogueSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E5E7EB] rounded-lg text-[#18283D] focus:outline-none focus:border-[#8B6F5A]/50"
                >
                  {DEFAULT_SKILL_CATALOGUE.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddRequirement}
                className="self-end px-4 py-2 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold transition-all shrink-0 shadow-sm"
              >
                + Add Skill
              </button>
            </div>

            {/* Configured Skills List */}
            <div className="space-y-4">
              {requirements.map((req) => (
                <div
                  key={req.skill}
                  className="p-4 rounded-xl bg-[#FAF7F2]/60 border border-[#E5E7EB] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-[#18283D] sm:text-sm font-mono">
                        {req.skill}
                      </span>
                      {/* Required vs Preferred Toggle */}
                      <div className="flex items-center gap-1 bg-[#E5E7EB] p-0.5 rounded-lg text-[10px] font-semibold border border-[#E5E7EB]">
                        <button
                          type="button"
                          onClick={() => handleUpdateRequirement(req.skill, { type: 'required' })}
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            req.type === 'required'
                              ? 'bg-[#18283D] text-[#FAF7F2] shadow-2xs'
                              : 'text-[#6B7280] hover:text-[#18283D]'
                          }`}
                        >
                          Required
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRequirement(req.skill, { type: 'preferred' })}
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            req.type === 'preferred'
                              ? 'bg-[#8B6F5A] text-[#FAF7F2] shadow-2xs'
                              : 'text-[#6B7280] hover:text-[#18283D]'
                          }`}
                        >
                          Preferred
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req.skill)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Slider for Minimum Expected Level */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Minimum Expected Level:
                      </span>
                      <span className="font-mono font-bold text-[#8B6F5A]">
                        {req.minLevel}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={95}
                      step={5}
                      value={req.minLevel}
                      onChange={(e) =>
                        handleUpdateRequirement(req.skill, {
                          minLevel: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-violet-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Foundational (30%)</span>
                      <span>Competent (65%)</span>
                      <span>Advanced (90%+)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/employer"
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-[#6B7280] text-xs font-semibold hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              Publish Opportunity & Calibrate Matches →
            </button>
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
};

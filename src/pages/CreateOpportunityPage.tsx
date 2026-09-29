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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <EmployerHeader />

      <main className="w-full pt-20 flex-1 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#737874]">
          <Link to="/employer" className="hover:text-[#0d1f18] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Employer Portal</span>
          </Link>
          <span>/</span>
          <span className="text-[#0d1f18] font-medium">Create Opportunity</span>
        </div>

        {/* Page Heading */}
        <section className="space-y-1 pb-4 border-b border-[#e5e2dc]">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-semibold">
            Capability Calibration
          </span>
          <h1 className="font-headline-xl text-3xl font-bold text-[#0d1f18] tracking-tight">
            Post an opportunity.
          </h1>
          <p className="text-xs sm:text-sm text-[#424845]">
            Define the exact competency thresholds required. ATLAS will immediately match your opening with evaluated candidates.
          </p>
        </section>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Role Overview */}
          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-[#0d1f18]">
              1. Role Identity & Context
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Data Analyst"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Analytics"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Target Role Category
                </label>
                <select
                  value={targetRoleCategory}
                  onChange={(e) => setTargetRoleCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
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
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote or San Francisco, CA (Hybrid)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                >
                  <option value="Fresher">Fresher (0-1 yrs)</option>
                  <option value="Student">Student</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Early Career">Early Career (1-3 yrs)</option>
                  <option value="Experienced">Experienced (3+ yrs)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Compensation Range (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $70,000 – $85,000"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#0d1f18] block">
                  Role Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe key responsibilities, project scope, and daily engineering or analysis workflows..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#fbf9f4] border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Capability & Skill Threshold Calibration */}
          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#0d1f18]">
                2. Capability Requirements & Minimum Thresholds
              </h2>
              <p className="text-xs text-[#5a625d] mt-0.5">
                Select skills from the ATLAS catalogue. Set whether each skill is Required or Preferred, and specify the minimum expected level (0–100%).
              </p>
            </div>

            {/* Add Skill Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-[#f8f5ee] border border-[#e5e0d6]">
              <div className="flex-1">
                <label className="text-[11px] text-[#737874] uppercase tracking-wider block font-semibold mb-1">
                  Add from ATLAS Skill Catalogue:
                </label>
                <select
                  value={selectedCatalogueSkill}
                  onChange={(e) => setSelectedCatalogueSkill(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#d6d0c4] rounded-lg focus:outline-none focus:border-[#6b4ea6]"
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
                className="self-end px-4 py-2 rounded-lg bg-[#0d1f18] text-white text-xs font-semibold hover:bg-[#22382f] transition-colors shrink-0"
              >
                + Add Skill
              </button>
            </div>

            {/* Configured Skills List */}
            <div className="space-y-4">
              {requirements.map((req) => (
                <div
                  key={req.skill}
                  className="p-4 rounded-xl bg-[#fcfbf8] border border-[#e5e2dc] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-[#0d1f18] sm:text-sm">
                        {req.skill}
                      </span>
                      {/* Required vs Preferred Toggle */}
                      <div className="flex items-center gap-1 bg-[#ede8de] p-0.5 rounded-lg text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => handleUpdateRequirement(req.skill, { type: 'required' })}
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            req.type === 'required'
                              ? 'bg-[#0d1f18] text-white'
                              : 'text-[#5a625d] hover:text-[#0d1f18]'
                          }`}
                        >
                          Required
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRequirement(req.skill, { type: 'preferred' })}
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            req.type === 'preferred'
                              ? 'bg-[#6b4ea6] text-white'
                              : 'text-[#5a625d] hover:text-[#0d1f18]'
                          }`}
                        >
                          Preferred
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req.skill)}
                      className="text-xs text-[#ba1a1a] hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Slider for Minimum Expected Level */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#737874] text-[11px]">
                        Minimum Expected Level:
                      </span>
                      <span className="font-mono font-bold text-[#0d1f18]">
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
                      className="w-full accent-[#6b4ea6] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#737874]">
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
              className="px-5 py-2.5 rounded-lg border border-[#d6d0c4] text-[#424845] text-xs font-semibold hover:bg-[#ede8de] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold tracking-wide transition-colors shadow-sm"
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

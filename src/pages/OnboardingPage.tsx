import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ExperienceLevel, CurrentYear, UserProfile } from '../types/atlas';
import { ROLES_CATALOGUE, getRoleDefinition } from '../data/rolesData';
import { PageTransition, AnimatedProgressBar } from '../components/motion/Motion';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { ProfileService } from '../services/profileService';

const EXPERIENCE_CARDS: { level: ExperienceLevel; label: string; desc: string; icon: string }[] = [
  {
    level: 'Beginner',
    label: 'Beginner',
    desc: 'Exploring career paths with no prior formal coursework.',
    icon: 'explore'
  },
  {
    level: 'Student',
    label: 'Student',
    desc: 'Currently enrolled in an undergraduate or graduate degree.',
    icon: 'school'
  },
  {
    level: 'Fresher',
    label: 'Fresher',
    desc: 'Recent graduate entering the job market seeking first role.',
    icon: 'workspace_premium'
  },
  {
    level: 'Early Career',
    label: 'Early Career',
    desc: '1–3 years experience looking to level up or pivot trajectory.',
    icon: 'trending_up'
  },
  {
    level: 'Experienced',
    label: 'Experienced',
    desc: '3+ years established track record aiming for senior tier.',
    icon: 'military_tech'
  }
];

const YEAR_OPTIONS: CurrentYear[] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Final Year',
  'Graduated'
];

export const OnboardingPage: React.FC = () => {
  const { state, createProfile, loadDemoProfile } = useAtlas();
  const navigate = useNavigate();

  // Wizard Step: 1 = Personal Profile, 2 = Career Goal, 3 = Goal Personalization & Skills, 4 = Availability, 5 = Ready
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [fullName, setFullName] = useState(state.profile.fullName || '');
  const [email, setEmail] = useState(
    state.profile.email || SupabaseAuthService.getSession()?.user?.email || ''
  );
  const [college, setCollege] = useState(state.profile.college || '');
  const [degree, setDegree] = useState(state.profile.degree || '');
  const [year, setYear] = useState<CurrentYear>(state.profile.year || '3rd Year');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(state.profile.experienceLevel || 'Fresher');

  // Role Selection State
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    state.targetRole ? state.targetRole.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'data-analyst'
  );
  const [isOtherRole, setIsOtherRole] = useState(false);
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Dynamic self-ratings for the chosen role's skills
  const [selfRatings, setSelfRatings] = useState<Record<string, number>>({});
  const [availability, setAvailability] = useState<number>(state.availability || 10);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Compute selected role definition
  const effectiveRoleName = isOtherRole
    ? (customRoleTitle.trim() || 'Custom Specialist')
    : (ROLES_CATALOGUE.find((r) => r.id === selectedRoleId)?.name || 'Data Analyst');

  const selectedRoleDef = getRoleDefinition(effectiveRoleName);

  // Initialize self ratings when moving to step 3
  const handleProceedToStep3 = () => {
    const initial: Record<string, number> = {};
    selectedRoleDef.skills.forEach((s) => {
      initial[s.name] = selfRatings[s.name] ?? s.defaultBaseline;
    });
    setSelfRatings(initial);
    setCurrentStep(3);
  };

  // Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!college.trim()) errs.college = 'College / Institution is required.';
    if (!degree.trim()) errs.degree = 'Degree / Course is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (isOtherRole && !customRoleTitle.trim()) {
        setErrors({ customRole: 'Please enter your custom target role title.' });
        return;
      }
      setErrors({});
      handleProceedToStep3();
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleFinishOnboarding = async () => {
    const sessionUserEmail = SupabaseAuthService.getSession()?.user?.email;
    const finalEmail =
      email.trim() || sessionUserEmail || `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@atlas.edu`;

    const newProfile: UserProfile = {
      id: state.profile.id || `usr-${Date.now().toString(36)}`,
      fullName: fullName.trim(),
      email: finalEmail,
      college: college.trim(),
      degree: degree.trim(),
      year,
      experienceLevel,
      targetRole: effectiveRoleName,
      customRole: isOtherRole ? customRoleTitle.trim() : undefined,
      hasCompletedSetup: true
    };

    createProfile(newProfile, selfRatings, availability);

    const token = SupabaseAuthService.getAccessToken();
    if (token) {
      await ProfileService.saveRemoteProfile(newProfile, token, availability);
    }

    if (!state.assessmentCompleted) {
      navigate('/assessment');
    } else {
      navigate('/diagnosis');
    }
  };

  const handleApplyDemo = () => {
    loadDemoProfile();
    navigate('/diagnosis');
  };

  // Unique categories for filtering roles
  const categories = ['All', 'Data & Analytics', 'Engineering', 'Design', 'Product', 'Marketing', 'Security', 'Cloud & DevOps', 'AI & Data'];
  const filteredRoles = ROLES_CATALOGUE.filter((r) => categoryFilter === 'All' || r.category === categoryFilter);

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F1F5F9] flex flex-col font-sans relative overflow-hidden">
      <Header />

      <PageTransition className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Wizard Progression Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-violet-400 uppercase tracking-widest px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20">
                Calibration Stage 0{currentStep} / 05
              </span>
            </div>
            
            {/* Quick Demo Shortcut */}
            <button
              type="button"
              onClick={handleApplyDemo}
              className="btn-interactive text-xs font-mono text-teal-300 hover:text-white transition-colors"
            >
              ⚡ Use demo profile (Data Analyst)
            </button>
          </div>

          <AnimatedProgressBar
            value={(currentStep / 5) * 100}
            className="w-full h-1.5 mt-3"
            trackClassName="bg-[#11182B] rounded-full overflow-hidden"
            fillClassName="bg-violet-600 rounded-full shadow-sm"
            durationMs={350}
          />
        </div>

        {/* STEP 1: PERSONAL PROFILE */}
        {currentStep === 1 && (
          <div key="step-1" className="space-y-8 animate-fade-in-up">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#94A3B8] block mb-1">
                Candidate Profile
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Let's build your career profile.
              </h1>
              <p className="text-[#94A3B8] text-sm mt-2 max-w-2xl leading-relaxed">
                Tell ATLAS a little about yourself so we can calibrate your career journey around your exact background.
              </p>
            </div>

            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    College / Institution <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology / State University"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                  {errors.college && <p className="text-[11px] text-rose-400 mt-1">{errors.college}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Degree / Course <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science / B.Sc Statistics"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
                  />
                  {errors.degree && <p className="text-[11px] text-rose-400 mt-1">{errors.degree}</p>}
                </div>
              </div>

              {/* Current Year Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-2">
                  Current Year of Study / Standing
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {YEAR_OPTIONS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        year === y
                          ? 'bg-violet-600 border-violet-500 text-white shadow-sm'
                          : 'bg-[#0D1224] border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level Visual Selectable Cards */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#CBD5E1] mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EXPERIENCE_CARDS.map((item) => {
                    const isSelected = experienceLevel === item.level;
                    return (
                      <div
                        key={item.level}
                        onClick={() => setExperienceLevel(item.level)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-violet-900/20 border-violet-500 shadow-sm'
                            : 'bg-[#0D1224] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="material-symbols-outlined text-[20px] text-violet-400">
                            {item.icon}
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 ${
                              isSelected ? 'bg-violet-400 border-violet-400' : 'border-white/20'
                            }`}
                          />
                        </div>
                        <h4 className="font-bold text-sm text-white">{item.label}</h4>
                        <p className="text-xs text-[#94A3B8] mt-1 leading-snug">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 btn-interactive"
              >
                <span>Continue to Career Goal</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CAREER GOAL SELECTION */}
        {currentStep === 2 && (
          <div key="step-2" className="space-y-8 animate-fade-in-up">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#94A3B8] block mb-1">
                Target Role
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                What do you want to become?
              </h1>
              <p className="text-[#94A3B8] text-sm mt-2 max-w-2xl leading-relaxed">
                Choose the role you are preparing for. ATLAS will use this goal to personalize your competency assessment, skill gaps, resources and roadmap.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    categoryFilter === cat
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-[#11182B] border border-white/10 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map((role) => {
                const isSelected = !isOtherRole && selectedRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setIsOtherRole(false);
                      setErrors({});
                    }}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-violet-900/25 border-violet-500 shadow-sm'
                        : 'bg-[#11182B] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-300">
                          {role.category}
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 ${
                            isSelected ? 'bg-violet-400 border-violet-400' : 'border-white/20'
                          }`}
                        />
                      </div>

                      <h3 className="text-lg font-bold text-white">{role.name}</h3>
                      <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
                        {role.shortDescription}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                        5 Evaluated Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.requiredSkills.slice(0, 3).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-[#CBD5E1]">
                            {s}
                          </span>
                        ))}
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-teal-300">
                          +{role.requiredSkills.length - 3} more
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* "Other" Custom Role Card */}
              <div
                onClick={() => {
                  setIsOtherRole(true);
                  setErrors({});
                }}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isOtherRole
                    ? 'bg-violet-900/25 border-violet-500 shadow-sm'
                    : 'bg-[#11182B] border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-300">
                      Custom Vector
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 ${
                        isOtherRole ? 'bg-teal-400 border-teal-400' : 'border-white/20'
                      }`}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-white">Other Career Goal</h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                    Preparing for a specialized or interdisciplinary trajectory? Enter your custom role title.
                  </p>
                </div>

                {isOtherRole && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <label className="block text-[11px] font-mono font-bold text-white mb-1">
                      Enter Target Role Title:
                    </label>
                    <input
                      type="text"
                      value={customRoleTitle}
                      onChange={(e) => setCustomRoleTitle(e.target.value)}
                      placeholder="e.g. Bio-Informatics Engineer"
                      className="w-full px-3 py-2 rounded-xl border border-violet-500 bg-[#0D1224] text-xs text-white focus:outline-none"
                    />
                    {errors.customRole && <p className="text-[10px] text-rose-400 mt-1">{errors.customRole}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              >
                ← Back to Profile
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm btn-interactive"
              >
                <span>Preview Competencies</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CAREER GOAL PERSONALIZATION PREVIEW & SELF-RATING */}
        {currentStep === 3 && (
          <div key="step-3" className="space-y-8 animate-fade-in-up">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#94A3B8] block mb-1">
                Competency Calibration
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 block">
                TARGET ROLE: {effectiveRoleName}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                Calibrate your baseline skills.
              </h1>
              <p className="text-[#94A3B8] text-sm mt-2 max-w-2xl leading-relaxed">
                Calibrate your current baseline self-assessment across the 5 core evaluated competencies:
              </p>
            </div>

            {/* Competencies Preview & Initial Baseline Sliders */}
            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#CBD5E1]">
                  Evaluated Competency Dimensions
                </span>
                <span className="text-xs font-mono text-teal-300">Standard Threshold: {selectedRoleDef.roleThreshold}%</span>
              </div>

              <div className="space-y-6">
                {selectedRoleDef.skills.map((skill) => {
                  const val = selfRatings[skill.name] ?? skill.defaultBaseline;
                  return (
                    <div key={skill.name} className="p-4 rounded-xl bg-[#0D1224] border border-white/5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-white">{skill.name}</h4>
                          <p className="text-xs text-[#94A3B8] mt-0.5">{skill.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className="font-mono text-sm font-bold text-violet-400">{val}%</span>
                          <span className="text-[10px] font-mono text-[#64748B] block">Baseline</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={val}
                          onChange={(e) =>
                            setSelfRatings({
                              ...selfRatings,
                              [skill.name]: parseInt(e.target.value, 10)
                            })
                          }
                          className="w-full accent-violet-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-[#64748B] mt-1">
                          <span>Beginner (10%)</span>
                          <span>Working Knowledge (50%)</span>
                          <span className="text-teal-400 font-semibold">Role Threshold ({skill.targetThreshold}%)</span>
                          <span>Mastery (100%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              >
                ← Back to Roles
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm btn-interactive"
              >
                <span>Continue to Availability</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: AVAILABILITY */}
        {currentStep === 4 && (
          <div key="step-4" className="space-y-8 animate-fade-in-up">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#94A3B8] block mb-1">
                Time Capacity
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Weekly Time Commitment
              </h1>
              <p className="text-[#94A3B8] text-sm mt-2 max-w-2xl leading-relaxed">
                How many hours per week can you allocate towards targeted competency drills, projects, and interview preparation?
              </p>
            </div>

            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[5, 10, 15, 20].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setAvailability(hrs)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all ${
                      availability === hrs
                        ? 'bg-violet-900/30 border-violet-500 shadow-sm'
                        : 'bg-[#0D1224] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="font-mono text-3xl font-extrabold text-white block">{hrs}h</span>
                    <span className="text-xs font-mono text-[#94A3B8] mt-1 block">per week</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#0D1224] border border-white/5 text-xs text-[#CBD5E1] leading-relaxed">
                <strong className="text-teal-400">ATLAS Scheduling Engine:</strong> Your weekly hours will be mathematically divided across your highest-priority competency deficits, ensuring maximum return on effort.
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              >
                ← Back to Skills
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm btn-interactive"
              >
                <span>Review Profile Summary</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PROFILE SUMMARY & CONFIRMATION */}
        {currentStep === 5 && (
          <div key="step-5" className="space-y-8 animate-fade-in-up">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-teal-400 font-bold block mb-1">
                {state.assessmentCompleted ? 'Profile Updated' : 'Profile Configured · Assessment Ready'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {state.assessmentCompleted ? 'Your ATLAS profile is updated.' : 'Your ATLAS profile is ready.'}
              </h1>
              <p className="text-[#94A3B8] text-sm mt-2 max-w-2xl leading-relaxed">
                {state.assessmentCompleted
                  ? 'Your career workspace has been configured around your profile, educational timeline, and target career goal.'
                  : 'Next Step: Take your calibrated 10-question dynamic competency assessment to empirically benchmark your demonstrated capabilities.'}
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-white/[0.08]">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block">Candidate</span>
                    <span className="text-xl font-bold text-white">{fullName}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block">Education</span>
                    <span className="text-xs text-white font-medium">
                      {degree} • {year}
                    </span>
                    <span className="text-xs text-[#94A3B8] block">{college}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block">Experience Level</span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-xs font-mono font-bold text-violet-300">
                      {experienceLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:border-l sm:border-white/[0.08] sm:pl-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold block">
                      Target Career Goal
                    </span>
                    <span className="text-xl font-bold text-white">{effectiveRoleName}</span>
                    <span className="text-xs font-mono text-[#94A3B8] block">{selectedRoleDef.category}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block">Weekly Availability</span>
                    <span className="font-bold text-sm text-white">{availability} Hours / Week</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-mono text-[#94A3B8] block">Calibrated Target Threshold</span>
                    <span className="font-mono text-sm font-bold text-teal-400">{selectedRoleDef.roleThreshold}%</span>
                  </div>
                </div>
              </div>

              {/* Core Competencies ATLAS will evaluate */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#CBD5E1] block mb-3">
                  Core Competencies ATLAS Will Evaluate ({selectedRoleDef.skills.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {selectedRoleDef.skills.map((s) => (
                    <div key={s.name} className="p-3 rounded-xl bg-[#0D1224] border border-white/5 text-xs">
                      <span className="font-bold text-white block">{s.name}</span>
                      <span className="text-[11px] text-[#94A3B8] mt-0.5 block truncate">{s.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Options */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/[0.08] text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-violet-400 hover:text-violet-300 hover:underline font-semibold"
                >
                  Edit Profile
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-violet-400 hover:text-violet-300 hover:underline font-semibold"
                >
                  Edit Career Goal
                </button>
              </div>
            </div>

            {/* Primary Enter / Start Assessment CTA */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-base font-bold transition-all shadow-sm flex items-center justify-center gap-3 btn-interactive"
              >
                <span>{state.assessmentCompleted ? 'Enter my ATLAS workspace' : 'Start Assessment'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </PageTransition>

      <Footer />
    </div>
  );
};

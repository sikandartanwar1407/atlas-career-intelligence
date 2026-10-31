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
    <div className="min-h-screen bg-[#F3F4F6] text-[#4B5563] flex flex-col font-sans relative overflow-hidden">
      <Header />

      <PageTransition className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Wizard Progression Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#8B6F5A] uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#D8C3A5]/25 border border-[#D8C3A5]">
                Calibration Stage 0{currentStep} / 05
              </span>
            </div>
            
            {/* Quick Demo Shortcut */}
            <button
              type="button"
              onClick={handleApplyDemo}
              className="btn-interactive text-xs font-mono text-[#8B6F5A] hover:text-[#18283D] transition-colors"
            >
              ⚡ Use demo profile (Data Analyst)
            </button>
          </div>

          <AnimatedProgressBar
            value={(currentStep / 5) * 100}
            className="w-full h-1.5 mt-3"
            trackClassName="bg-[#FAF7F2] rounded-full overflow-hidden"
            fillClassName="bg-violet-600 rounded-full shadow-sm"
            durationMs={350}
          />
        </div>

        {/* STEP 1: PERSONAL PROFILE */}
        {currentStep === 1 && (
          <div key="step-1" className="space-y-8 animate-fade-in-up">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B7280] block mb-1">
                Candidate Profile
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18283D] tracking-tight">
                Let's build your career profile.
              </h1>
              <p className="text-[#6B7280] text-sm mt-2 max-w-2xl leading-relaxed">
                Tell ATLAS a little about yourself so we can calibrate your career journey around your exact background.
              </p>
            </div>

            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
                    College / Institution <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology / State University"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                  />
                  {errors.college && <p className="text-[11px] text-rose-400 mt-1">{errors.college}</p>}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4B5563] mb-1.5">
                    Degree / Course <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science / B.Sc Statistics"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                  />
                  {errors.degree && <p className="text-[11px] text-rose-400 mt-1">{errors.degree}</p>}
                </div>
              </div>

              {/* Current Year Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4B5563] mb-2">
                  Current Year of Study / Standing
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {YEAR_OPTIONS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all duration-180 ${
                        year === y
                          ? 'bg-[#18283D] border-[#18283D] text-[#FAF7F2] shadow-sm -translate-y-0.5'
                          : 'bg-[#FAF7F2] border-[#E5E7EB] text-[#6B7280] hover:text-[#18283D] hover:border-[#8B6F5A]/50 hover:bg-[#D8C3A5]/15 hover:-translate-y-0.5 hover:shadow-xs'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level Visual Selectable Cards */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#4B5563] mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EXPERIENCE_CARDS.map((item) => {
                    const isSelected = experienceLevel === item.level;
                    return (
                      <div
                        key={item.level}
                        onClick={() => setExperienceLevel(item.level)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-out ${
                          isSelected
                            ? 'bg-[#D8C3A5]/20 border-[#18283D] shadow-sm -translate-y-0.5'
                            : 'bg-[#FAF7F2] border-[#E5E7EB] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="material-symbols-outlined text-[20px] text-[#8B6F5A]">
                            {item.icon}
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                              isSelected ? 'bg-[#18283D] border-[#18283D]' : 'border-[#E5E7EB]'
                            }`}
                          />
                        </div>
                        <h4 className="font-bold text-sm text-[#18283D]">{item.label}</h4>
                        <p className="text-xs text-[#6B7280] mt-1 leading-snug">{item.desc}</p>
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
                className="px-6 py-3 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-bold text-sm transition-all shadow-sm flex items-center gap-2 btn-interactive"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B7280] block mb-1">
                Target Role
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18283D] tracking-tight">
                What do you want to become?
              </h1>
              <p className="text-[#6B7280] text-sm mt-2 max-w-2xl leading-relaxed">
                Choose the role you are preparing for. ATLAS will use this goal to personalize your competency assessment, skill gaps, resources and roadmap.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-180 ${
                    categoryFilter === cat
                      ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                      : 'bg-[#FAF7F2] border border-[#E5E7EB] text-[#6B7280] hover:text-[#18283D] hover:border-[#8B6F5A]/50 hover:bg-[#D8C3A5]/15 hover:-translate-y-0.5'
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
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-out flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#D8C3A5]/20 border-[#18283D] shadow-sm -translate-y-0.5'
                        : 'bg-[#FAF7F2] border-[#E5E7EB] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#D8C3A5]/25 text-[#8B6F5A]">
                          {role.category}
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                            isSelected ? 'bg-[#18283D] border-[#18283D]' : 'border-[#E5E7EB]'
                          }`}
                        />
                      </div>

                      <h3 className="text-lg font-bold text-[#18283D]">{role.name}</h3>
                      <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed">
                        {role.shortDescription}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                      <span className="text-[10px] font-mono text-[#6B7280] uppercase block mb-1">
                        5 Evaluated Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.requiredSkills.slice(0, 3).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[10px] text-[#4B5563]">
                            {s}
                          </span>
                        ))}
                        <span className="px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[10px] text-[#8B6F5A]">
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
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-out flex flex-col justify-between ${
                  isOtherRole
                    ? 'bg-[#D8C3A5]/20 border-[#18283D] shadow-sm -translate-y-0.5'
                    : 'bg-[#FAF7F2] border-[#E5E7EB] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#D8C3A5]/25 text-[#8B6F5A]">
                      Custom Vector
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                        isOtherRole ? 'bg-[#18283D] border-[#18283D]' : 'border-[#E5E7EB]'
                      }`}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-[#18283D]">Other Career Goal</h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Preparing for a specialized or interdisciplinary trajectory? Enter your custom role title.
                  </p>
                </div>

                {isOtherRole && (
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                    <label className="block text-[11px] font-mono font-bold text-[#18283D] mb-1">
                      Enter Target Role Title:
                    </label>
                    <input
                      type="text"
                      value={customRoleTitle}
                      onChange={(e) => setCustomRoleTitle(e.target.value)}
                      placeholder="e.g. Bio-Informatics Engineer"
                      className="w-full px-3 py-2 rounded-xl border border-violet-500 bg-[#FAF7F2] text-xs text-[#18283D] focus:outline-none"
                    />
                    {errors.customRole && <p className="text-[10px] text-rose-400 mt-1">{errors.customRole}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40"
              >
                ← Back to Profile
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-bold text-xs flex items-center gap-2 shadow-sm btn-interactive"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B7280] block mb-1">
                Competency Calibration
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B6F5A] block">
                TARGET ROLE: {effectiveRoleName}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18283D] mt-1">
                Calibrate your baseline skills.
              </h1>
              <p className="text-[#6B7280] text-sm mt-2 max-w-2xl leading-relaxed">
                Calibrate your current baseline self-assessment across the 5 core evaluated competencies:
              </p>
            </div>

            {/* Competencies Preview & Initial Baseline Sliders */}
            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#4B5563]">
                  Evaluated Competency Dimensions
                </span>
                <span className="text-xs font-mono text-[#8B6F5A]">Standard Threshold: {selectedRoleDef.roleThreshold}%</span>
              </div>

              <div className="space-y-6">
                {selectedRoleDef.skills.map((skill) => {
                  const val = selfRatings[skill.name] ?? skill.defaultBaseline;
                  return (
                    <div key={skill.name} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-[#18283D]">{skill.name}</h4>
                          <p className="text-xs text-[#6B7280] mt-0.5">{skill.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className="font-mono text-sm font-bold text-[#8B6F5A]">{val}%</span>
                          <span className="text-[10px] font-mono text-[#6B7280] block">Baseline</span>
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
                        <div className="flex justify-between text-[10px] font-mono text-[#6B7280] mt-1">
                          <span>Beginner (10%)</span>
                          <span>Working Knowledge (50%)</span>
                          <span className="text-[#8B6F5A] font-semibold">Role Threshold ({skill.targetThreshold}%)</span>
                          <span>Mastery (100%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40"
              >
                ← Back to Roles
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-bold text-xs flex items-center gap-2 shadow-sm btn-interactive"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B7280] block mb-1">
                Time Capacity
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18283D] tracking-tight">
                Weekly Time Commitment
              </h1>
              <p className="text-[#6B7280] text-sm mt-2 max-w-2xl leading-relaxed">
                How many hours per week can you allocate towards targeted competency drills, projects, and interview preparation?
              </p>
            </div>

            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[5, 10, 15, 20].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setAvailability(hrs)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 ease-out cursor-pointer ${
                      availability === hrs
                        ? 'bg-[#D8C3A5]/20 border-[#18283D] shadow-sm -translate-y-0.5'
                        : 'bg-[#FAF7F2] border-[#E5E7EB] hover:border-[#8B6F5A]/60 hover:bg-[#D8C3A5]/10 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <span className="font-mono text-3xl font-extrabold text-[#18283D] block">{hrs}h</span>
                    <span className="text-xs font-mono text-[#6B7280] mt-1 block">per week</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-xs text-[#4B5563] leading-relaxed">
                <strong className="text-[#8B6F5A]">ATLAS Scheduling Engine:</strong> Your weekly hours will be mathematically divided across your highest-priority competency deficits, ensuring maximum return on effort.
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] hover:text-[#18283D] hover:bg-[#D8C3A5]/20 hover:border-[#D8C3A5]/40"
              >
                ← Back to Skills
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-bold text-xs flex items-center gap-2 shadow-sm btn-interactive"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#8B6F5A] font-bold block mb-1">
                {state.assessmentCompleted ? 'Profile Updated' : 'Profile Configured · Assessment Ready'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18283D] tracking-tight">
                {state.assessmentCompleted ? 'Your ATLAS profile is updated.' : 'Your ATLAS profile is ready.'}
              </h1>
              <p className="text-[#6B7280] text-sm mt-2 max-w-2xl leading-relaxed">
                {state.assessmentCompleted
                  ? 'Your career workspace has been configured around your profile, educational timeline, and target career goal.'
                  : 'Next Step: Take your calibrated 10-question dynamic competency assessment to empirically benchmark your demonstrated capabilities.'}
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-[0_20px_50px_rgba(24,40,61,0.08)] space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#E5E7EB]">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] block">Candidate</span>
                    <span className="text-xl font-bold text-[#18283D]">{fullName}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] block">Education</span>
                    <span className="text-xs text-[#18283D] font-medium">
                      {degree} • {year}
                    </span>
                    <span className="text-xs text-[#6B7280] block">{college}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] block">Experience Level</span>
                    <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md bg-[#D8C3A5]/25 border border-[#18283D]/30 text-xs font-mono font-bold text-[#8B6F5A]">
                      {experienceLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:border-l sm:border-[#E5E7EB] sm:pl-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#8B6F5A] font-bold block">
                      Target Career Goal
                    </span>
                    <span className="text-xl font-bold text-[#18283D]">{effectiveRoleName}</span>
                    <span className="text-xs font-mono text-[#6B7280] block">{selectedRoleDef.category}</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] block">Weekly Availability</span>
                    <span className="font-bold text-sm text-[#18283D]">{availability} Hours / Week</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-mono text-[#6B7280] block">Calibrated Target Threshold</span>
                    <span className="font-mono text-sm font-bold text-[#8B6F5A]">{selectedRoleDef.roleThreshold}%</span>
                  </div>
                </div>
              </div>

              {/* Core Competencies ATLAS will evaluate */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#4B5563] block mb-3">
                  Core Competencies ATLAS Will Evaluate ({selectedRoleDef.skills.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {selectedRoleDef.skills.map((s) => (
                    <div key={s.name} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] text-xs">
                      <span className="font-bold text-[#18283D] block">{s.name}</span>
                      <span className="text-[11px] text-[#6B7280] mt-0.5 block truncate">{s.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Options */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E5E7EB] text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-[#8B6F5A] hover:text-[#8B6F5A] hover:underline font-semibold"
                >
                  Edit Profile
                </button>
                <span className="text-[#6B7280]">•</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-[#8B6F5A] hover:text-[#8B6F5A] hover:underline font-semibold"
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-base font-bold transition-all shadow-sm flex items-center justify-center gap-3 btn-interactive"
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

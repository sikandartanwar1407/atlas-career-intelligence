import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ExperienceLevel, CurrentYear, UserProfile } from '../types/atlas';
import { ROLES_CATALOGUE, getRoleDefinition } from '../data/rolesData';
import { PageTransition, AnimatedProgressBar } from '../components/motion/Motion';

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
  const [email, setEmail] = useState(state.profile.email || '');
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

  const handleFinishOnboarding = () => {
    const newProfile: UserProfile = {
      id: state.profile.id || `usr-${Date.now().toString(36)}`,
      fullName: fullName.trim(),
      email: email.trim(),
      college: college.trim(),
      degree: degree.trim(),
      year,
      experienceLevel,
      targetRole: effectiveRoleName,
      customRole: isOtherRole ? customRoleTitle.trim() : undefined,
      hasCompletedSetup: true
    };

    createProfile(newProfile, selfRatings, availability);
    navigate('/diagnosis');
  };

  const handleApplyDemo = () => {
    loadDemoProfile();
    navigate('/diagnosis');
  };

  // Unique categories for filtering roles
  const categories = ['All', 'Data & Analytics', 'Engineering', 'Design', 'Product', 'Marketing', 'Security', 'Cloud & DevOps', 'AI & Data'];
  const filteredRoles = ROLES_CATALOGUE.filter((r) => categoryFilter === 'All' || r.category === categoryFilter);

  return (
    <div className="min-h-screen bg-[#fcf9f3] text-[#0d1f18] flex flex-col font-sans">
      <Header />

      <PageTransition className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Wizard Progression Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#e5e2dc]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xs font-bold text-[#6b4ea6] uppercase tracking-widest">
                Career Setup Step 0{currentStep} / 05
              </span>
            </div>
            
            {/* Quick Demo Shortcut */}
            <button
              type="button"
              onClick={handleApplyDemo}
              className="btn-interactive text-xs text-[#737874] hover:text-[#0d1f18] underline font-medium"
            >
              ⚡ Use demo profile (Data Analyst)
            </button>
          </div>

          <AnimatedProgressBar
            value={(currentStep / 5) * 100}
            className="w-full h-1.5 mt-3"
            trackClassName="bg-[#e5e2dc] rounded-full overflow-hidden"
            fillClassName="bg-[#0d1f18] rounded-full"
            durationMs={350}
          />
        </div>

        {/* STEP 1: PERSONAL PROFILE */}
        {currentStep === 1 && (
          <div key="step-1" className="space-y-8 animate-fade-in-up">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#737874] block mb-1">
                Calibration Stage 01
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0d1f18]">
                Let's build your career profile.
              </h1>
              <p className="text-[#424845] text-sm mt-2 max-w-2xl leading-relaxed">
                Tell ATLAS a little about yourself so we can calibrate your career journey around your goals.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18] mb-1.5">
                    Full Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  />
                  {errors.fullName && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18] mb-1.5">
                    College / Institution <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology / State University"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  />
                  {errors.college && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.college}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18] mb-1.5">
                    Degree / Course <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science / B.Sc Statistics"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  />
                  {errors.degree && <p className="text-[11px] text-[#ba1a1a] mt-1">{errors.degree}</p>}
                </div>
              </div>

              {/* Current Year Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18] mb-2">
                  Current Year of Study / Standing
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {YEAR_OPTIONS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                        year === y
                          ? 'bg-[#0d1f18] border-[#0d1f18] text-white shadow-xs'
                          : 'bg-[#fcf9f3] border-[#e5e2dc] text-[#424845] hover:border-[#c2c8c3]'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level Visual Selectable Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18] mb-2">
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
                            ? 'bg-[#d2e7dc]/30 border-[#4f6359] shadow-xs'
                            : 'bg-[#fcf9f3] border-[#e5e2dc] hover:border-[#c2c8c3]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="material-symbols-outlined text-[20px] text-[#4f6359]">
                            {item.icon}
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 ${
                              isSelected ? 'bg-[#0d1f18] border-[#0d1f18]' : 'border-[#c2c8c3]'
                            }`}
                          />
                        </div>
                        <h4 className="font-bold text-sm text-[#0d1f18]">{item.label}</h4>
                        <p className="text-xs text-[#737874] mt-1 leading-snug">{item.desc}</p>
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
                className="px-6 py-3 rounded-lg bg-[#0d1f18] text-white font-semibold text-sm hover:bg-[#22382f] transition-colors flex items-center gap-2"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#737874] block mb-1">
                Calibration Stage 02
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0d1f18]">
                What do you want to become?
              </h1>
              <p className="text-[#424845] text-sm mt-2 max-w-2xl leading-relaxed">
                Choose the role you are preparing for. ATLAS will use this goal to personalize your competency assessment, skill gaps, resources and roadmap.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-[#e5e2dc] pb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#0d1f18] text-white'
                      : 'bg-white border border-[#e5e2dc] text-[#424845] hover:bg-[#f6f3ed]'
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
                        ? 'bg-[#eaddff]/30 border-[#6b4ea6] shadow-sm'
                        : 'bg-white border-[#e5e2dc] hover:border-[#c2c8c3]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f6f3ed] text-[#737874]">
                          {role.category}
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 ${
                            isSelected ? 'bg-[#6b4ea6] border-[#6b4ea6]' : 'border-[#c2c8c3]'
                          }`}
                        />
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#0d1f18]">{role.name}</h3>
                      <p className="text-xs text-[#424845] mt-1.5 line-clamp-2 leading-relaxed">
                        {role.shortDescription}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f1eee7]">
                      <span className="text-[10px] font-mono text-[#737874] uppercase block mb-1">
                        5 Evaluated Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.requiredSkills.slice(0, 3).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-[#f6f3ed] text-[10px] text-[#0d1f18]">
                            {s}
                          </span>
                        ))}
                        <span className="px-1.5 py-0.5 rounded bg-[#f6f3ed] text-[10px] text-[#737874]">
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
                    ? 'bg-[#eaddff]/30 border-[#6b4ea6] shadow-sm'
                    : 'bg-white border-[#e5e2dc] hover:border-[#c2c8c3]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f6f3ed] text-[#737874]">
                      Custom Vector
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 ${
                        isOtherRole ? 'bg-[#6b4ea6] border-[#6b4ea6]' : 'border-[#c2c8c3]'
                      }`}
                    />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#0d1f18]">Other Career Goal</h3>
                  <p className="text-xs text-[#424845] mt-1.5 leading-relaxed">
                    Preparing for a specialized or interdisciplinary trajectory? Enter your custom role title.
                  </p>
                </div>

                {isOtherRole && (
                  <div className="mt-4 pt-3 border-t border-[#f1eee7]">
                    <label className="block text-[11px] font-bold text-[#0d1f18] mb-1">
                      Enter Target Role Title:
                    </label>
                    <input
                      type="text"
                      value={customRoleTitle}
                      onChange={(e) => setCustomRoleTitle(e.target.value)}
                      placeholder="e.g. Bio-Informatics Engineer"
                      className="w-full px-3 py-2 rounded border border-[#6b4ea6] bg-white text-xs text-[#0d1f18] focus:outline-none"
                    />
                    {errors.customRole && <p className="text-[10px] text-[#ba1a1a] mt-1">{errors.customRole}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#e5e2dc]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-lg border border-[#e5e2dc] text-xs font-semibold text-[#737874] hover:bg-[#f6f3ed]"
              >
                ← Back to Profile
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-lg bg-[#0d1f18] text-white font-semibold text-xs hover:bg-[#22382f] flex items-center gap-2"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#737874] block mb-1">
                Calibration Stage 03
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6b4ea6] block">
                YOUR TARGET ROLE
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0d1f18] mt-1">
                {effectiveRoleName}
              </h1>
              <p className="text-[#424845] text-sm mt-2 max-w-2xl leading-relaxed">
                ATLAS will calibrate your journey around this role. Calibrate your current baseline self-assessment across the 5 core evaluated competencies:
              </p>
            </div>

            {/* Competencies Preview & Initial Baseline Sliders */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1eee7]">
                <span className="text-xs uppercase tracking-wider font-bold text-[#737874]">
                  Evaluated Competency Dimensions
                </span>
                <span className="text-xs text-[#737874]">Standard Role Threshold: {selectedRoleDef.roleThreshold}%</span>
              </div>

              <div className="space-y-6">
                {selectedRoleDef.skills.map((skill) => {
                  const val = selfRatings[skill.name] ?? skill.defaultBaseline;
                  return (
                    <div key={skill.name} className="p-4 rounded-lg bg-[#fcf9f3] border border-[#e5e2dc] space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-[#0d1f18]">{skill.name}</h4>
                          <p className="text-xs text-[#737874] mt-0.5">{skill.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className="font-mono text-sm font-bold text-[#0d1f18]">{val}%</span>
                          <span className="text-[10px] text-[#737874] block">Baseline</span>
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
                          className="w-full accent-[#0d1f18] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#737874] mt-1">
                          <span>Beginner (10%)</span>
                          <span>Working Knowledge (50%)</span>
                          <span>Role Threshold ({skill.targetThreshold}%)</span>
                          <span>Mastery (100%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#e5e2dc]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-lg border border-[#e5e2dc] text-xs font-semibold text-[#737874] hover:bg-[#f6f3ed]"
              >
                ← Back to Roles
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-lg bg-[#0d1f18] text-white font-semibold text-xs hover:bg-[#22382f] flex items-center gap-2"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#737874] block mb-1">
                Calibration Stage 04
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0d1f18]">
                Weekly Time Commitment
              </h1>
              <p className="text-[#424845] text-sm mt-2 max-w-2xl leading-relaxed">
                How many hours per week can you allocate towards targeted competency drills, projects, and interview preparation?
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[5, 10, 15, 20].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setAvailability(hrs)}
                    className={`p-5 rounded-xl border-2 text-center transition-all ${
                      availability === hrs
                        ? 'bg-[#d2e7dc]/30 border-[#4f6359] shadow-xs'
                        : 'bg-[#fcf9f3] border-[#e5e2dc] hover:border-[#c2c8c3]'
                    }`}
                  >
                    <span className="font-serif text-3xl font-bold text-[#0d1f18] block">{hrs}h</span>
                    <span className="text-xs text-[#737874] mt-1 block">per week</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] text-xs text-[#424845] leading-relaxed">
                <strong>ATLAS Scheduling Engine:</strong> Your weekly hours will be mathematically divided across your highest-priority competency deficits, ensuring maximum return on effort.
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#e5e2dc]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-lg border border-[#e5e2dc] text-xs font-semibold text-[#737874] hover:bg-[#f6f3ed]"
              >
                ← Back to Skills
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-lg bg-[#0d1f18] text-white font-semibold text-xs hover:bg-[#22382f] flex items-center gap-2"
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
              <span className="font-mono text-xs uppercase tracking-widest text-[#737874] block mb-1">
                Calibration Complete
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0d1f18]">
                Your ATLAS profile is ready.
              </h1>
              <p className="text-[#424845] text-sm mt-2 max-w-2xl leading-relaxed">
                Your career workspace has been configured around your profile, educational timeline, and target career goal.
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#e5e2dc] shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#f1eee7]">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#737874] block">Candidate</span>
                    <span className="font-serif text-xl font-bold text-[#0d1f18]">{fullName}</span>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#737874] block">Education</span>
                    <span className="text-xs text-[#0d1f18] font-medium">
                      {degree} • {year}
                    </span>
                    <span className="text-xs text-[#737874] block">{college}</span>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#737874] block">Experience Level</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#f6f3ed] text-xs font-bold text-[#0d1f18]">
                      {experienceLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:border-l sm:border-[#f1eee7] sm:pl-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#6b4ea6] font-bold block">
                      Target Career Goal
                    </span>
                    <span className="font-serif text-xl font-bold text-[#0d1f18]">{effectiveRoleName}</span>
                    <span className="text-xs text-[#737874] block">{selectedRoleDef.category}</span>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#737874] block">Weekly Availability</span>
                    <span className="font-bold text-sm text-[#0d1f18]">{availability} Hours / Week</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-[#737874] block">Calibrated Target Threshold</span>
                    <span className="font-mono text-sm font-bold text-[#0d1f18]">{selectedRoleDef.roleThreshold}%</span>
                  </div>
                </div>
              </div>

              {/* Core Competencies ATLAS will evaluate */}
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#737874] block mb-3">
                  Core Competencies ATLAS Will Evaluate ({selectedRoleDef.skills.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {selectedRoleDef.skills.map((s) => (
                    <div key={s.name} className="p-3 rounded-lg bg-[#fcf9f3] border border-[#e5e2dc] text-xs">
                      <span className="font-bold text-[#0d1f18] block">{s.name}</span>
                      <span className="text-[11px] text-[#737874] mt-0.5 block truncate">{s.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Options */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#f1eee7] text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-[#6b4ea6] hover:underline font-semibold"
                >
                  Edit Profile
                </button>
                <span className="text-[#c2c8c3]">•</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-[#6b4ea6] hover:underline font-semibold"
                >
                  Edit Career Goal
                </button>
              </div>
            </div>

            {/* Primary Enter CTA */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white font-serif text-lg font-bold transition-all shadow-sm flex items-center justify-center gap-3"
              >
                <span>Enter my ATLAS workspace</span>
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

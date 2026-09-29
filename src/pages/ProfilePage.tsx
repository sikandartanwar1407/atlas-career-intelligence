import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ROLES_CATALOGUE } from '../data/rolesData';
import { ExperienceLevel, CurrentYear } from '../types/atlas';

const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['Beginner', 'Student', 'Fresher', 'Early Career', 'Experienced'];
const YEAR_OPTIONS: CurrentYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Graduated'];

export const ProfilePage: React.FC = () => {
  const {
    state,
    roleDefinition,
    hasProfile,
    careerReadiness,
    skillGaps,
    updateProfile,
    changeTargetRole,
    resetAssessment,
    resetAtlas
  } = useAtlas();
  const navigate = useNavigate();

  // Modals state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Edit profile form state
  const [name, setName] = useState(state.profile.fullName || '');
  const [email, setEmail] = useState(state.profile.email || '');
  const [college, setCollege] = useState(state.profile.college || '');
  const [degree, setDegree] = useState(state.profile.degree || '');
  const [year, setYear] = useState<CurrentYear>(state.profile.year || '1st Year');
  const [experience, setExperience] = useState<ExperienceLevel>(state.profile.experienceLevel || 'Student');

  // Change role selection state
  const [selectedNewRole, setSelectedNewRole] = useState(state.targetRole || 'Data Analyst');
  const [customRoleText, setCustomRoleText] = useState(state.profile.customRole || '');

  const completedSteps = state.roadmapSteps.filter((s) => s.completed).length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: name,
      email,
      college,
      degree,
      year,
      experienceLevel: experience
    });
    setIsEditingProfile(false);
  };

  const handleConfirmRoleChange = () => {
    const isOther = selectedNewRole === 'Other';
    const roleName = isOther ? (customRoleText.trim() || 'Custom Specialist') : selectedNewRole;
    changeTargetRole(roleName, isOther ? customRoleText.trim() : undefined);
    setIsChangingRole(false);
  };

  const handleRestartAssessment = () => {
    resetAssessment();
    navigate('/assessment');
  };

  const handleFullReset = () => {
    resetAtlas();
    setShowResetConfirm(false);
    navigate('/onboarding');
  };

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-[#fcf9f3] text-[#0d1f18] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 pt-28 pb-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#f6f3ed] border border-[#e5e2dc] flex items-center justify-center text-[#6b4ea6] mb-4 text-2xl font-bold">
            ?
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2">No Profile Found</h1>
          <p className="text-[#424845] max-w-md mb-6">
            Complete your ATLAS profile to begin calibrating role readiness, competency gaps, and custom roadmaps.
          </p>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded bg-[#0d1f18] text-white font-semibold hover:bg-[#22382f] transition-colors"
          >
            Create my profile →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f3] text-[#0d1f18] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Page Breadcrumb / Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e5e2dc] mb-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#737874] block mb-1">
              User Dossier • ATLAS ID #{state.profile.id ? state.profile.id.slice(0, 8) : 'ACTIVE'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0d1f18]">
              {state.profile.fullName}
            </h1>
            <p className="text-sm text-[#424845] mt-1">
              {state.profile.experienceLevel} • {state.profile.degree || 'Degree Underway'} at {state.profile.college || 'Institution'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-4 py-2 rounded border border-[#e5e2dc] bg-white hover:bg-[#f6f3ed] text-xs font-semibold uppercase tracking-wider text-[#0d1f18] transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsChangingRole(true)}
              className="px-4 py-2 rounded bg-[#6b4ea6] hover:bg-[#583f88] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              Change Career Goal
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Card & Education (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Identity Capsule */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1eee7] pb-3">
                <span className="text-xs uppercase tracking-wider font-bold text-[#737874]">Personal Dossier</span>
                <span className="px-2 py-0.5 rounded bg-[#d2e7dc] text-[#0d1f18] text-[11px] font-bold">Verified Active</span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[#737874] block">Full Name</span>
                  <span className="font-semibold text-[#0d1f18]">{state.profile.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-[#737874] block">Email</span>
                  <span className="font-mono text-xs text-[#0d1f18]">{state.profile.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-[#737874] block">Institution</span>
                  <span className="text-[#0d1f18]">{state.profile.college || 'Self-Directed / Non-Traditional'}</span>
                </div>
                <div>
                  <span className="text-xs text-[#737874] block">Degree & Year</span>
                  <span className="text-[#0d1f18]">{state.profile.degree || 'General Studies'} • {state.profile.year}</span>
                </div>
                <div>
                  <span className="text-xs text-[#737874] block">Experience Level</span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#f6f3ed] border border-[#e5e2dc] text-xs font-bold text-[#0d1f18]">
                    {state.profile.experienceLevel}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#737874] block">Weekly Availability</span>
                  <span className="font-semibold text-[#0d1f18]">{state.availability} Hours / Week</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-[#737874] block mb-2">Platform Controls</span>
              
              <button
                onClick={handleRestartAssessment}
                className="w-full py-2.5 px-4 rounded border border-[#e5e2dc] hover:bg-[#f6f3ed] text-xs font-semibold uppercase tracking-wider text-[#0d1f18] transition-colors flex items-center justify-between"
              >
                <span>Restart Competency Assessment</span>
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-4 rounded border border-[#ba1a1a]/30 hover:bg-[#ba1a1a]/5 text-xs font-semibold uppercase tracking-wider text-[#ba1a1a] transition-colors flex items-center justify-between"
              >
                <span>Reset ATLAS Data</span>
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Role, Competencies & Progress (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Target Role & Readiness Banner */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1eee7] pb-4 mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#6b4ea6] font-bold block">
                    Active Target Trajectory
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#0d1f18] mt-0.5">
                    {state.targetRole}
                  </h2>
                  <span className="text-xs text-[#737874]">{roleDefinition.category}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#737874] block uppercase">Calibrated Readiness</span>
                  <span className="text-3xl font-bold font-serif text-[#0d1f18]">{careerReadiness}%</span>
                </div>
              </div>

              <p className="text-xs text-[#424845] leading-relaxed mb-4">
                {roleDefinition.shortDescription}
              </p>

              {/* Assessment Status Pill */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] text-xs">
                <div>
                  <span className="font-bold text-[#0d1f18] block">Assessment Status</span>
                  <span className="text-[#737874]">
                    {state.assessmentCompleted
                      ? '15 of 15 diagnostic questions scored'
                      : 'Pending completion — using baseline calibration'}
                  </span>
                </div>
                <Link
                  to="/assessment"
                  className="px-3 py-1.5 rounded bg-[#0d1f18] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#22382f]"
                >
                  {state.assessmentCompleted ? 'Retake' : 'Take Assessment'}
                </Link>
              </div>
            </div>

            {/* Evaluated Competencies */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1eee7] pb-3">
                <span className="text-xs uppercase tracking-wider font-bold text-[#737874]">
                  Active Role Competencies ({roleDefinition.skills.length})
                </span>
                <span className="text-xs text-[#737874]">Threshold: {roleDefinition.roleThreshold}%</span>
              </div>

              <div className="space-y-3">
                {skillGaps.map((item) => (
                  <div key={item.skill} className="p-3 rounded-lg bg-[#fcf9f3] border border-[#e5e2dc] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#0d1f18]">{item.displayName}</span>
                      <span className="font-mono text-[#424845]">
                        Score: <strong className="text-[#0d1f18]">{item.demonstrated}%</strong> / Goal: {item.roleThreshold}%
                        {item.gap > 0 ? (
                          <span className="text-[#ba1a1a] ml-1.5 font-bold">(-{item.gap} deficit)</span>
                        ) : (
                          <span className="text-[#4f6359] ml-1.5 font-bold">(Cleared)</span>
                        )}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#e5e2dc] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.gap >= 25 ? 'bg-[#ba1a1a]' : item.gap >= 12 ? 'bg-[#6b4ea6]' : 'bg-[#4f6359]'
                        }`}
                        style={{ width: `${Math.min(item.demonstrated, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap & Evidence Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white border border-[#e5e2dc] shadow-xs">
                <span className="text-xs text-[#737874] uppercase tracking-wider font-bold block mb-1">
                  Roadmap Sprints
                </span>
                <div className="text-2xl font-serif font-bold text-[#0d1f18]">
                  {completedSteps} / {state.roadmapSteps.length}
                </div>
                <p className="text-xs text-[#424845] mt-1 mb-3">Milestones cleared in current sequence.</p>
                <Link to="/career-roadmap" className="text-xs font-semibold text-[#6b4ea6] hover:underline">
                  View Career Roadmap →
                </Link>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#e5e2dc] shadow-xs">
                <span className="text-xs text-[#737874] uppercase tracking-wider font-bold block mb-1">
                  Evidence Locker
                </span>
                <div className="text-2xl font-serif font-bold text-[#0d1f18]">
                  {state.evidence.length} Artifacts
                </div>
                <p className="text-xs text-[#424845] mt-1 mb-3">Verified projects and credentials logged.</p>
                <Link to="/evidence" className="text-xs font-semibold text-[#6b4ea6] hover:underline">
                  Manage Evidence Locker →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1f18]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#e5e2dc] shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-[#f1eee7] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#0d1f18]">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-[#737874] hover:text-[#0d1f18]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0d1f18] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#0d1f18] block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0d1f18] block mb-1">College / Institution</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0d1f18] block mb-1">Degree / Course</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0d1f18] block mb-1">Current Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value as CurrentYear)}
                    className="w-full px-3 py-2 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-xs text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0d1f18] block mb-1">Experience Level</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                    className="w-full px-3 py-2 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-xs text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  >
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#f1eee7]">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded border border-[#e5e2dc] text-xs font-semibold text-[#737874] hover:bg-[#f6f3ed]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#0d1f18] text-white text-xs font-semibold hover:bg-[#22382f]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Career Goal Confirmation Modal */}
      {isChangingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1f18]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#e5e2dc] shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-[#f1eee7] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#0d1f18]">Change Career Goal</h3>
              <button
                onClick={() => setIsChangingRole(false)}
                className="text-[#737874] hover:text-[#0d1f18]"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-[#fff8e6] border border-[#ffe082] text-xs text-[#5d4037] leading-relaxed">
              <strong>Notice:</strong> Changing your target role will recalibrate your competency framework, assessment, and career roadmap around the new role.
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-[#0d1f18] block">Select New Target Role</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
              >
                {ROLES_CATALOGUE.map((r) => (
                  <option key={r.id} value={r.name}>{r.name} ({r.category})</option>
                ))}
                <option value="Other">Other (Custom Target Role)</option>
              </select>

              {selectedNewRole === 'Other' && (
                <div>
                  <label className="font-bold text-[#0d1f18] block mb-1">Enter Custom Role Title</label>
                  <input
                    type="text"
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    placeholder="e.g. Bio-Informatics Engineer"
                    className="w-full px-3 py-2 rounded border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#f1eee7]">
              <button
                type="button"
                onClick={() => setIsChangingRole(false)}
                className="px-4 py-2 rounded border border-[#e5e2dc] text-xs font-semibold text-[#737874] hover:bg-[#f6f3ed]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="px-5 py-2 rounded bg-[#6b4ea6] text-white text-xs font-semibold hover:bg-[#583f88]"
              >
                Change Role & Recalibrate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1f18]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#e5e2dc] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#ba1a1a]">Reset All ATLAS Data?</h3>
            <p className="text-xs text-[#424845] leading-relaxed">
              This will clear your profile, assessment scores, evidence locker, and roadmap progress from this browser. You will be returned to the profile setup screen.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#f1eee7]">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded border border-[#e5e2dc] text-xs font-semibold text-[#737874] hover:bg-[#f6f3ed]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFullReset}
                className="px-5 py-2 rounded bg-[#ba1a1a] text-white text-xs font-semibold hover:bg-[#921414]"
              >
                Confirm Full Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

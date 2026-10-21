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
      <div className="min-h-screen bg-[#080B16] text-[#F1F5F9] flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 pt-28 pb-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-[#A78BFA] mb-4 text-2xl font-bold shadow-sm">
            ?
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">No Profile Found</h1>
          <p className="text-[#94A3B8] max-w-md mb-6 text-sm">
            Complete your ATLAS profile to begin calibrating role readiness, competency gaps, and custom roadmaps.
          </p>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-sm text-xs uppercase tracking-wider"
          >
            Create my profile →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F1F5F9] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Page Breadcrumb / Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#64748B] block mb-1">
              User Dossier • ATLAS ID #{state.profile.id ? state.profile.id.slice(0, 8) : 'ACTIVE'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {state.profile.fullName}
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">
              {state.profile.experienceLevel} • {state.profile.degree || 'Degree Underway'} at {state.profile.college || 'Institution'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-4 py-2 rounded-xl border border-white/10 bg-[#0D1224] hover:bg-[#172039] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsChangingRole(true)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
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
            <div className="p-6 rounded-2xl glass-panel border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-[#64748B]">Personal Dossier</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30 text-[11px] font-mono font-bold">Verified Active</span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[11px] font-mono text-[#64748B] block">Full Name</span>
                  <span className="font-semibold text-white">{state.profile.fullName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#64748B] block">Email</span>
                  <span className="font-mono text-xs text-white">{state.profile.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#64748B] block">Institution</span>
                  <span className="text-[#94A3B8]">{state.profile.college || 'Self-Directed / Non-Traditional'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#64748B] block">Degree &amp; Year</span>
                  <span className="text-[#94A3B8]">{state.profile.degree || 'General Studies'} • {state.profile.year}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#64748B] block">Experience Level</span>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-lg bg-[#0D1224] border border-white/10 text-xs font-mono font-bold text-white">
                    {state.profile.experienceLevel}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-[#64748B] block">Weekly Availability</span>
                  <span className="font-semibold font-mono text-white">{state.availability} Hours / Week</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl glass-panel border-white/10 shadow-xl space-y-3">
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-[#64748B] block mb-2">Platform Controls</span>
              
              <button
                onClick={handleRestartAssessment}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-[#0D1224] hover:bg-[#172039] text-xs font-semibold uppercase tracking-wider text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Restart Competency Assessment</span>
                <span className="material-symbols-outlined text-[16px] text-[#A78BFA]">restart_alt</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold uppercase tracking-wider text-rose-300 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Reset ATLAS Data</span>
                <span className="material-symbols-outlined text-[16px] text-rose-400">delete_forever</span>
              </button>
            </div>
          </div>

          {/* Right Column: Active Role, Competencies & Progress (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Target Role & Readiness Banner */}
            <div className="p-6 rounded-2xl glass-panel border-white/10 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[11px] uppercase font-mono tracking-wider text-[#A78BFA] font-bold block">
                    Active Target Trajectory
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-0.5 tracking-tight">
                    {state.targetRole}
                  </h2>
                  <span className="text-xs text-[#64748B] font-mono">{roleDefinition.category}</span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-[#64748B] block uppercase">Calibrated Readiness</span>
                  <span className="text-3xl font-bold text-[#2DD4BF]">{careerReadiness}%</span>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                {roleDefinition.shortDescription}
              </p>

              {/* Assessment Status Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1224] border border-white/10 text-xs">
                <div>
                  <span className="font-bold text-white block">Assessment Status</span>
                  <span className="text-[#64748B] font-mono text-[11px]">
                    {state.assessmentCompleted
                      ? '10 of 10 diagnostic questions scored'
                      : 'Pending completion — using baseline calibration'}
                  </span>
                </div>
                <Link
                  to="/assessment"
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold uppercase tracking-wider transition-all shadow-sm"
                >
                  {state.assessmentCompleted ? 'Retake' : 'Take Assessment'}
                </Link>
              </div>
            </div>

            {/* Evaluated Competencies */}
            <div className="p-6 rounded-2xl glass-panel border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-[#64748B]">
                  Active Role Competencies ({roleDefinition.skills.length})
                </span>
                <span className="text-xs font-mono text-[#64748B]">Threshold: {roleDefinition.roleThreshold}%</span>
              </div>

              <div className="space-y-3">
                {skillGaps.map((item) => (
                  <div key={item.skill} className="p-3.5 rounded-xl bg-[#0D1224] border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{item.displayName}</span>
                      <span className="font-mono text-[#94A3B8]">
                        Score: <strong className="text-white">{item.demonstrated}%</strong> / Goal: {item.roleThreshold}%
                        {item.gap > 0 ? (
                          <span className="text-rose-400 ml-1.5 font-bold">(-{item.gap} deficit)</span>
                        ) : (
                          <span className="text-[#2DD4BF] ml-1.5 font-bold">(Cleared)</span>
                        )}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#172039] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.gap >= 25 ? 'bg-rose-500' : item.gap >= 12 ? 'bg-violet-500' : 'bg-teal-500'
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
              <div className="p-5 rounded-2xl glass-panel border-white/10 shadow-lg">
                <span className="text-[10px] text-[#64748B] uppercase font-mono tracking-wider font-bold block mb-1">
                  Roadmap Sprints
                </span>
                <div className="text-2xl font-mono font-bold text-white">
                  {completedSteps} / {state.roadmapSteps.length}
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 mb-3">Milestones cleared in current sequence.</p>
                <Link to="/career-roadmap" className="text-xs font-mono font-semibold text-[#A78BFA] hover:text-white transition-colors">
                  View Career Roadmap →
                </Link>
              </div>

              <div className="p-5 rounded-2xl glass-panel border-white/10 shadow-lg">
                <span className="text-[10px] text-[#64748B] uppercase font-mono tracking-wider font-bold block mb-1">
                  Evidence Locker
                </span>
                <div className="text-2xl font-mono font-bold text-white">
                  {state.evidence.length} Artifacts
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 mb-3">Verified projects and credentials logged.</p>
                <Link to="/evidence" className="text-xs font-mono font-semibold text-[#A78BFA] hover:text-white transition-colors">
                  Manage Evidence Locker →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel-elevated bg-[#11182B] rounded-2xl border border-white/15 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-[#64748B] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block mb-1">College / Institution</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block mb-1">Degree / Course</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block mb-1">Current Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value as CurrentYear)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0D1224] text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block mb-1">Experience Level</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0D1224] text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    {EXPERIENCE_OPTIONS.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel-elevated bg-[#11182B] rounded-2xl border border-white/15 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Change Career Goal</h3>
              <button
                onClick={() => setIsChangingRole(false)}
                className="text-[#64748B] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-[#A78BFA] leading-relaxed">
              <strong>Notice:</strong> Changing your target role will recalibrate your competency framework, assessment, and career roadmap around the new role.
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block">Select New Target Role</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white focus:outline-none focus:border-violet-500"
              >
                {ROLES_CATALOGUE.map((r) => (
                  <option key={r.id} value={r.name}>{r.name} ({r.category})</option>
                ))}
                <option value="Other">Other (Custom Target Role)</option>
              </select>

              {selectedNewRole === 'Other' && (
                <div>
                  <label className="font-mono font-bold text-[#64748B] uppercase text-[10px] block mb-1">Enter Custom Role Title</label>
                  <input
                    type="text"
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    placeholder="e.g. Bio-Informatics Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0D1224] text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsChangingRole(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                Change Role &amp; Recalibrate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel-elevated bg-[#11182B] rounded-2xl border border-rose-500/30 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-rose-400">Reset All ATLAS Data?</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              This will clear your profile, assessment scores, evidence locker, and roadmap progress from this browser. You will be returned to the profile setup screen.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFullReset}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 cursor-pointer"
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

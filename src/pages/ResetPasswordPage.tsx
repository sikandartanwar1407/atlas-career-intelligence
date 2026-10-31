import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { PageTransition } from '../components/motion/Motion';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery Session & UI Status
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Request new reset link state (for fallback)
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Store recovery token in memory only
  const recoveryTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const session = SupabaseAuthService.extractRecoverySession();

    if (session && session.accessToken) {
      recoveryTokenRef.current = session.accessToken;
      setHasSession(true);
      // Clean token fragment from URL bar safely
      SupabaseAuthService.clearUrlAuthFragment();
    } else if (session && session.error) {
      setSessionError(session.error);
      setHasSession(false);
    } else {
      setHasSession(false);
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newPassword) {
      setFormError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter your password.');
      return;
    }

    const token = recoveryTokenRef.current;
    if (!token) {
      setFormError('Recovery session expired or missing. Please request a new reset link.');
      return;
    }

    setSubmitting(true);
    const result = await SupabaseAuthService.updateUserPassword(newPassword, token);
    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      recoveryTokenRef.current = null;
    } else {
      setFormError(result.error || 'Failed to update password. Please try again.');
    }
  };

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    if (!requestEmail || !requestEmail.includes('@')) {
      setRequestError('Please enter a valid email address.');
      return;
    }

    setRequestLoading(true);
    const result = await SupabaseAuthService.requestPasswordReset(requestEmail);
    setRequestLoading(false);

    if (result.success) {
      setRequestSuccess(true);
      setRequestEmail('');
    } else {
      setRequestError(result.error || 'Unable to send recovery email.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563] relative overflow-hidden">
      {/* Clean Brand Header */}
      <header className="h-16 border-b border-[#E5E7EB] bg-[#F3F4F6]/90 backdrop-blur-xl px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#18283D]/30 shadow-sm flex items-center justify-center transition-colors group-hover:border-[#18283D]/50">
            <div className="w-3.5 h-3.5 rounded-full border border-[#18283D]/80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B6F5A]"></div>
            </div>
          </div>
          <span className="font-sans text-lg text-[#18283D] font-extrabold tracking-tight">
            ATLAS
          </span>
        </Link>
        <Link
          to="/login"
          className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] hover:text-[#18283D] transition-colors"
        >
          Sign In →
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 sm:py-16 flex flex-col justify-center">
        <PageTransition className="space-y-6">
          {/* Header Description */}
          <div className="text-center space-y-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#8B6F5A] inline-block px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5]">
              Security · Account Recovery
            </span>
            <h1 className="text-3xl font-extrabold text-[#18283D] tracking-tight">
              Reset your password
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Create a new secure password for your ATLAS workspace account.
            </p>
          </div>

          {/* Success Card */}
          {success ? (
            <div className="glass-panel-elevated rounded-2xl p-7 shadow-xl border border-[#E5E7EB] text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-sm">
                ✓
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#18283D]">
                  Password updated successfully!
                </h2>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Your password has been changed. You can now sign in to your ATLAS workspace with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all shadow-sm btn-interactive"
                >
                  <span>Continue to Sign in</span>
                  <span className="text-sm">→</span>
                </Link>
              </div>
            </div>
          ) : hasSession ? (
            /* Active Recovery Password Form */
            <form
              onSubmit={handleUpdatePassword}
              className="glass-panel-elevated rounded-2xl p-7 sm:p-8 shadow-xl border border-[#E5E7EB] space-y-5"
            >
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed">
                  {formError}
                </div>
              )}

              {/* New Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-[#6B7280] hover:text-[#18283D]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Match Verification Indicator */}
              {confirmPassword.length > 0 && (
                <div className="text-[11px] font-mono flex items-center gap-1.5">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-400">✓ Passwords match</span>
                  ) : (
                    <span className="text-rose-400">✕ Passwords do not match</span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent disabled:opacity-50 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer btn-interactive"
              >
                {submitting ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Update Password</span>
                    <span className="text-sm">→</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="text-xs text-[#6B7280] hover:text-[#18283D] transition-colors"
                >
                  Return to Sign in
                </Link>
              </div>
            </form>
          ) : (
            /* Missing / Expired Session Fallback */
            <div className="glass-panel-elevated rounded-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#E5E7EB] space-y-5">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold shadow-sm">
                  !
                </div>
                <h2 className="text-lg font-bold text-[#18283D]">
                  {sessionError ? 'Recovery Link Expired' : 'No Recovery Session Detected'}
                </h2>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {sessionError ||
                    'To reset your password, please open the link sent to your email or request a new recovery link below.'}
                </p>
              </div>

              {requestSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <span className="text-xs font-bold text-emerald-300 block">
                    Recovery link sent!
                  </span>
                  <p className="text-xs text-[#4B5563]">
                    Please check your inbox for instructions to reset your password.
                  </p>
                </div>
              ) : showRequestForm ? (
                <form onSubmit={handleRequestNewLink} className="space-y-4 pt-2">
                  {requestError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      {requestError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label
                      htmlFor="recovery-email"
                      className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                    >
                      Your Account Email
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="e.g. your_email@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {requestLoading ? 'Sending...' : 'Send Recovery Email →'}
                  </button>
                </form>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] border border-[#E5E7EB] text-[#18283D] text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    Request New Recovery Link
                  </button>
                </div>
              )}

              <div className="pt-2 text-center border-t border-[#E5E7EB]">
                <Link
                  to="/"
                  className="text-xs text-[#6B7280] hover:text-[#18283D] transition-colors"
                >
                  ← Return to ATLAS Homepage
                </Link>
              </div>
            </div>
          )}
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
};

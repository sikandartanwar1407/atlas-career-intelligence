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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      {/* Clean Brand Header */}
      <header className="h-16 border-b border-[#e5e2dc] bg-[#fcf9f3]/95 px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#0d1f18] flex items-center justify-center relative bg-white shadow-xs">
            <div className="w-4 h-4 rounded-full border border-dashed border-[#6b4ea6] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d1f18]"></div>
            </div>
          </div>
          <span className="font-headline-sm text-headline-sm text-[#0d1f18] tracking-tight font-medium">
            ATLAS
          </span>
        </Link>
        <Link
          to="/role-select"
          className="text-xs font-semibold uppercase tracking-wider text-[#424845] hover:text-[#0d1f18]"
        >
          Sign In →
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 sm:py-16 flex flex-col justify-center">
        <PageTransition className="space-y-6">
          {/* Header Description */}
          <div className="text-center space-y-2">
            <span className="font-label-sm text-[11px] font-semibold uppercase tracking-widest text-[#6b4ea6] inline-block">
              Security · Account Recovery
            </span>
            <h1 className="font-headline-xl text-3xl font-bold text-[#0d1f18] tracking-tight">
              Reset your password
            </h1>
            <p className="text-xs sm:text-sm text-[#424845]">
              Create a new secure password for your ATLAS workspace account.
            </p>
          </div>

          {/* Success Card */}
          {success ? (
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-7 shadow-sm text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-[#2e7d32]/10 border border-[#2e7d32]/20 text-[#2e7d32] flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-[#0d1f18]">
                  Password updated successfully!
                </h2>
                <p className="text-xs text-[#5a625d] leading-relaxed">
                  Your password has been changed. You can now sign in to your ATLAS workspace with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/role-select"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
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
              className="bg-white border border-[#e5e2dc] rounded-2xl p-7 sm:p-8 shadow-sm space-y-5"
            >
              {formError && (
                <div className="p-3 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* New Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-[#737874] hover:text-[#0d1f18]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Match Verification Indicator */}
              {confirmPassword.length > 0 && (
                <div className="text-[11px] font-medium flex items-center gap-1.5">
                  {newPassword === confirmPassword ? (
                    <span className="text-[#2e7d32]">✓ Passwords match</span>
                  ) : (
                    <span className="text-[#ba1a1a]">✕ Passwords do not match</span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] disabled:bg-[#737874] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
                  to="/role-select"
                  className="text-xs text-[#737874] hover:text-[#0d1f18] underline font-medium"
                >
                  Return to Sign in
                </Link>
              </div>
            </form>
          ) : (
            /* Missing / Expired Session Fallback */
            <div className="bg-white border border-[#e5e2dc] rounded-2xl p-7 shadow-sm space-y-5">
              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-[#f6f2e9] text-[#6b4ea6] flex items-center justify-center mx-auto text-lg font-bold">
                  !
                </div>
                <h2 className="font-serif text-lg font-bold text-[#0d1f18]">
                  {sessionError ? 'Recovery Link Expired' : 'No Recovery Session Detected'}
                </h2>
                <p className="text-xs text-[#5a625d] leading-relaxed">
                  {sessionError ||
                    'To reset your password, please open the link sent to your email or request a new recovery link below.'}
                </p>
              </div>

              {requestSuccess ? (
                <div className="p-4 rounded-xl bg-[#2e7d32]/10 border border-[#2e7d32]/20 text-center space-y-2">
                  <span className="text-xs font-bold text-[#2e7d32] block">
                    Recovery link sent!
                  </span>
                  <p className="text-xs text-[#1e4620]">
                    Please check your inbox for instructions to reset your password.
                  </p>
                </div>
              ) : showRequestForm ? (
                <form onSubmit={handleRequestNewLink} className="space-y-4 pt-2">
                  {requestError && (
                    <div className="p-2.5 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold">
                      {requestError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label
                      htmlFor="recovery-email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
                    >
                      Your Account Email
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="e.g. your_email@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {requestLoading ? 'Sending...' : 'Send Recovery Email →'}
                  </button>
                </form>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    Request New Recovery Link
                  </button>
                </div>
              )}

              <div className="pt-2 text-center border-t border-[#f1eee7]">
                <Link
                  to="/"
                  className="text-xs text-[#737874] hover:text-[#0d1f18] font-medium"
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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { PageTransition } from '../components/motion/Motion';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await SupabaseAuthService.requestPasswordReset(cleanEmail);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Unable to send recovery email. Please check the email and try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      {/* Clean Brand Header */}
      <header className="h-16 border-b border-[#e5e2dc] bg-[#fcf9f3]/95 px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full border border-[#0d1f18] flex items-center justify-center relative bg-white shadow-xs group-hover:border-[#6b4ea6] transition-colors">
            <div className="w-4 h-4 rounded-full border border-dashed border-[#6b4ea6] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d1f18]"></div>
            </div>
          </div>
          <span className="font-headline-sm text-headline-sm text-[#0d1f18] tracking-tight font-medium">
            ATLAS
          </span>
        </Link>
        <Link
          to="/login"
          className="text-xs font-semibold uppercase tracking-wider text-[#424845] hover:text-[#0d1f18] transition-colors"
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
              Forgot password?
            </h1>
            <p className="text-xs sm:text-sm text-[#424845]">
              Enter your registered account email and we'll send a secure link to reset your password.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-7 sm:p-8 shadow-sm space-y-5">
            {success ? (
              /* Success State */
              <div className="space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-[#2e7d32]/10 border border-[#2e7d32]/20 text-[#2e7d32] flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-serif text-xl font-bold text-[#0d1f18]">
                    Recovery email sent!
                  </h2>
                  <p className="text-xs text-[#5a625d] leading-relaxed">
                    If an account exists for <span className="font-semibold text-[#0d1f18]">{email}</span>, you will receive an email shortly containing a link to reset your password.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <span>Return to Sign in</span>
                    <span className="text-sm">→</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="w-full py-2 text-xs text-[#737874] hover:text-[#0d1f18] font-medium"
                  >
                    Send to a different email address
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold leading-relaxed">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
                  >
                    Account Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@university.edu or your@company.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6] transition-colors"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] disabled:bg-[#737874] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {loading ? (
                    <span>Sending reset link...</span>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <span className="text-sm">→</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center border-t border-[#f1eee7]">
                  <Link
                    to="/login"
                    className="text-xs text-[#737874] hover:text-[#0d1f18] font-medium inline-flex items-center gap-1"
                  >
                    <span>←</span>
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>

          <div className="text-center text-xs text-[#737874]">
            <span>Need assistance? </span>
            <Link to="/" className="text-[#0d1f18] underline font-medium">
              Return to ATLAS home
            </Link>
          </div>
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
};

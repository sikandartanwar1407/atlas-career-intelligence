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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563] relative overflow-hidden">
      {/* Clean Brand Header */}
      <header className="h-16 border-b border-[#E5E7EB] bg-[#F3F4F6]/90 backdrop-blur-xl px-6 lg:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
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
              Forgot password?
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Enter your registered account email and we'll send a secure link to reset your password.
            </p>
          </div>

          {/* Card */}
          <div className="glass-panel-elevated rounded-2xl p-7 sm:p-8 shadow-xl border border-[#E5E7EB] space-y-5">
            {success ? (
              /* Success State */
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-sm">
                  ✓
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-[#18283D]">
                    Recovery email sent!
                  </h2>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    If an account exists for <span className="font-mono font-semibold text-[#18283D]">{email}</span>, you will receive an email shortly containing a link to reset your password.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all shadow-sm btn-interactive"
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
                    className="w-full py-2.5 text-xs text-[#6B7280] hover:text-[#18283D] transition-colors"
                  >
                    Send to a different email
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                  >
                    Registered Account Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent disabled:opacity-50 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer btn-interactive"
                >
                  {loading ? (
                    <span>Sending recovery link...</span>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <span className="text-sm">→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-[#E5E7EB] text-center">
              <Link
                to="/login"
                className="text-xs text-[#6B7280] hover:text-[#18283D] transition-colors"
              >
                ← Back to Sign in
              </Link>
            </div>
          </div>
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
};

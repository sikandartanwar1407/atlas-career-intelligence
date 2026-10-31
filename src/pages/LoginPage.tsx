import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { ProfileService } from '../services/profileService';
import { useAtlas } from '../context/AtlasContext';
import { useAccount } from '../context/AccountContext';
import { PageTransition } from '../components/motion/Motion';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasProfile, state, createProfile, loadDemoProfile, updateProfile } = useAtlas();
  const { accountType } = useAccount();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }

      setLoading(true);
      const result = await SupabaseAuthService.signUp(cleanEmail, password, {
        full_name: fullName.trim() || undefined,
      });
      setLoading(false);

      if (result.success) {
        if (result.session) {
          if (fullName.trim()) {
            updateProfile({ fullName: fullName.trim(), email: cleanEmail });
          } else {
            updateProfile({ email: cleanEmail });
          }
          setSuccessMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            if (hasProfile) {
              navigate('/diagnosis');
            } else {
              navigate('/onboarding');
            }
          }, 800);
        } else {
          setSuccessMessage(result.message || 'Registration successful! Please check your email to verify your account.');
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
      return;
    }

    // Sign In Mode
    setLoading(true);
    const result = await SupabaseAuthService.signInWithPassword(cleanEmail, password);

    if (result.success) {
      if (result.session?.accessToken) {
        const remoteProfileRes = await ProfileService.fetchRemoteProfile(result.session.accessToken);
        if (remoteProfileRes.success && remoteProfileRes.profile && remoteProfileRes.profile.hasCompletedSetup) {
          setLoading(false);
          createProfile(remoteProfileRes.profile);
          navigate('/diagnosis');
          return;
        }
      }
      setLoading(false);

      if (!state.profile.email) {
        updateProfile({ email: cleanEmail });
      }

      const redirectState = (location.state as { from?: string })?.from;
      if (redirectState) {
        navigate(redirectState);
      } else if (accountType === 'employer') {
        navigate('/employer');
      } else if (hasProfile) {
        navigate('/diagnosis');
      } else {
        navigate('/onboarding');
      }
    } else {
      setLoading(false);
      setError(result.error || 'Invalid login credentials. Please try again.');
    }
  };

  const handleDemoAccess = () => {
    loadDemoProfile();
    navigate('/diagnosis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#4B5563] relative overflow-hidden">
      {/* Brand Header */}
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
          to="/"
          className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] hover:text-[#18283D] transition-colors"
        >
          ← Home
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 sm:py-14 flex flex-col justify-center">
        <PageTransition className="space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#8B6F5A] inline-block px-3 py-1 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5]">
              {mode === 'signin' ? 'Account Access' : 'New Registration'} · ATLAS Workspace
            </span>
            <h1 className="text-3xl font-extrabold text-[#18283D] tracking-tight">
              {mode === 'signin' ? 'Sign in to ATLAS' : 'Create your account'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              {mode === 'signin'
                ? 'Resume your calibrated skills roadmap and verified evidence.'
                : 'Join the empirical talent intelligence platform.'}
            </p>
          </div>

          {/* Card */}
          <div className="glass-panel-elevated rounded-2xl p-7 sm:p-8 shadow-xl border border-[#E5E7EB] space-y-5">
            {/* Tab Switcher: Sign In vs Sign Up */}
            <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-xl border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-[#18283D] text-[#FAF7F2] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#18283D]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-[#18283D] text-[#FAF7F2] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#18283D]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5">
                  <span>✓</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {/* Main Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Sign Up */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                    autoComplete="name"
                    required={mode === 'signup'}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu or you@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <Link
                      to="/forgot-password"
                      className="text-xs text-[#8B6F5A] hover:text-[#8B6F5A] font-medium"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

              {/* Confirm Password for Sign Up */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#4B5563]"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] text-sm text-[#18283D] placeholder-[#6B7280] focus:outline-none focus:border-[#18283D] focus:ring-1 focus:ring-[#18283D]/30 transition-all"
                    autoComplete="new-password"
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <div className="text-[11px] font-mono pt-1">
                      {password === confirmPassword ? (
                        <span className="text-emerald-400">✓ Passwords match</span>
                      ) : (
                        <span className="text-rose-400">✕ Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent disabled:opacity-50 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer btn-interactive"
              >
                {loading ? (
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <span className="text-sm">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Alternative Demo / Guest Access */}
            <div className="pt-3 border-t border-[#E5E7EB] space-y-3">
              <div className="text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">
                  Or explore instantly without credentials
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="py-2.5 px-3 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#18283D] text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  ⚡ Demo Profile
                </button>
                <Link
                  to="/onboarding"
                  className="py-2.5 px-3 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#8B6F5A] text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  New Onboarding →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick toggle at bottom */}
          <div className="text-center text-xs text-[#6B7280]">
            {mode === 'signin' ? (
              <span>
                Don't have an ATLAS account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#8B6F5A] font-semibold hover:underline"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#8B6F5A] font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
};

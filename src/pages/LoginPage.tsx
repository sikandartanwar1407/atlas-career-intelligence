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
  const { accountType, switchAccount } = useAccount();

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
          // If session is immediately returned
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
          // Confirmation required
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
      // Check if remote profile exists in Supabase
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

      // Check destination from state or redirect to appropriate workspace
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
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      {/* Brand Header */}
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
          to="/"
          className="text-xs font-semibold uppercase tracking-wider text-[#424845] hover:text-[#0d1f18] transition-colors"
        >
          ← Home
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 sm:py-14 flex flex-col justify-center">
        <PageTransition className="space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <span className="font-label-sm text-[11px] font-semibold uppercase tracking-widest text-[#6b4ea6] inline-block">
              {mode === 'signin' ? 'Account Access' : 'New Registration'} · ATLAS Workspace
            </span>
            <h1 className="font-headline-xl text-3xl font-bold text-[#0d1f18] tracking-tight">
              {mode === 'signin' ? 'Sign in to ATLAS' : 'Create your account'}
            </h1>
            <p className="text-xs sm:text-sm text-[#424845]">
              {mode === 'signin'
                ? 'Resume your calibrated skills roadmap and verified evidence.'
                : 'Join the empirical talent intelligence platform.'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#e5e2dc] rounded-2xl p-7 sm:p-8 shadow-sm space-y-5">
            {/* Tab Switcher: Sign In vs Sign Up */}
            <div className="grid grid-cols-2 p-1 bg-[#f6f2e9] rounded-xl border border-[#ebe6dc]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#0d1f18] shadow-xs'
                    : 'text-[#737874] hover:text-[#0d1f18]'
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
                    ? 'bg-white text-[#0d1f18] shadow-xs'
                    : 'text-[#737874] hover:text-[#0d1f18]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="p-3.5 rounded-lg bg-[#2e7d32]/10 border border-[#2e7d32]/20 text-[#2e7d32] text-xs font-semibold leading-relaxed space-y-1">
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
                    className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6] transition-colors"
                    autoComplete="name"
                    required={mode === 'signup'}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu or you@company.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6] transition-colors"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <Link
                      to="/forgot-password"
                      className="text-xs text-[#6b4ea6] hover:text-[#503780] font-semibold"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6] transition-colors"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

              {/* Confirm Password for Sign Up */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0d1f18]"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] text-sm text-[#0d1f18] focus:outline-none focus:border-[#6b4ea6] transition-colors"
                    autoComplete="new-password"
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <div className="text-[11px] font-medium pt-1">
                      {password === confirmPassword ? (
                        <span className="text-[#2e7d32]">✓ Passwords match</span>
                      ) : (
                        <span className="text-[#ba1a1a]">✕ Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#0d1f18] hover:bg-[#22382f] disabled:bg-[#737874] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
            <div className="pt-3 border-t border-[#f1eee7] space-y-3">
              <div className="text-center">
                <span className="text-[11px] uppercase tracking-wider text-[#737874] font-semibold">
                  Or explore instantly without credentials
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDemoAccess}
                  className="py-2.5 px-3 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] hover:bg-[#f6f3ed] text-[#0d1f18] text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  ⚡ Demo Profile
                </button>
                <Link
                  to="/onboarding"
                  className="py-2.5 px-3 rounded-lg border border-[#e5e2dc] bg-[#fcf9f3] hover:bg-[#f6f3ed] text-[#0d1f18] text-xs font-semibold uppercase tracking-wider transition-colors text-center"
                >
                  New Onboarding →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick toggle at bottom */}
          <div className="text-center text-xs text-[#737874]">
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
                  className="text-[#6b4ea6] font-semibold hover:underline"
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
                  className="text-[#6b4ea6] font-semibold hover:underline"
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

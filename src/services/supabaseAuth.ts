/**
 * Supabase Browser Auth Service
 * Lightweight, zero-dependency browser-safe Supabase Auth utility.
 * Handles password recovery, session extraction, and password updates.
 */

const DEFAULT_SUPABASE_URL = 'https://ytplopuvuibvjkwjayks.supabase.co';

export function getSupabaseUrl(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    ''
  );
}

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
}

export interface SupabaseAuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  user?: SupabaseUser;
}

export interface AuthResult {
  success: boolean;
  session?: SupabaseAuthSession;
  user?: SupabaseUser;
  error?: string;
  message?: string;
}

export interface AuthRecoverySession {
  accessToken: string;
  refreshToken?: string;
  type?: string;
  expiresIn?: number;
  error?: string;
}

export class SupabaseAuthService {
  private static _currentSession: SupabaseAuthSession | null = null;

  static setSession(session: SupabaseAuthSession | null): void {
    this._currentSession = session;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (session) {
          window.sessionStorage.setItem('atlas_supabase_session', JSON.stringify(session));
        } else {
          window.sessionStorage.removeItem('atlas_supabase_session');
        }
      } catch {
        // silent fallback
      }
    }
  }

  static getSession(): SupabaseAuthSession | null {
    if (this._currentSession) return this._currentSession;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = window.sessionStorage.getItem('atlas_supabase_session');
        if (stored) {
          this._currentSession = JSON.parse(stored);
          return this._currentSession;
        }
      } catch {
        // silent fallback
      }
    }
    return null;
  }

  static getAccessToken(): string | null {
    const session = this.getSession();
    return session?.accessToken || null;
  }

  static signOut(): void {
    this.setSession(null);
  }

  /**
   * Authenticates a user with email and password via Supabase Auth GoTrue endpoint.
   */
  static async signInWithPassword(
    email: string,
    password: string
  ): Promise<AuthResult> {
    const supabaseUrl = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    if (!anonKey) {
      return {
        success: false,
        error: 'Supabase public anon key (VITE_SUPABASE_ANON_KEY) is missing. Please check your environment configuration.',
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      };

      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.error_description ||
          data.msg ||
          data.message ||
          data.error ||
          'Invalid login credentials. Please check your email and password.';
        return { success: false, error: errorMsg };
      }

      const session: SupabaseAuthSession = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        user: data.user,
      };

      this.setSession(session);

      return {
        success: true,
        session,
        user: data.user,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unable to connect to authentication server.',
      };
    }
  }

  /**
   * Registers a new user with email and password via Supabase Auth GoTrue endpoint.
   */
  static async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<AuthResult> {
    const supabaseUrl = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (!anonKey) {
      return {
        success: false,
        error: 'Supabase public anon key (VITE_SUPABASE_ANON_KEY) is missing. Please check your environment configuration.',
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      };

      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email.trim(),
          password,
          data: metadata || {},
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.error_description ||
          data.msg ||
          data.message ||
          data.error ||
          'Unable to complete registration.';
        return { success: false, error: errorMsg };
      }

      const session = data.access_token
        ? {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            user: data.user,
          }
        : undefined;

      if (session) {
        this.setSession(session);
      }

      return {
        success: true,
        session,
        user: data.user || data,
        message: session
          ? 'Account created successfully!'
          : 'Registration submitted! Please check your email to confirm your account.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unable to connect to authentication server.',
      };
    }
  }

  /**
   * Extracts recovery tokens from the URL hash or query params without storing passwords or tokens.
   */
  static extractRecoverySession(): AuthRecoverySession | null {
    if (typeof window === 'undefined') return null;

    // 1. Check URL hash fragment (Standard Supabase recovery redirect: #access_token=...&type=recovery)
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;

    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || undefined;
      const type = hashParams.get('type') || undefined;
      const error = hashParams.get('error_description') || hashParams.get('error') || undefined;
      const expiresIn = hashParams.get('expires_in')
        ? parseInt(hashParams.get('expires_in')!, 10)
        : undefined;

      if (accessToken) {
        return {
          accessToken,
          refreshToken,
          type,
          expiresIn,
          error,
        };
      }

      if (error) {
        return {
          accessToken: '',
          error,
        };
      }
    }

    // 2. Check query params (e.g. ?error=... or direct code exchange)
    const searchParams = new URLSearchParams(window.location.search);
    const searchError =
      searchParams.get('error_description') || searchParams.get('error') || undefined;
    const accessTokenParam = searchParams.get('access_token');

    if (accessTokenParam) {
      return {
        accessToken: accessTokenParam,
        type: searchParams.get('type') || 'recovery',
        error: searchError,
      };
    }

    if (searchError) {
      return {
        accessToken: '',
        error: searchError,
      };
    }

    return null;
  }

  /**
   * Cleans sensitive tokens from the browser URL without reloading the page.
   */
  static clearUrlAuthFragment(): void {
    if (typeof window === 'undefined') return;
    try {
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, document.title, cleanUrl);
    } catch {
      // silent fallback
    }
  }

  /**
   * Updates user password using Supabase Auth GoTrue endpoint.
   */
  static async updateUserPassword(
    newPassword: string,
    accessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabaseUrl = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();

    if (!newPassword || newPassword.trim().length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters in length.',
      };
    }

    if (!accessToken) {
      return {
        success: false,
        error: 'Missing recovery session token. Please request a new password reset link.',
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      if (anonKey) {
        headers['apikey'] = anonKey;
      }

      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.msg ||
          data.message ||
          data.error_description ||
          data.error ||
          'Failed to update password. Your recovery link may have expired.';
        return { success: false, error: errorMsg };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unable to connect to the authentication server.',
      };
    }
  }

  /**
   * Requests a password recovery email from Supabase Auth.
   */
  static async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabaseUrl = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'http://localhost:3000/reset-password';

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!anonKey) {
      return {
        success: false,
        error:
          'Supabase public anon key (VITE_SUPABASE_ANON_KEY) is missing. Please verify your environment settings.',
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      };

      const url = `${supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email.trim(),
          gotrue_meta_security: {},
          redirect_to: redirectTo,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.msg ||
          data.message ||
          data.error_description ||
          data.error ||
          'Unable to send recovery email.';
        return { success: false, error: errorMsg };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error requesting password reset.',
      };
    }
  }
}

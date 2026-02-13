/**
 * Supabase Auth — Drop-in replacement for Clerk auth components
 *
 * Provides the same API surface as @clerk/clerk-react so consuming apps
 * (myrestoevent, myrestogarage, myrestoclub) don't need changes.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createClient,
  type Session,
  type User,
  type SupabaseClient,
} from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase client singleton
// ---------------------------------------------------------------------------

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables',
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth / useUser must be used inside <AuthProvider>');
  return ctx;
}

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsLoaded(true);
    });

    // Listen for changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    isLoaded,
    isSignedIn: !!session,
    getToken,
    signOut,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// useAuth — matches Clerk's useAuth() return shape
// ---------------------------------------------------------------------------

export function useAuth() {
  const ctx = useAuthContext();
  return {
    isLoaded: ctx.isLoaded,
    isSignedIn: ctx.isSignedIn,
    getToken: ctx.getToken,
    userId: ctx.user?.id ?? null,
    signOut: ctx.signOut,
  };
}

// ---------------------------------------------------------------------------
// useUser — matches Clerk's useUser() return shape
// ---------------------------------------------------------------------------

export function useUser() {
  const ctx = useAuthContext();
  const u = ctx.user;

  if (!u) {
    return { user: null, isSignedIn: false as const, isLoaded: ctx.isLoaded };
  }

  const meta = u.user_metadata ?? {};
  return {
    user: {
      id: u.id,
      primaryEmailAddress: { emailAddress: u.email! },
      emailAddresses: [{ emailAddress: u.email! }],
      firstName: (meta.first_name as string) ?? null,
      lastName: (meta.last_name as string) ?? null,
      fullName: (meta.full_name as string) ?? null,
      imageUrl:
        (meta.avatar_url as string) ??
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
      username: (meta.username as string) ?? null,
      publicMetadata: u.app_metadata ?? {},
    },
    isSignedIn: true as const,
    isLoaded: true,
  };
}

// ---------------------------------------------------------------------------
// useSupabase — escape hatch for direct client access
// ---------------------------------------------------------------------------

export function useSupabase() {
  return useAuthContext().supabase;
}

// ---------------------------------------------------------------------------
// Conditional render wrappers
// ---------------------------------------------------------------------------

export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  return isLoaded && isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  return isLoaded && !isSignedIn ? <>{children}</> : null;
}

// ---------------------------------------------------------------------------
// UserButton — avatar dropdown with sign-out
// ---------------------------------------------------------------------------

export function UserButton({
  afterSignOutUrl = '/',
}: {
  afterSignOutUrl?: string;
  appearance?: unknown;
  showName?: boolean;
}) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full overflow-hidden w-8 h-8 ring-2 ring-transparent hover:ring-[var(--color-accent,#6366f1)] transition-all"
      >
        <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)] shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border,#333)]">
            {user.fullName && (
              <p className="text-sm font-medium text-[var(--color-text-primary,#fff)] mb-1">
                {user.fullName}
              </p>
            )}
            <p className="text-xs text-[var(--color-text-muted,#888)] truncate">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = afterSignOutUrl;
            }}
            className="w-full text-left px-4 py-3 text-sm text-[var(--color-text-primary,#fff)] hover:bg-[var(--color-bg-surface,#2a2a2a)] transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SignInButton / SignOutButton
// ---------------------------------------------------------------------------

export function SignInButton({
  children,
  mode: _mode,
}: {
  children?: ReactNode;
  mode?: 'modal' | 'redirect';
}) {
  return (
    <a href="/sign-in" className="inline-block">
      {children ?? (
        <span className="px-4 py-2 rounded-lg bg-[var(--color-accent,#6366f1)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          Sign In
        </span>
      )}
    </a>
  );
}

export function SignOutButton({ children }: { children?: ReactNode }) {
  const { signOut } = useAuth();
  return (
    <button onClick={() => signOut()}>
      {children ?? 'Sign Out'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// forgotPassword helper
// ---------------------------------------------------------------------------

export async function forgotPassword(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// SignIn — email/password + Google OAuth + forgot password
// ---------------------------------------------------------------------------

export function SignIn({
  routing: _routing,
  path: _path,
  afterSignInUrl,
  redirectUrl,
}: {
  routing?: string;
  path?: string;
  afterSignInUrl?: string;
  redirectUrl?: string;
  appearance?: unknown;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'sign-in' | 'forgot'>('sign-in');
  const [forgotSent, setForgotSent] = useState(false);

  const dest = afterSignInUrl || redirectUrl || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = getSupabase();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    window.location.href = dest;
  };

  const handleOAuth = async (provider: 'google') => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${dest}` },
    });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await forgotPassword(email);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    setForgotSent(true);
    setLoading(false);
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-[var(--color-border,#333)] bg-[var(--color-bg-surface,#1a1a1a)] text-[var(--color-text-primary,#fff)] text-sm placeholder:text-[var(--color-text-muted,#666)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#6366f1)] transition-all';

  const btnPrimary =
    'w-full py-3 rounded-lg bg-[var(--color-accent,#6366f1)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity';

  if (view === 'forgot') {
    return (
      <div className="w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)]">
        <h2 className="text-xl font-bold mb-2 text-[var(--color-text-primary,#fff)]">
          Reset Password
        </h2>
        <p className="text-sm text-[var(--color-text-muted,#888)] mb-6">
          We&apos;ll send you a link to reset your password.
        </p>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {forgotSent ? (
          <div className="text-sm text-green-400">
            Check your email for a password reset link.
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <button
          onClick={() => { setView('sign-in'); setError(''); setForgotSent(false); }}
          className="mt-6 text-xs text-[var(--color-accent,#6366f1)] hover:underline"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)]">
      <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary,#fff)]">
        Sign In
      </h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => { setView('forgot'); setError(''); }}
            className="text-xs text-[var(--color-text-muted,#888)] hover:text-[var(--color-accent,#6366f1)] transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border,#333)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-[var(--color-bg-elevated,#1e1e1e)] text-[var(--color-text-muted,#888)]">
            or
          </span>
        </div>
      </div>

      <button
        onClick={() => handleOAuth('google')}
        className="w-full py-3 rounded-lg border border-[var(--color-border,#333)] text-sm text-[var(--color-text-primary,#fff)] hover:bg-[var(--color-bg-surface,#2a2a2a)] transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-xs text-center text-[var(--color-text-muted,#888)]">
        Don&apos;t have an account?{' '}
        <a href="/sign-up" className="text-[var(--color-accent,#6366f1)] hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SignUp — registration form (email, password, name)
// ---------------------------------------------------------------------------

export function SignUp({
  afterSignUpUrl,
  redirectUrl,
}: {
  afterSignUpUrl?: string;
  redirectUrl?: string;
  routing?: string;
  path?: string;
  appearance?: unknown;
} = {}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const dest = afterSignUpUrl || redirectUrl || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = getSupabase();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || null,
          last_name: lastName || null,
          full_name: fullName || null,
        },
        emailRedirectTo: `${window.location.origin}${dest}`,
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google') => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${dest}` },
    });
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-[var(--color-border,#333)] bg-[var(--color-bg-surface,#1a1a1a)] text-[var(--color-text-primary,#fff)] text-sm placeholder:text-[var(--color-text-muted,#666)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#6366f1)] transition-all';

  const btnPrimary =
    'w-full py-3 rounded-lg bg-[var(--color-accent,#6366f1)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity';

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)] text-center">
        <h2 className="text-xl font-bold mb-3 text-[var(--color-text-primary,#fff)]">
          Check Your Email
        </h2>
        <p className="text-sm text-[var(--color-text-muted,#888)]">
          We sent a confirmation link to <strong className="text-[var(--color-text-primary,#fff)]">{email}</strong>.
          Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)]">
      <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary,#fff)]">
        Create Account
      </h2>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
          minLength={6}
        />
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border,#333)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-[var(--color-bg-elevated,#1e1e1e)] text-[var(--color-text-muted,#888)]">
            or
          </span>
        </div>
      </div>

      <button
        onClick={() => handleOAuth('google')}
        className="w-full py-3 rounded-lg border border-[var(--color-border,#333)] text-sm text-[var(--color-text-primary,#fff)] hover:bg-[var(--color-bg-surface,#2a2a2a)] transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-xs text-center text-[var(--color-text-muted,#888)]">
        Already have an account?{' '}
        <a href="/sign-in" className="text-[var(--color-accent,#6366f1)] hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}

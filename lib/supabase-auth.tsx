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
// Loading Spinner Component
// ---------------------------------------------------------------------------

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ animation: 'spin 0.75s linear infinite' }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Google Logo Component (colorful)
// ---------------------------------------------------------------------------

function GoogleLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid transparent',
          outline: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: open
            ? `0 0 0 3px var(--color-accent, #6366f1)`
            : 'none',
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-accent, #6366f1)`;
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <img
          src={user.imageUrl}
          alt={user.fullName || 'User avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '240px',
            borderRadius: '12px',
            border: '1px solid var(--color-border, #333)',
            backgroundColor: 'var(--color-bg-elevated, #1e1e1e)',
            boxShadow:
              '0 10px 38px -10px rgba(0, 0, 0, 0.4), 0 10px 20px -15px rgba(0, 0, 0, 0.3)',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'slideDown 0.15s ease-out',
          }}
        >
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--color-border, #333)',
            }}
          >
            {user.fullName && (
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #fff)',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.fullName}
              </p>
            )}
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted, #888)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = afterSignOutUrl;
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-primary, #fff)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--color-bg-surface, #2a2a2a)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
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
    <a
      href="/sign-in"
      style={{
        display: 'inline-block',
        textDecoration: 'none',
      }}
    >
      {children ?? (
        <span
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-accent, #6366f1)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
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

  // Shared styles with CSS custom properties for theme support
  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid var(--color-border, #333)',
    backgroundColor: 'var(--color-bg-elevated, #1e1e1e)',
    boxShadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-text-primary, #fff)',
    marginBottom: '8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-muted, #888)',
    marginBottom: '24px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--color-border, #333)',
    backgroundColor: 'var(--color-bg-surface, #1a1a1a)',
    color: 'var(--color-text-primary, #fff)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-accent, #6366f1)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1.5px solid var(--color-border, #333)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary, #fff)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const errorStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '16px',
  };

  const successStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
    fontSize: '13px',
  };

  if (view === 'forgot') {
    return (
      <div style={containerStyle}>
        <h2 style={headingStyle}>Reset Password</h2>
        <p style={subtitleStyle}>
          We&apos;ll send you a link to reset your password.
        </p>
        {error && <div style={errorStyle}>{error}</div>}
        {forgotSent ? (
          <div style={successStyle}>
            Check your email for a password reset link.
          </div>
        ) : (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border, #333)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
            <button
              type="submit"
              disabled={loading}
              style={primaryButtonStyle}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.opacity = '1';
              }}
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
        <button
          onClick={() => {
            setView('sign-in');
            setError('');
            setForgotSent(false);
          }}
          style={{
            marginTop: '24px',
            fontSize: '13px',
            color: 'var(--color-accent, #6366f1)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Sign In</h2>
      <p style={subtitleStyle}>Welcome back! Please sign in to continue.</p>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border, #333)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border, #333)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            required
          />
          <button
            type="button"
            onClick={() => {
              setView('forgot');
              setError('');
            }}
            style={{
              marginTop: '8px',
              fontSize: '13px',
              color: 'var(--color-text-muted, #888)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-accent, #6366f1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted, #888)';
            }}
          >
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.opacity = '1';
          }}
        >
          {loading ? (
            <>
              <Spinner className="w-4 h-4" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div style={{ position: 'relative', margin: '24px 0' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              borderTop: '1px solid var(--color-border, #333)',
            }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <span
            style={{
              padding: '0 12px',
              backgroundColor: 'var(--color-bg-elevated, #1e1e1e)',
              fontSize: '12px',
              color: 'var(--color-text-muted, #888)',
              fontWeight: 500,
            }}
          >
            or
          </span>
        </div>
      </div>

      <button
        onClick={() => handleOAuth('google')}
        style={secondaryButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-surface, #2a2a2a)';
          e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'var(--color-border, #333)';
        }}
      >
        <GoogleLogo />
        Continue with Google
      </button>

      <p
        style={{
          marginTop: '24px',
          fontSize: '13px',
          textAlign: 'center',
          color: 'var(--color-text-muted, #888)',
        }}
      >
        Don&apos;t have an account?{' '}
        <a
          href="/sign-up"
          style={{
            color: 'var(--color-accent, #6366f1)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
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

  // Shared styles
  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid var(--color-border, #333)',
    backgroundColor: 'var(--color-bg-elevated, #1e1e1e)',
    boxShadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-text-primary, #fff)',
    marginBottom: '8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-muted, #888)',
    marginBottom: '24px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--color-border, #333)',
    backgroundColor: 'var(--color-bg-surface, #1a1a1a)',
    color: 'var(--color-text-primary, #fff)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-accent, #6366f1)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1.5px solid var(--color-border, #333)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary, #fff)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const errorStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '16px',
  };

  const successTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-muted, #888)',
    lineHeight: '1.6',
  };

  if (success) {
    return (
      <div style={{ ...containerStyle, textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            style={{ width: '28px', height: '28px', color: '#22c55e' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 style={headingStyle}>Check Your Email</h2>
        <p style={successTextStyle}>
          We sent a confirmation link to{' '}
          <strong style={{ color: 'var(--color-text-primary, #fff)', fontWeight: 600 }}>
            {email}
          </strong>
          . Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Create Account</h2>
      <p style={subtitleStyle}>Get started with your free account today.</p>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border, #333)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border, #333)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border, #333)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          required
        />
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border, #333)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            required
            minLength={6}
          />
          <p
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--color-text-muted, #888)',
            }}
          >
            Minimum 6 characters
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.opacity = '1';
          }}
        >
          {loading ? (
            <>
              <Spinner className="w-4 h-4" />
              Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div style={{ position: 'relative', margin: '24px 0' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              borderTop: '1px solid var(--color-border, #333)',
            }}
          />
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <span
            style={{
              padding: '0 12px',
              backgroundColor: 'var(--color-bg-elevated, #1e1e1e)',
              fontSize: '12px',
              color: 'var(--color-text-muted, #888)',
              fontWeight: 500,
            }}
          >
            or
          </span>
        </div>
      </div>

      <button
        onClick={() => handleOAuth('google')}
        style={secondaryButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-surface, #2a2a2a)';
          e.currentTarget.style.borderColor = 'var(--color-accent, #6366f1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'var(--color-border, #333)';
        }}
      >
        <GoogleLogo />
        Continue with Google
      </button>

      <p
        style={{
          marginTop: '24px',
          fontSize: '13px',
          textAlign: 'center',
          color: 'var(--color-text-muted, #888)',
        }}
      >
        Already have an account?{' '}
        <a
          href="/sign-in"
          style={{
            color: 'var(--color-accent, #6366f1)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Sign in
        </a>
      </p>
    </div>
  );
}

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Supabase Auth — Drop-in replacement for Clerk auth components
 *
 * Provides the same API surface as @clerk/clerk-react so consuming apps
 * (myrestoevent, myrestogarage, myrestoclub) don't need changes.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, } from 'react';
import { createClient, } from '@supabase/supabase-js';
// ---------------------------------------------------------------------------
// Supabase client singleton
// ---------------------------------------------------------------------------
let _supabase = null;
function getSupabase() {
    if (!_supabase) {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
        }
        _supabase = createClient(url, key);
    }
    return _supabase;
}
const AuthContext = createContext(null);
function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth / useUser must be used inside <AuthProvider>');
    return ctx;
}
// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
    const supabase = getSupabase();
    const [session, setSession] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        // Initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setIsLoaded(true);
        });
        // Listen for changes (sign-in, sign-out, token refresh)
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, s) => {
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
    const value = {
        session,
        user: session?.user ?? null,
        isLoaded,
        isSignedIn: !!session,
        getToken,
        signOut,
        supabase,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
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
        return { user: null, isSignedIn: false, isLoaded: ctx.isLoaded };
    }
    const meta = u.user_metadata ?? {};
    return {
        user: {
            id: u.id,
            primaryEmailAddress: { emailAddress: u.email },
            emailAddresses: [{ emailAddress: u.email }],
            firstName: meta.first_name ?? null,
            lastName: meta.last_name ?? null,
            fullName: meta.full_name ?? null,
            imageUrl: meta.avatar_url ??
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
            username: meta.username ?? null,
            publicMetadata: u.app_metadata ?? {},
        },
        isSignedIn: true,
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
export function SignedIn({ children }) {
    const { isSignedIn, isLoaded } = useAuth();
    return isLoaded && isSignedIn ? _jsx(_Fragment, { children: children }) : null;
}
export function SignedOut({ children }) {
    const { isSignedIn, isLoaded } = useAuth();
    return isLoaded && !isSignedIn ? _jsx(_Fragment, { children: children }) : null;
}
// ---------------------------------------------------------------------------
// UserButton — avatar dropdown with sign-out
// ---------------------------------------------------------------------------
export function UserButton({ afterSignOutUrl = '/', }) {
    const { user } = useUser();
    const { signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    // Close on outside click
    useEffect(() => {
        if (!open)
            return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);
    if (!user)
        return null;
    return (_jsxs("div", { ref: ref, className: "relative", children: [_jsx("button", { onClick: () => setOpen((o) => !o), className: "rounded-full overflow-hidden w-8 h-8 ring-2 ring-transparent hover:ring-[var(--color-accent,#6366f1)] transition-all", children: _jsx("img", { src: user.imageUrl, alt: "", className: "w-full h-full object-cover" }) }), open && (_jsxs("div", { className: "absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)] shadow-xl z-50 overflow-hidden", children: [_jsxs("div", { className: "px-4 py-3 border-b border-[var(--color-border,#333)]", children: [user.fullName && (_jsx("p", { className: "text-sm font-medium text-[var(--color-text-primary,#fff)]", children: user.fullName })), _jsx("p", { className: "text-xs text-[var(--color-text-muted,#888)] truncate", children: user.primaryEmailAddress?.emailAddress })] }), _jsx("button", { onClick: async () => {
                            await signOut();
                            window.location.href = afterSignOutUrl;
                        }, className: "w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-primary,#fff)] hover:bg-[var(--color-bg-surface,#2a2a2a)] transition-colors", children: "Sign out" })] }))] }));
}
// ---------------------------------------------------------------------------
// SignInButton / SignOutButton
// ---------------------------------------------------------------------------
export function SignInButton({ children, mode: _mode, }) {
    return (_jsx("a", { href: "/sign-in", className: "inline-block", children: children ?? (_jsx("span", { className: "px-4 py-2 rounded-lg bg-[var(--color-accent,#6366f1)] text-white text-sm font-medium hover:opacity-90 transition-opacity", children: "Sign In" })) }));
}
export function SignOutButton({ children }) {
    const { signOut } = useAuth();
    return (_jsx("button", { onClick: () => signOut(), children: children ?? 'Sign Out' }));
}
// ---------------------------------------------------------------------------
// forgotPassword helper
// ---------------------------------------------------------------------------
export async function forgotPassword(email) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
}
// ---------------------------------------------------------------------------
// SignIn — email/password + Google OAuth + forgot password
// ---------------------------------------------------------------------------
export function SignIn({ routing: _routing, path: _path, afterSignInUrl, redirectUrl, }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('sign-in');
    const [forgotSent, setForgotSent] = useState(false);
    const dest = afterSignInUrl || redirectUrl || '/dashboard';
    const handleSubmit = async (e) => {
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
    const handleOAuth = async (provider) => {
        const supabase = getSupabase();
        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}${dest}` },
        });
    };
    const handleForgot = async (e) => {
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
    const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-[var(--color-border,#333)] bg-[var(--color-bg-surface,#1a1a1a)] text-[var(--color-text-primary,#fff)] text-sm placeholder:text-[var(--color-text-muted,#666)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#6366f1)] transition-all';
    const btnPrimary = 'w-full py-2.5 rounded-lg bg-[var(--color-accent,#6366f1)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity';
    if (view === 'forgot') {
        return (_jsxs("div", { className: "w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)]", children: [_jsx("h2", { className: "text-xl font-bold mb-1 text-[var(--color-text-primary,#fff)]", children: "Reset Password" }), _jsx("p", { className: "text-sm text-[var(--color-text-muted,#888)] mb-4", children: "We'll send you a link to reset your password." }), error && _jsx("p", { className: "text-red-400 text-sm mb-3", children: error }), forgotSent ? (_jsx("div", { className: "text-sm text-green-400", children: "Check your email for a password reset link." })) : (_jsxs("form", { onSubmit: handleForgot, className: "space-y-3", children: [_jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), className: inputClass, required: true }), _jsx("button", { type: "submit", disabled: loading, className: btnPrimary, children: loading ? 'Sending...' : 'Send Reset Link' })] })), _jsx("button", { onClick: () => { setView('sign-in'); setError(''); setForgotSent(false); }, className: "mt-4 text-xs text-[var(--color-accent,#6366f1)] hover:underline", children: "\u2190 Back to sign in" })] }));
    }
    return (_jsxs("div", { className: "w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)]", children: [_jsx("h2", { className: "text-xl font-bold mb-4 text-[var(--color-text-primary,#fff)]", children: "Sign In" }), error && _jsx("p", { className: "text-red-400 text-sm mb-3", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), className: inputClass, required: true }), _jsx("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), className: inputClass, required: true }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "button", onClick: () => { setView('forgot'); setError(''); }, className: "text-xs text-[var(--color-text-muted,#888)] hover:text-[var(--color-accent,#6366f1)] transition-colors", children: "Forgot password?" }) }), _jsx("button", { type: "submit", disabled: loading, className: btnPrimary, children: loading ? 'Signing in...' : 'Sign In' })] }), _jsxs("div", { className: "relative my-5", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-[var(--color-border,#333)]" }) }), _jsx("div", { className: "relative flex justify-center text-xs", children: _jsx("span", { className: "px-2 bg-[var(--color-bg-elevated,#1e1e1e)] text-[var(--color-text-muted,#888)]", children: "or" }) })] }), _jsxs("button", { onClick: () => handleOAuth('google'), className: "w-full py-2.5 rounded-lg border border-[var(--color-border,#333)] text-sm text-[var(--color-text-primary,#fff)] hover:bg-[var(--color-bg-surface,#2a2a2a)] transition-colors flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" }), _jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "currentColor", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Continue with Google"] }), _jsxs("p", { className: "mt-4 text-xs text-center text-[var(--color-text-muted,#888)]", children: ["Don't have an account?", ' ', _jsx("a", { href: "/sign-up", className: "text-[var(--color-accent,#6366f1)] hover:underline", children: "Sign up" })] })] }));
}
// ---------------------------------------------------------------------------
// SignUp — registration form (email, password, name)
// ---------------------------------------------------------------------------
export function SignUp({ afterSignUpUrl, redirectUrl, } = {}) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const dest = afterSignUpUrl || redirectUrl || '/dashboard';
    const handleSubmit = async (e) => {
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
    const handleOAuth = async (provider) => {
        const supabase = getSupabase();
        await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}${dest}` },
        });
    };
    const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-[var(--color-border,#333)] bg-[var(--color-bg-surface,#1a1a1a)] text-[var(--color-text-primary,#fff)] text-sm placeholder:text-[var(--color-text-muted,#666)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent,#6366f1)] transition-all';
    const btnPrimary = 'w-full py-2.5 rounded-lg bg-[var(--color-accent,#6366f1)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity';
    if (success) {
        return (_jsxs("div", { className: "w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)] text-center", children: [_jsx("h2", { className: "text-xl font-bold mb-2 text-[var(--color-text-primary,#fff)]", children: "Check Your Email" }), _jsxs("p", { className: "text-sm text-[var(--color-text-muted,#888)]", children: ["We sent a confirmation link to ", _jsx("strong", { className: "text-[var(--color-text-primary,#fff)]", children: email }), ". Click it to activate your account."] })] }));
    }
    return (_jsxs("div", { className: "w-full max-w-sm mx-auto p-6 rounded-xl border border-[var(--color-border,#333)] bg-[var(--color-bg-elevated,#1e1e1e)]", children: [_jsx("h2", { className: "text-xl font-bold mb-4 text-[var(--color-text-primary,#fff)]", children: "Create Account" }), error && _jsx("p", { className: "text-red-400 text-sm mb-3", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx("input", { type: "text", placeholder: "First name", value: firstName, onChange: (e) => setFirstName(e.target.value), className: inputClass }), _jsx("input", { type: "text", placeholder: "Last name", value: lastName, onChange: (e) => setLastName(e.target.value), className: inputClass })] }), _jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), className: inputClass, required: true }), _jsx("input", { type: "password", placeholder: "Password (min 6 characters)", value: password, onChange: (e) => setPassword(e.target.value), className: inputClass, required: true, minLength: 6 }), _jsx("button", { type: "submit", disabled: loading, className: btnPrimary, children: loading ? 'Creating account...' : 'Sign Up' })] }), _jsxs("div", { className: "relative my-5", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-[var(--color-border,#333)]" }) }), _jsx("div", { className: "relative flex justify-center text-xs", children: _jsx("span", { className: "px-2 bg-[var(--color-bg-elevated,#1e1e1e)] text-[var(--color-text-muted,#888)]", children: "or" }) })] }), _jsxs("button", { onClick: () => handleOAuth('google'), className: "w-full py-2.5 rounded-lg border border-[var(--color-border,#333)] text-sm text-[var(--color-text-primary,#fff)] hover:bg-[var(--color-bg-surface,#2a2a2a)] transition-colors flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" }), _jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "currentColor", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Continue with Google"] }), _jsxs("p", { className: "mt-4 text-xs text-center text-[var(--color-text-muted,#888)]", children: ["Already have an account?", ' ', _jsx("a", { href: "/sign-in", className: "text-[var(--color-accent,#6366f1)] hover:underline", children: "Sign in" })] })] }));
}
//# sourceMappingURL=supabase-auth.js.map
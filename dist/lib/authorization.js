import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
/**
 * Authorization hooks and gate components for the MyResto ecosystem.
 *
 * Built on top of the existing Supabase auth layer (`supabase-auth.tsx`).
 * Uses useState/useEffect — no external query library needed.
 *
 * @example
 * ```tsx
 * import { useIsSuperAdmin, useSubscription, RequirePro } from '@myresto/shared/lib/authorization';
 *
 * function PremiumFeature() {
 *   return (
 *     <RequirePro fallback={<p>Upgrade to Pro to access this feature.</p>}>
 *       <ExpensiveWidget />
 *     </RequirePro>
 *   );
 * }
 * ```
 */
import { useEffect, useState } from 'react';
import { useUser, useAuth, useSupabase } from './supabase-auth';
import { getCurrentApp } from './config';
// ---------------------------------------------------------------------------
// KEV-225: useIsSuperAdmin
// ---------------------------------------------------------------------------
/**
 * Synchronous check — reads `app_metadata.role` from the already-loaded JWT.
 * No database query needed.
 */
export function useIsSuperAdmin() {
    const { user } = useUser();
    if (!user)
        return false;
    return user.publicMetadata?.role === 'super_admin';
}
/**
 * Fetches the current user's roles for the current (or specified) app
 * from the `user_roles` table.
 *
 * Super admins short-circuit — `hasRole()` always returns `true`.
 */
export function useAppRole(appOverride) {
    const { user } = useUser();
    const supabase = useSupabase();
    const isSuperAdmin = useIsSuperAdmin();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const app = appOverride ?? getCurrentApp();
    const userId = user?.id ?? null;
    useEffect(() => {
        if (isSuperAdmin) {
            setLoading(false);
            return;
        }
        if (!userId || !app) {
            setRoles([]);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('app', app)
            .then(({ data, error }) => {
            if (cancelled)
                return;
            if (error) {
                console.error('[useAppRole]', error.message);
                setRoles([]);
            }
            else {
                setRoles(data?.map((r) => r.role) ?? []);
            }
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [userId, app, isSuperAdmin, supabase]);
    if (isSuperAdmin) {
        return { roles: ['super_admin'], hasRole: () => true, loading: false };
    }
    return {
        roles,
        hasRole: (role) => roles.includes(role),
        loading,
    };
}
/**
 * Fetches the current user's subscription from the `subscriptions` table.
 * Super admins are always treated as Pro.
 */
export function useSubscription() {
    const { user } = useUser();
    const supabase = useSupabase();
    const isSuperAdmin = useIsSuperAdmin();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = user?.id ?? null;
    useEffect(() => {
        if (!userId) {
            setSubscription(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()
            .then(({ data, error }) => {
            if (cancelled)
                return;
            if (error) {
                console.error('[useSubscription]', error.message);
                setSubscription(null);
            }
            else {
                setSubscription(data);
            }
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [userId, supabase]);
    const plan = subscription?.plan ?? 'free';
    const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
    const isPro = isSuperAdmin || (plan === 'pro' && isActive);
    return { plan, isPro, isActive, subscription, loading };
}
// ---------------------------------------------------------------------------
// KEV-228: Gate components
// ---------------------------------------------------------------------------
/**
 * Requires the user to be signed in. Shows fallback (or nothing) otherwise.
 */
export function RequireAuth({ children, fallback = null, }) {
    const { isSignedIn, isLoaded } = useAuth();
    if (!isLoaded)
        return null;
    if (!isSignedIn)
        return _jsx(_Fragment, { children: fallback });
    return _jsx(_Fragment, { children: children });
}
/**
 * Requires a Pro subscription (or super_admin). Shows fallback otherwise.
 */
export function RequirePro({ children, fallback = null, }) {
    const { isPro, loading } = useSubscription();
    if (loading)
        return null;
    if (!isPro)
        return _jsx(_Fragment, { children: fallback });
    return _jsx(_Fragment, { children: children });
}
/**
 * Requires the user to have a specific app role. Shows fallback otherwise.
 */
export function RequireRole({ role, app, children, fallback = null, }) {
    const { hasRole, loading } = useAppRole(app);
    if (loading)
        return null;
    if (!hasRole(role))
        return _jsx(_Fragment, { children: fallback });
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=authorization.js.map
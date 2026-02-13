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

import { useEffect, useState, type ReactNode } from 'react';
import { useUser, useAuth, useSupabase } from './supabase-auth';
import { getCurrentApp, type AppId } from './config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  app: string;
  role: string;
  granted_at: string;
  granted_by: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// KEV-225: useIsSuperAdmin
// ---------------------------------------------------------------------------

/**
 * Synchronous check — reads `app_metadata.role` from the already-loaded JWT.
 * No database query needed.
 */
export function useIsSuperAdmin(): boolean {
  const { user } = useUser();
  if (!user) return false;
  return (user as any).publicMetadata?.role === 'super_admin';
}

// ---------------------------------------------------------------------------
// KEV-226: useAppRole
// ---------------------------------------------------------------------------

export interface UseAppRoleResult {
  roles: string[];
  hasRole: (role: string) => boolean;
  loading: boolean;
}

/**
 * Fetches the current user's roles for the current (or specified) app
 * from the `user_roles` table.
 *
 * Super admins short-circuit — `hasRole()` always returns `true`.
 */
export function useAppRole(appOverride?: AppId): UseAppRoleResult {
  const { user } = useUser();
  const supabase = useSupabase();
  const isSuperAdmin = useIsSuperAdmin();
  const [roles, setRoles] = useState<string[]>([]);
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
        if (cancelled) return;
        if (error) {
          console.error('[useAppRole]', error.message);
          setRoles([]);
        } else {
          setRoles(data?.map((r: { role: string }) => r.role) ?? []);
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
    hasRole: (role: string) => roles.includes(role),
    loading,
  };
}

// ---------------------------------------------------------------------------
// KEV-227: useSubscription
// ---------------------------------------------------------------------------

export interface UseSubscriptionResult {
  plan: string;
  isPro: boolean;
  isActive: boolean;
  subscription: Subscription | null;
  loading: boolean;
}

/**
 * Fetches the current user's subscription from the `subscriptions` table.
 * Super admins are always treated as Pro.
 */
export function useSubscription(): UseSubscriptionResult {
  const { user } = useUser();
  const supabase = useSupabase();
  const isSuperAdmin = useIsSuperAdmin();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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
        if (cancelled) return;
        if (error) {
          console.error('[useSubscription]', error.message);
          setSubscription(null);
        } else {
          setSubscription(data as Subscription);
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
export function RequireAuth({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Requires a Pro subscription (or super_admin). Shows fallback otherwise.
 */
export function RequirePro({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isPro, loading } = useSubscription();
  if (loading) return null;
  if (!isPro) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Requires the user to have a specific app role. Shows fallback otherwise.
 */
export function RequireRole({
  role,
  app,
  children,
  fallback = null,
}: {
  role: string;
  app?: AppId;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasRole, loading } = useAppRole(app);
  if (loading) return null;
  if (!hasRole(role)) return <>{fallback}</>;
  return <>{children}</>;
}

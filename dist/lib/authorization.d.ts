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
import { type ReactNode } from 'react';
import { type AppId } from './config';
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
/**
 * Synchronous check — reads `app_metadata.role` from the already-loaded JWT.
 * No database query needed.
 */
export declare function useIsSuperAdmin(): boolean;
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
export declare function useAppRole(appOverride?: AppId): UseAppRoleResult;
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
export declare function useSubscription(): UseSubscriptionResult;
/**
 * Requires the user to be signed in. Shows fallback (or nothing) otherwise.
 */
export declare function RequireAuth({ children, fallback, }: {
    children: ReactNode;
    fallback?: ReactNode;
}): import("react/jsx-runtime").JSX.Element | null;
/**
 * Requires a Pro subscription (or super_admin). Shows fallback otherwise.
 */
export declare function RequirePro({ children, fallback, }: {
    children: ReactNode;
    fallback?: ReactNode;
}): import("react/jsx-runtime").JSX.Element | null;
/**
 * Requires the user to have a specific app role. Shows fallback otherwise.
 */
export declare function RequireRole({ role, app, children, fallback, }: {
    role: string;
    app?: AppId;
    children: ReactNode;
    fallback?: ReactNode;
}): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=authorization.d.ts.map
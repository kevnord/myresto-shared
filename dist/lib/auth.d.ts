/**
 * Auth Abstraction Layer
 *
 * Re-exports authentication hooks and components from either:
 * - @clerk/clerk-react (production)
 * - ../test/mockAuth (when VITE_AUTH_BYPASS is enabled)
 *
 * Usage in your app:
 * ```ts
 * import { useAuth, useUser, UserButton } from '@myresto/shared/lib/auth';
 * ```
 */
import * as ClerkAuth from '@clerk/clerk-react';
import * as MockAuth from '../test/mockAuth';
export declare const useAuth: typeof MockAuth.useAuth | ((initialAuthStateOrOptions?: Record<string, any> | import("@clerk/shared/types").PendingSessionOptions | null | undefined) => import("@clerk/shared/types").UseAuthReturn);
export declare const useUser: typeof MockAuth.useUser | typeof ClerkAuth.useUser;
export declare const UserButton: any;
export declare const SignOutButton: any;
export declare const SignIn: any;
export declare const SignedIn: any;
export declare const SignedOut: any;
export declare const SignInButton: any;
//# sourceMappingURL=auth.d.ts.map
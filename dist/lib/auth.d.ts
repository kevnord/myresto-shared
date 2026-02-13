/**
 * Auth Abstraction Layer
 *
 * Re-exports authentication hooks and components from either:
 * - ./supabase-auth (production — Supabase Auth)
 * - ../test/mockAuth (when VITE_AUTH_BYPASS is enabled)
 *
 * Usage in your app:
 * ```ts
 * import { useAuth, useUser, UserButton } from '@myresto/shared/lib/auth';
 * ```
 */
import * as SupabaseAuth from './supabase-auth';
import * as MockAuth from '../test/mockAuth';
export declare const AuthProvider: any;
export declare const useAuth: typeof MockAuth.useAuth;
export declare const useUser: typeof MockAuth.useUser;
export declare const UserButton: any;
export declare const SignOutButton: any;
export declare const SignIn: any;
export declare const SignUp: any;
export declare const SignedIn: any;
export declare const SignedOut: any;
export declare const SignInButton: any;
export declare const forgotPassword: typeof SupabaseAuth.forgotPassword;
export declare const useSupabase: typeof SupabaseAuth.useSupabase;
//# sourceMappingURL=auth.d.ts.map
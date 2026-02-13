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

const AUTH_BYPASS = import.meta.env?.VITE_AUTH_BYPASS === 'true';

export const AuthProvider: any = AUTH_BYPASS ? (MockAuth as any).MockAuthProvider ?? SupabaseAuth.AuthProvider : SupabaseAuth.AuthProvider;
export const useAuth = AUTH_BYPASS ? MockAuth.useAuth : SupabaseAuth.useAuth;
export const useUser = AUTH_BYPASS ? MockAuth.useUser : SupabaseAuth.useUser;
export const UserButton: any = AUTH_BYPASS ? MockAuth.UserButton : SupabaseAuth.UserButton;
export const SignOutButton: any = AUTH_BYPASS ? MockAuth.SignOutButton : SupabaseAuth.SignOutButton;
export const SignIn: any = AUTH_BYPASS ? MockAuth.SignIn : SupabaseAuth.SignIn;
export const SignUp: any = SupabaseAuth.SignUp;
export const SignedIn: any = AUTH_BYPASS ? MockAuth.SignedIn : SupabaseAuth.SignedIn;
export const SignedOut: any = AUTH_BYPASS ? MockAuth.SignedOut : SupabaseAuth.SignedOut;
export const SignInButton: any = AUTH_BYPASS ? MockAuth.SignInButton : SupabaseAuth.SignInButton;
export const forgotPassword = SupabaseAuth.forgotPassword;
export const useSupabase = SupabaseAuth.useSupabase;

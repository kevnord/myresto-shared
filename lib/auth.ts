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

const AUTH_BYPASS = import.meta.env?.VITE_AUTH_BYPASS === 'true';

export const useAuth = AUTH_BYPASS ? MockAuth.useAuth : ClerkAuth.useAuth;
export const useUser = AUTH_BYPASS ? MockAuth.useUser : ClerkAuth.useUser;
export const UserButton = AUTH_BYPASS ? MockAuth.UserButton : ClerkAuth.UserButton;
export const SignOutButton = AUTH_BYPASS ? MockAuth.SignOutButton : ClerkAuth.SignOutButton;
export const SignIn = AUTH_BYPASS ? MockAuth.SignIn : ClerkAuth.SignIn;
export const SignedIn = AUTH_BYPASS ? MockAuth.SignedIn : ClerkAuth.SignedIn;
export const SignedOut = AUTH_BYPASS ? MockAuth.SignedOut : ClerkAuth.SignedOut;
export const SignInButton = AUTH_BYPASS ? MockAuth.SignInButton : ClerkAuth.SignInButton;

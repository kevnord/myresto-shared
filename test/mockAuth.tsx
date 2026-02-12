/**
 * Mock Auth Provider for Development
 * 
 * Provides a fake authentication context when VITE_AUTH_BYPASS is enabled.
 * This allows running the app without Clerk authentication for development/testing.
 */

import React, { createContext, useContext, type ReactNode } from 'react';

interface MockUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  primaryEmailAddress: { emailAddress: string } | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  username: string | null;
  publicMetadata: Record<string, any>;
}

interface MockAuthContext {
  isSignedIn: boolean;
  isLoaded: boolean;
  userId: string | null;
  getToken: () => Promise<string | null>;
}

interface MockUserContext {
  user: MockUser | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}

const MockAuthCtx = createContext<MockAuthContext>({
  isSignedIn: true,
  isLoaded: true,
  userId: 'dev-user',
  getToken: async () => 'mock-token',
});

const mockUser: MockUser = {
  id: 'dev-user',
  emailAddresses: [{ emailAddress: 'dev@myrestoevent.local' }],
  primaryEmailAddress: { emailAddress: 'dev@myrestoevent.local' },
  firstName: 'Dev',
  lastName: 'User',
  fullName: 'Dev User',
  imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
  username: 'devuser',
  publicMetadata: { role: 'admin' },
};

const MockUserCtx = createContext<MockUserContext>({
  user: mockUser,
  isSignedIn: true,
  isLoaded: true,
});

export function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MockAuthCtx.Provider
      value={{
        isSignedIn: true,
        isLoaded: true,
        userId: 'dev-user',
        getToken: async () => 'mock-token',
      }}
    >
      <MockUserCtx.Provider
        value={{
          user: mockUser,
          isSignedIn: true,
          isLoaded: true,
        }}
      >
        {children}
      </MockUserCtx.Provider>
    </MockAuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(MockAuthCtx);
}

export function useUser() {
  return useContext(MockUserCtx);
}

export function UserButton() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
      D
    </div>
  );
}

export function SignOutButton({ children }: { children: ReactNode }) {
  return (
    <button
      onClick={() => console.log('[MockAuth] Sign out clicked (no-op in bypass mode)')}
      className="text-sm text-gray-400 hover:text-white"
    >
      {children}
    </button>
  );
}

export function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg">
      <p className="text-white mb-2">🚧 Auth Bypass Mode</p>
      <p className="text-gray-400 text-sm">VITE_AUTH_BYPASS is enabled</p>
    </div>
  );
}

export function SignedIn({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  return null;
}

export function SignInButton({ children, mode }: { children: ReactNode; mode?: string }) {
  return (
    <button
      onClick={() => console.log('[MockAuth] Sign in clicked (already signed in - bypass mode)')}
      className="text-sm text-gray-400 hover:text-white"
    >
      {children}
    </button>
  );
}

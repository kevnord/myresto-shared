/**
 * Mock Auth Provider for Development
 *
 * Provides a fake authentication context when VITE_AUTH_BYPASS is enabled.
 * This allows running the app without Clerk authentication for development/testing.
 */
import { type ReactNode } from 'react';
interface MockUser {
    id: string;
    emailAddresses: Array<{
        emailAddress: string;
    }>;
    primaryEmailAddress: {
        emailAddress: string;
    } | null;
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
export declare function MockAuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): MockAuthContext;
export declare function useUser(): MockUserContext;
export declare function UserButton(): import("react/jsx-runtime").JSX.Element;
export declare function SignOutButton({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function SignIn(): import("react/jsx-runtime").JSX.Element;
export declare function SignedIn({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function SignedOut({ children }: {
    children: ReactNode;
}): null;
export declare function SignInButton({ children, mode }: {
    children: ReactNode;
    mode?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=mockAuth.d.ts.map
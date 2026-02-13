/**
 * Supabase Auth — Drop-in replacement for Clerk auth components
 *
 * Provides the same API surface as @clerk/clerk-react so consuming apps
 * (myrestoevent, myrestogarage, myrestoclub) don't need changes.
 */
import { type ReactNode } from 'react';
import { type SupabaseClient } from '@supabase/supabase-js';
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): {
    isLoaded: boolean;
    isSignedIn: boolean;
    getToken: () => Promise<string | null>;
    userId: string | null;
    signOut: () => Promise<void>;
};
export declare function useUser(): {
    user: null;
    isSignedIn: false;
    isLoaded: boolean;
} | {
    user: {
        id: string;
        primaryEmailAddress: {
            emailAddress: string;
        };
        emailAddresses: {
            emailAddress: string;
        }[];
        firstName: string;
        lastName: string;
        fullName: string;
        imageUrl: string;
        username: string;
        publicMetadata: import("@supabase/auth-js").UserAppMetadata;
    };
    isSignedIn: true;
    isLoaded: boolean;
};
export declare function useSupabase(): SupabaseClient<any, "public", "public", any, any>;
export declare function SignedIn({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function SignedOut({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function UserButton({ afterSignOutUrl, }: {
    afterSignOutUrl?: string;
    appearance?: unknown;
    showName?: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function SignInButton({ children, mode: _mode, }: {
    children?: ReactNode;
    mode?: 'modal' | 'redirect';
}): import("react/jsx-runtime").JSX.Element;
export declare function SignOutButton({ children }: {
    children?: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function forgotPassword(email: string): Promise<{
    error: string | null;
}>;
export declare function SignIn({ routing: _routing, path: _path, afterSignInUrl, redirectUrl, }: {
    routing?: string;
    path?: string;
    afterSignInUrl?: string;
    redirectUrl?: string;
    appearance?: unknown;
}): import("react/jsx-runtime").JSX.Element;
export declare function SignUp({ afterSignUpUrl, redirectUrl, }?: {
    afterSignUpUrl?: string;
    redirectUrl?: string;
    routing?: string;
    path?: string;
    appearance?: unknown;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=supabase-auth.d.ts.map
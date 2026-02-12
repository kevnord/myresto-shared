import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Mock Auth Provider for Development
 *
 * Provides a fake authentication context when VITE_AUTH_BYPASS is enabled.
 * This allows running the app without Clerk authentication for development/testing.
 */
import { createContext, useContext } from 'react';
const MockAuthCtx = createContext({
    isSignedIn: true,
    isLoaded: true,
    userId: 'dev-user',
    getToken: async () => 'mock-token',
});
const mockUser = {
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
const MockUserCtx = createContext({
    user: mockUser,
    isSignedIn: true,
    isLoaded: true,
});
export function MockAuthProvider({ children }) {
    return (_jsx(MockAuthCtx.Provider, { value: {
            isSignedIn: true,
            isLoaded: true,
            userId: 'dev-user',
            getToken: async () => 'mock-token',
        }, children: _jsx(MockUserCtx.Provider, { value: {
                user: mockUser,
                isSignedIn: true,
                isLoaded: true,
            }, children: children }) }));
}
export function useAuth() {
    return useContext(MockAuthCtx);
}
export function useUser() {
    return useContext(MockUserCtx);
}
export function UserButton() {
    return (_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium", children: "D" }));
}
export function SignOutButton({ children }) {
    return (_jsx("button", { onClick: () => console.log('[MockAuth] Sign out clicked (no-op in bypass mode)'), className: "text-sm text-gray-400 hover:text-white", children: children }));
}
export function SignIn() {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg", children: [_jsx("p", { className: "text-white mb-2", children: "\uD83D\uDEA7 Auth Bypass Mode" }), _jsx("p", { className: "text-gray-400 text-sm", children: "VITE_AUTH_BYPASS is enabled" })] }));
}
export function SignedIn({ children }) {
    return _jsx(_Fragment, { children: children });
}
export function SignedOut({ children }) {
    return null;
}
export function SignInButton({ children, mode }) {
    return (_jsx("button", { onClick: () => console.log('[MockAuth] Sign in clicked (already signed in - bypass mode)'), className: "text-sm text-gray-400 hover:text-white", children: children }));
}
//# sourceMappingURL=mockAuth.js.map
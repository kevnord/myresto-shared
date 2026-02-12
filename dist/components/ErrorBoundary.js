import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import * as Sentry from '@sentry/react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        // Log to Sentry
        Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack,
                },
            },
        });
        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default fallback UI
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4", children: _jsxs("div", { className: "max-w-md w-full text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\u26A0\uFE0F" }), _jsx("h1", { className: "text-2xl font-bold text-[var(--color-text-primary)] mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-[var(--color-text-muted)] mb-6", children: "We've been notified and will fix this as soon as possible." }), _jsx("button", { onClick: () => window.location.reload(), className: "px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity", children: "Reload Page" }), import.meta.env.DEV && this.state.error && (_jsxs("details", { className: "mt-6 text-left", children: [_jsx("summary", { className: "cursor-pointer text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-accent)]", children: "Error Details (dev only)" }), _jsxs("pre", { className: "mt-2 p-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded text-xs overflow-auto text-[var(--color-text-primary)]", children: [this.state.error.toString(), this.state.error.stack] })] }))] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map
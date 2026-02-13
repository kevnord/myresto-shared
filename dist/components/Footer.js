import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
const DEFAULT_LINKS = [
    { href: 'https://myrestoevent.com', label: 'MyRestoEvent' },
    { href: 'https://myrestoclub.com', label: 'MyRestoClub' },
    { href: 'https://myrestogarage.com', label: 'MyRestoGarage' },
];
export default function Footer({ appName, commitHash, links = DEFAULT_LINKS }) {
    return (_jsxs("footer", { className: "px-6 py-8 border-t border-[var(--color-border)] text-center", children: [_jsx("div", { className: "flex items-center justify-center gap-4 mb-4 text-sm flex-wrap", children: links.map((link, i) => (_jsxs(_Fragment, { children: [i > 0 && _jsx("span", { className: "text-[var(--color-text-subtle)]", children: "\u00B7" }, `sep-${i}`), _jsx("a", { href: link.href, className: "text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors", children: link.label }, link.href)] }))) }), _jsxs("p", { className: "text-sm text-[var(--color-text-subtle)]", children: ["\u00A9 ", new Date().getFullYear(), " ", appName, " \u00B7 Part of MyRestoLife"] }), commitHash && (_jsx("p", { className: "text-xs text-[var(--color-text-subtle)] mt-1 opacity-50", children: commitHash }))] }));
}
//# sourceMappingURL=Footer.js.map
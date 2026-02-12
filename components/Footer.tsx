/**
 * Shared footer component for MyResto apps
 * 
 * Usage:
 * ```tsx
 * import Footer from '@myresto/shared/components/Footer';
 * 
 * <Footer 
 *   appName="MyRestoEvent"
 *   commitHash={__COMMIT_HASH__}
 * />
 * ```
 */

interface FooterProps {
  /** App name (e.g., "MyRestoEvent", "MyRestoClub") */
  appName: string;
  /** Optional commit hash for build tracking */
  commitHash?: string;
  /** Optional custom links to show */
  links?: Array<{ href: string; label: string }>;
}

const DEFAULT_LINKS = [
  { href: 'https://myrestoevent.com', label: 'MyRestoEvent' },
  { href: 'https://myrestoclub.com', label: 'MyRestoClub' },
  { href: 'https://myrestogarage.com', label: 'MyRestoGarage' },
];

export default function Footer({ appName, commitHash, links = DEFAULT_LINKS }: FooterProps) {
  return (
    <footer className="px-6 py-8 border-t border-[var(--color-border)] text-center">
      <div className="flex items-center justify-center gap-4 mb-4 text-xs flex-wrap">
        {links.map((link, i) => (
          <>
            {i > 0 && <span key={`sep-${i}`} className="text-[var(--color-text-subtle)]">·</span>}
            <a 
              key={link.href}
              href={link.href} 
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              {link.label}
            </a>
          </>
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-subtle)]">
        © {new Date().getFullYear()} {appName} · Part of MyRestoLife
      </p>
      {commitHash && (
        <p className="text-[10px] text-[var(--color-text-subtle)] mt-1 opacity-50">
          {commitHash}
        </p>
      )}
    </footer>
  );
}

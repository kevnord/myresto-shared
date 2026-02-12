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
    links?: Array<{
        href: string;
        label: string;
    }>;
}
export default function Footer({ appName, commitHash, links }: FooterProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Footer.d.ts.map
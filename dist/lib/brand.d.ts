/**
 * Brand configuration factory
 *
 * Usage in your app:
 * ```ts
 * import { createBrand } from '@myresto/shared/lib/brand';
 *
 * export const brand = createBrand({
 *   name: 'Event',
 *   iconPaths: {
 *     dark: '/icons/logo-white.png',
 *     light: '/icons/logo-black.png',
 *   }
 * });
 * ```
 */
export interface BrandConfig {
    /** The colored second word (e.g., "Event", "Club", "Garage") */
    name: string;
    /** Icon paths — stored in /public/icons/ */
    iconPaths: {
        /** White version for dark backgrounds */
        dark: string;
        /** Black version for light backgrounds */
        light: string;
    };
    /** Optional icon sizes override */
    iconSizes?: {
        navbar?: number;
        sidebar?: number;
        mobile?: number;
    };
}
export interface Brand {
    /** The first part of the brand name (always "MyResto") */
    prefix: 'MyResto';
    /** The colored second word */
    name: string;
    /** Full brand name */
    full: string;
    /** Icon paths */
    icon: {
        dark: string;
        light: string;
    };
    /** Icon height in pixels for different contexts */
    iconSize: {
        navbar: number;
        sidebar: number;
        mobile: number;
    };
}
export declare function createBrand(config: BrandConfig): Brand;
//# sourceMappingURL=brand.d.ts.map
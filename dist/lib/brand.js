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
const DEFAULT_ICON_SIZES = {
    navbar: 22,
    sidebar: 20,
    mobile: 18,
};
export function createBrand(config) {
    return {
        prefix: 'MyResto',
        name: config.name,
        full: `MyResto${config.name}`,
        icon: config.iconPaths,
        iconSize: {
            ...DEFAULT_ICON_SIZES,
            ...config.iconSizes,
        },
    };
}
//# sourceMappingURL=brand.js.map
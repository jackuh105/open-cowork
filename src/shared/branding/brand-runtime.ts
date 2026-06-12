/**
 * Renderer-process branding runtime.
 *
 * Overrides the app's existing CSS custom properties with brand values.
 * Call this before React mounts so components inherit brand styles immediately.
 */

import { BRAND_CONFIG, BRAND_ID } from './__generated-brand';

/**
 * Inject brand colors by overriding the existing CSS variables
 * that the app's Tailwind theme and components already reference.
 */
export function applyRendererBranding(): void {
  // Default brand uses the built-in theme CSS variables; skip injection
  if (BRAND_ID === 'open-cowork') {
    return;
  }

  const root = document.documentElement;
  if (!root) {
    console.warn('[brand] document.documentElement not available, skipping brand injection');
    return;
  }

  const { colors, features } = BRAND_CONFIG;

  // Override the app's actual theme CSS variables so existing components pick up brand colors
  root.style.setProperty('--color-accent', colors.primary);
  root.style.setProperty('--color-accent-hover', colors.primaryHover);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-background-secondary', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-muted', colors.textSecondary);

  // Sidebar-specific override (used by Tailwind classes in Sidebar)
  root.style.setProperty('--brand-sidebar-active-bg', colors.sidebarActiveBg);
  root.style.setProperty('--brand-sidebar-active-text', colors.sidebarActiveText);

  // Feature flags as HTML data attributes for CSS selectors
  if (features.gradientTitles) {
    root.setAttribute('data-brand-gradient-titles', 'true');
  }
}

/**
 * Read the current brand config at runtime (e.g. for dynamic logo paths).
 */
export function getBrandConfig() {
  return BRAND_CONFIG;
}

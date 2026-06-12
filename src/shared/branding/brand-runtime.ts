/**
 * Renderer-process branding runtime.
 *
 * Injects a scoped <style> element that overrides CSS custom properties
 * used by the app's Tailwind theme. Brand-identity variables (accent,
 * sidebar) apply in both themes. Theme-level variables (background,
 * surface, text) only apply in light mode (:root.light) so the built-in
 * dark theme is preserved. Brands can optionally provide colorsDark for
 * dark-mode overrides.
 */

import { BRAND_CONFIG, BRAND_ID } from './__generated-brand';

export function applyRendererBranding(): void {
  // Default brand uses the built-in theme CSS variables; skip injection entirely
  if (BRAND_ID === 'open-cowork') {
    return;
  }

  const root = document.documentElement;
  if (!root) {
    console.warn('[brand] document.documentElement not available, skipping brand injection');
    return;
  }

  const { colors, colorsDark, features } = BRAND_CONFIG;
  const css: string[] = [];

  // Brand-identity vars: always active (both themes)
  const commonVars = [
    `--color-accent: ${colors.primary};`,
    `--color-accent-hover: ${colors.primaryHover};`,
    `--brand-sidebar-active-bg: ${colors.sidebarActiveBg};`,
    `--brand-sidebar-active-text: ${colors.sidebarActiveText};`,
  ];
  css.push(`:root { ${commonVars.join(' ')} }`);

  // Light-mode theme overrides (only if brand provides them)
  const lightVars: string[] = [];
  if (colors.background) {
    lightVars.push(
      `--color-background: ${colors.background};`,
      `--color-background-secondary: ${colors.background};`
    );
  }
  if (colors.surface) lightVars.push(`--color-surface: ${colors.surface};`);
  if (colors.textPrimary) lightVars.push(`--color-text-primary: ${colors.textPrimary};`);
  if (colors.textSecondary) {
    lightVars.push(
      `--color-text-secondary: ${colors.textSecondary};`,
      `--color-text-muted: ${colors.textSecondary};`
    );
  }
  if (lightVars.length > 0) {
    css.push(`:root.light { ${lightVars.join(' ')} }`);
  }

  // Dark-mode brand overrides (if colorsDark is provided)
  if (colorsDark) {
    const darkVars: string[] = [];
    if (colorsDark.background) {
      darkVars.push(
        `--color-background: ${colorsDark.background};`,
        `--color-background-secondary: ${colorsDark.background};`
      );
    }
    if (colorsDark.surface) darkVars.push(`--color-surface: ${colorsDark.surface};`);
    if (colorsDark.textPrimary) darkVars.push(`--color-text-primary: ${colorsDark.textPrimary};`);
    if (colorsDark.textSecondary) {
      darkVars.push(
        `--color-text-secondary: ${colorsDark.textSecondary};`,
        `--color-text-muted: ${colorsDark.textSecondary};`
      );
    }
    if (darkVars.length > 0) {
      css.push(`:root:not(.light) { ${darkVars.join(' ')} }`);
    }
  }

  // Inject scoped stylesheet
  const style = document.createElement('style');
  style.setAttribute('data-brand', BRAND_ID);
  style.textContent = css.join('\n');
  document.head.prepend(style);

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

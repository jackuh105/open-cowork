/**
 * Brand configuration types and emergency fallback.
 *
 * This file is the single source of truth for brand TypeScript types.
 * It also exports a hardcoded emergency fallback used when no brand config
 * is available at runtime (e.g. _default folder missing or corrupted).
 */

export interface BrandColors {
  primary: string;
  primaryHover: string;
  accent: string;
  /** Optional — overrides the light/dark theme background. Omit to keep the built-in theme. */
  background?: string;
  /** Optional — overrides the light/dark theme surface. Omit to keep the built-in theme. */
  surface?: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  /** Optional — overrides the theme text primary. Omit to keep the built-in theme. */
  textPrimary?: string;
  /** Optional — overrides the theme text secondary. Omit to keep the built-in theme. */
  textSecondary?: string;
}

export interface BrandFeatures {
  gradientTitles: boolean;
}

export interface BrandAssets {
  iconMac: string;
  iconWin: string;
  iconLinux: string;
  tray: string;
  trayMac: string;
  trayWin: string;
  logo: string;
}

/** Theme-level color overrides that a brand may provide for dark mode. */
export type BrandColorsDark = Partial<
  Pick<BrandColors, 'background' | 'surface' | 'textPrimary' | 'textSecondary'>
>;

export interface BrandConfig {
  id: string;
  productName: string;
  appId: string;
  copyright: string;
  colors: BrandColors;
  features: BrandFeatures;
  assets: BrandAssets;
  /** Optional dark-mode theme overrides. Omit to keep the built-in dark theme. */
  colorsDark?: BrandColorsDark;
}

/**
 * Emergency fallback brand used when runtime loading fails.
 * This ensures the app never crashes due to missing brand files.
 */
export const EMERGENCY_BRAND: BrandConfig = {
  id: 'open-cowork',
  productName: 'Open Cowork',
  appId: 'com.opencowork.app',
  copyright: 'Copyright © 2026 Open Cowork Team',
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    accent: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    sidebarActiveBg: '#2563EB',
    sidebarActiveText: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
  },
  features: {
    gradientTitles: false,
  },
  assets: {
    iconMac: 'icon.icns',
    iconWin: 'icon.ico',
    iconLinux: 'icon.png',
    tray: 'tray-icon.png',
    trayMac: 'tray-iconTemplate.png',
    trayWin: 'tray-icon.ico',
    logo: 'logo.png',
  },
};

/**
 * Default CSS custom property prefix.
 */
export const BRAND_CSS_PREFIX = '--brand';

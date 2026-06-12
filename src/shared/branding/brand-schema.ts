/**
 * Lightweight runtime validation for brand.json configurations.
 *
 * No external dependencies (e.g. Zod) — uses plain TypeScript type guards
 * so it works in both main and renderer without bloating bundles.
 */

import type {
  BrandConfig,
  BrandColors,
  BrandColorsDark,
  BrandFeatures,
  BrandAssets,
} from './brand-types';

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

function validateColors(obj: unknown): BrandColors {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('brand.colors must be an object');
  }
  const c = obj as Record<string, unknown>;

  // Required brand-identity colors (always validated)
  const required: (keyof BrandColors)[] = [
    'primary',
    'primaryHover',
    'accent',
    'sidebarActiveBg',
    'sidebarActiveText',
  ];
  for (const key of required) {
    if (!isHexColor(c[key])) {
      throw new Error(`brand.colors.${key} must be a valid hex color (e.g. #2563EB)`);
    }
  }

  // Optional theme-override colors (only validated if provided)
  const optional: (keyof BrandColors)[] = ['background', 'surface', 'textPrimary', 'textSecondary'];
  for (const key of optional) {
    if (c[key] !== undefined && !isHexColor(c[key])) {
      throw new Error(`brand.colors.${key} must be a valid hex color (e.g. #2563EB)`);
    }
  }

  return c as unknown as BrandColors;
}

function validateFeatures(obj: unknown): BrandFeatures {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('brand.features must be an object');
  }
  const f = obj as Record<string, unknown>;
  if (!isBoolean(f.gradientTitles)) {
    throw new Error('brand.features.gradientTitles must be a boolean');
  }
  return f as unknown as BrandFeatures;
}

function validateAssets(obj: unknown): BrandAssets {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('brand.assets must be an object');
  }
  const a = obj as Record<string, unknown>;
  const required: (keyof BrandAssets)[] = [
    'iconMac',
    'iconWin',
    'iconLinux',
    'tray',
    'trayMac',
    'trayWin',
    'logo',
  ];
  for (const key of required) {
    if (!isString(a[key])) {
      throw new Error(`brand.assets.${key} must be a non-empty string`);
    }
  }
  return a as unknown as BrandAssets;
}

function validateColorsDark(obj: unknown): BrandColorsDark | undefined {
  if (obj === undefined) return undefined;
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('brand.colorsDark must be an object');
  }
  const c = obj as Record<string, unknown>;
  const optionalKeys: (keyof BrandColorsDark)[] = [
    'background',
    'surface',
    'textPrimary',
    'textSecondary',
  ];
  for (const key of optionalKeys) {
    if (c[key] !== undefined && !isHexColor(c[key])) {
      throw new Error(`brand.colorsDark.${key} must be a valid hex color (e.g. #171614)`);
    }
  }
  return c as unknown as BrandColorsDark;
}

export function validateBrandConfig(obj: unknown): BrandConfig {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('brand.json must contain an object');
  }
  const b = obj as Record<string, unknown>;

  const stringFields: (keyof BrandConfig)[] = ['id', 'productName', 'appId', 'copyright'];
  for (const key of stringFields) {
    if (!isString(b[key])) {
      throw new Error(`brand.${key} must be a non-empty string`);
    }
  }

  return {
    id: b.id as string,
    productName: b.productName as string,
    appId: b.appId as string,
    copyright: b.copyright as string,
    colors: validateColors(b.colors),
    features: validateFeatures(b.features),
    assets: validateAssets(b.assets),
    colorsDark: validateColorsDark(b.colorsDark),
  };
}

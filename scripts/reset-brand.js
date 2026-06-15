#!/usr/bin/env node
/**
 * Reset branding changes to repository defaults.
 *
 * Restores:
 * - package.json (from .bak)
 * - electron-builder.yml (from .bak)
 * - index.html (from .bak)
 * - src/shared/branding/__generated-brand.ts (from .bak)
 * - Icon/logo assets in resources/, public/, src/renderer/assets/ (from .bak)
 * - i18n locale files in src/renderer/i18n/locales/ (from .bak)
 * - src/renderer/i18n/config.ts (from .bak)
 * - SettingsGeneral.tsx language selector (from .bak)
 * - SettingsPanel.tsx tab visibility (from .bak)
 * - src/shared/branding/brand-types.ts (from .bak)
 * - src/shared/branding/brand-schema.ts (from .bak)
 * - src/main/config/config-store.ts (from .bak)
 *
 * Removes:
 * - Newly added locale files (no .bak = didn't exist before)
 * - Backup files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');
const BUILDER_YML_PATH = path.join(PROJECT_ROOT, 'electron-builder.yml');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'index.html');
const I18N_CONFIG_PATH = path.join(PROJECT_ROOT, 'src', 'renderer', 'i18n', 'config.ts');
const I18N_LOCALES_DIR = path.join(PROJECT_ROOT, 'src', 'renderer', 'i18n', 'locales');
const I18N_MANIFEST_PATH = path.join(PROJECT_ROOT, '.brand-i18n-manifest.json');
const SETTINGS_GENERAL_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'renderer',
  'components',
  'settings',
  'SettingsGeneral.tsx'
);
const SETTINGS_PANEL_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'renderer',
  'components',
  'SettingsPanel.tsx'
);
const BRAND_TYPES_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'shared',
  'branding',
  'brand-types.ts'
);
const BRAND_SCHEMA_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'shared',
  'branding',
  'brand-schema.ts'
);
const CONFIG_STORE_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'main',
  'config',
  'config-store.ts'
);
const PLUGIN_CATALOG_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'main',
  'skills',
  'plugin-catalog-service.ts'
);
const PLUGIN_RUNTIME_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'main',
  'skills',
  'plugin-runtime-service.ts'
);
const GENERATED_BRAND_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'shared',
  'branding',
  '__generated-brand.ts'
);

const RESOURCES_DIR = path.join(PROJECT_ROOT, 'resources');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const RENDERER_ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'renderer', 'assets');

/**
 * All asset file paths that may be overwritten by apply-brand.
 */
const ASSET_PATHS = [
  path.join(RESOURCES_DIR, 'icon.icns'),
  path.join(RESOURCES_DIR, 'icon.ico'),
  path.join(RESOURCES_DIR, 'icon.png'),
  path.join(RESOURCES_DIR, 'tray-icon.png'),
  path.join(RESOURCES_DIR, 'tray-iconTemplate.png'),
  path.join(RESOURCES_DIR, 'tray-icon.ico'),
  path.join(RESOURCES_DIR, 'logo.png'),
  path.join(PUBLIC_DIR, 'logo.png'),
  path.join(RENDERER_ASSETS_DIR, 'logo.png'),
];

function restoreFile(filePath) {
  const bakPath = `${filePath}.bak`;
  if (fs.existsSync(bakPath)) {
    fs.copyFileSync(bakPath, filePath);
    fs.unlinkSync(bakPath);
    console.log(`[brand] Restored ${path.basename(filePath)}`);
  } else {
    console.log(`[brand] No backup found for ${path.basename(filePath)} (skipping)`);
  }
}

function restoreAsset(filePath) {
  const bakPath = `${filePath}.bak`;
  if (fs.existsSync(bakPath)) {
    fs.copyFileSync(bakPath, filePath);
    fs.unlinkSync(bakPath);
    console.log(`[brand] Restored asset ${path.relative(PROJECT_ROOT, filePath)}`);
  }
}

/**
 * Restore i18n locale files and config.ts.
 *
 * - Locale files with a .bak are restored from backup
 * - Locale files listed in the manifest as new are deleted
 * - config.ts is restored from .bak if it exists
 * - The manifest file itself is deleted
 */
function restoreI18n() {
  // Read manifest to know which locales were newly added by apply-brand
  let newLocales = [];
  if (fs.existsSync(I18N_MANIFEST_PATH)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(I18N_MANIFEST_PATH, 'utf-8'));
      newLocales = manifest.newLocales || [];
    } catch {
      // Ignore corrupt manifest
    }
  }

  if (fs.existsSync(I18N_LOCALES_DIR)) {
    // Delete only the locales that the manifest says were new
    for (const localeCode of newLocales) {
      const localeFile = `${localeCode}.json`;
      const localePath = path.join(I18N_LOCALES_DIR, localeFile);
      if (fs.existsSync(localePath)) {
        fs.unlinkSync(localePath);
        console.log(`[brand] Removed new locale ${localeFile} (was added by brand)`);
      }
    }

    // Restore locale files that have a .bak (overridden by brand)
    const localeFiles = fs.readdirSync(I18N_LOCALES_DIR).filter((f) => f.endsWith('.json'));
    for (const localeFile of localeFiles) {
      const localePath = path.join(I18N_LOCALES_DIR, localeFile);
      const bakPath = `${localePath}.bak`;
      if (fs.existsSync(bakPath)) {
        fs.copyFileSync(bakPath, localePath);
        fs.unlinkSync(bakPath);
        console.log(`[brand] Restored i18n locale ${localeFile}`);
      }
    }
  }

  restoreFile(I18N_CONFIG_PATH);

  // Clean up manifest
  if (fs.existsSync(I18N_MANIFEST_PATH)) {
    fs.unlinkSync(I18N_MANIFEST_PATH);
  }
}

function main() {
  console.log('[brand] Resetting to default brand...');
  restoreFile(PACKAGE_JSON_PATH);
  restoreFile(BUILDER_YML_PATH);
  restoreFile(INDEX_HTML_PATH);
  restoreFile(GENERATED_BRAND_PATH);

  // Restore icon/logo assets
  for (const assetPath of ASSET_PATHS) {
    restoreAsset(assetPath);
  }

  // Restore i18n locale files and config.ts
  restoreI18n();

  // Restore SettingsGeneral.tsx language selector
  restoreFile(SETTINGS_GENERAL_PATH);

  // Restore SettingsPanel.tsx tab visibility
  restoreFile(SETTINGS_PANEL_PATH);

  // Restore brand type system files
  restoreFile(BRAND_TYPES_PATH);
  restoreFile(BRAND_SCHEMA_PATH);

  // Restore config-store.ts (defaultApi patching)
  restoreFile(CONFIG_STORE_PATH);

  // Restore plugin catalog and runtime services (skillhub patching)
  restoreFile(PLUGIN_CATALOG_PATH);
  restoreFile(PLUGIN_RUNTIME_PATH);

  console.log('[brand] Reset complete.');
}

main();

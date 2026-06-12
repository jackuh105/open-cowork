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
 *
 * Removes:
 * - Backup files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');
const BUILDER_YML_PATH = path.join(PROJECT_ROOT, 'electron-builder.yml');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'index.html');
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

  console.log('[brand] Reset complete.');
}

main();

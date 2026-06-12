#!/usr/bin/env node
/**
 * Apply a brand configuration to the project before building.
 *
 * Usage:
 *   node scripts/apply-brand.js <brand-id>
 *
 * This script:
 * 1. Reads brands/<brand-id>/brand.json
 * 2. Validates required fields
 * 3. Backs up package.json and electron-builder.yml
 * 4. Patches package.json productName
 * 5. Patches electron-builder.yml (productName, appId, copyright, output dir, DMG app name)
 * 6. Copies brand assets to resources/
 * 7. Generates src/shared/branding/__generated-brand.ts
 *
 * Exit codes:
 *   0 = success
 *   1 = validation or I/O error
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BRANDS_DIR = path.join(PROJECT_ROOT, 'brands');
const RESOURCES_DIR = path.join(PROJECT_ROOT, 'resources');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const RENDERER_ASSETS_DIR = path.join(PROJECT_ROOT, 'src', 'renderer', 'assets');
const SHARED_BRANDING_DIR = path.join(PROJECT_ROOT, 'src', 'shared', 'branding');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');
const BUILDER_YML_PATH = path.join(PROJECT_ROOT, 'electron-builder.yml');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'index.html');

const GENERATED_BRAND_PATH = path.join(SHARED_BRANDING_DIR, '__generated-brand.ts');
const GENERATED_BRAND_BAK = `${GENERATED_BRAND_PATH}.bak`;
const PACKAGE_JSON_BAK = `${PACKAGE_JSON_PATH}.bak`;
const BUILDER_YML_BAK = `${BUILDER_YML_PATH}.bak`;
const INDEX_HTML_BAK = `${INDEX_HTML_PATH}.bak`;

/**
 * Simple hex color validator.
 */
function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

/**
 * Validate brand.json shape. Throws on error.
 */
function validateBrand(config) {
  if (typeof config !== 'object' || config === null) {
    throw new Error('brand.json must contain an object');
  }

  const stringFields = ['id', 'productName', 'appId', 'copyright'];
  for (const key of stringFields) {
    if (typeof config[key] !== 'string' || config[key].length === 0) {
      throw new Error(`brand.${key} must be a non-empty string`);
    }
  }

  if (typeof config.colors !== 'object' || config.colors === null) {
    throw new Error('brand.colors must be an object');
  }

  // Required brand-identity color keys
  const requiredColorKeys = [
    'primary',
    'primaryHover',
    'accent',
    'sidebarActiveBg',
    'sidebarActiveText',
  ];
  for (const key of requiredColorKeys) {
    if (!isHexColor(config.colors[key])) {
      throw new Error(`brand.colors.${key} must be a valid hex color (e.g. #2563EB)`);
    }
  }

  // Optional theme-override color keys (only validated if provided)
  const optionalColorKeys = ['background', 'surface', 'textPrimary', 'textSecondary'];
  for (const key of optionalColorKeys) {
    if (config.colors[key] !== undefined && !isHexColor(config.colors[key])) {
      throw new Error(`brand.colors.${key} must be a valid hex color (e.g. #2563EB)`);
    }
  }

  // Optional colorsDark section (only validated if provided)
  if (config.colorsDark !== undefined) {
    if (typeof config.colorsDark !== 'object' || config.colorsDark === null) {
      throw new Error('brand.colorsDark must be an object');
    }
    const darkKeys = ['background', 'surface', 'textPrimary', 'textSecondary'];
    for (const key of darkKeys) {
      if (config.colorsDark[key] !== undefined && !isHexColor(config.colorsDark[key])) {
        throw new Error(`brand.colorsDark.${key} must be a valid hex color (e.g. #171614)`);
      }
    }
  }

  if (typeof config.features !== 'object' || config.features === null) {
    throw new Error('brand.features must be an object');
  }
  if (typeof config.features.gradientTitles !== 'boolean') {
    throw new Error('brand.features.gradientTitles must be a boolean');
  }

  if (typeof config.assets !== 'object' || config.assets === null) {
    throw new Error('brand.assets must be an object');
  }
  const assetKeys = ['iconMac', 'iconWin', 'iconLinux', 'tray', 'trayMac', 'trayWin', 'logo'];
  for (const key of assetKeys) {
    if (typeof config.assets[key] !== 'string' || config.assets[key].length === 0) {
      throw new Error(`brand.assets.${key} must be a non-empty string`);
    }
  }

  return config;
}

/**
 * Backup a file if a backup doesn't already exist.
 */
function backupFile(filePath) {
  const bakPath = `${filePath}.bak`;
  if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(filePath, bakPath);
    console.log(`[brand] Backed up ${path.basename(filePath)}`);
  }
}

/**
 * Backup an asset file (binary) if a backup doesn't already exist.
 */
function backupAsset(filePath) {
  const bakPath = `${filePath}.bak`;
  if (!fs.existsSync(bakPath)) {
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, bakPath);
      console.log(`[brand] Backed up asset ${path.relative(PROJECT_ROOT, filePath)}`);
    }
  }
}

/**
 * Generate the TypeScript brand constants file.
 */
function generateBrandTs(config) {
  // Strip $schema from runtime config — it's a JSON metadata field, not a runtime property
  const { $schema: _omit, ...runtimeConfig } = config;
  const content = `// AUTO-GENERATED by scripts/apply-brand.js
// Do not edit manually. Run \`npm run brand:apply <brand-id>\` to regenerate.

import type { BrandConfig } from './brand-types';

export const BRAND_CONFIG: BrandConfig = ${JSON.stringify(runtimeConfig, null, 2)};

export const BRAND_ID = BRAND_CONFIG.id;
export const BRAND_NAME = BRAND_CONFIG.productName;
export const BRAND_APP_ID = BRAND_CONFIG.appId;
export const BRAND_COPYRIGHT = BRAND_CONFIG.copyright;
`;

  const outPath = path.join(SHARED_BRANDING_DIR, '__generated-brand.ts');
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log(`[brand] Generated ${path.relative(PROJECT_ROOT, outPath)}`);
}

/**
 * Patch package.json with brand values.
 */
function patchPackageJson(config) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  pkg.productName = config.productName;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log(`[brand] Patched package.json productName → "${config.productName}"`);
}

/**
 * Patch index.html title tag.
 */
function patchIndexHtml(config) {
  let html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
  html = html.replace(/<title>.*?<\/title>/, `<title>${config.productName}</title>`);
  fs.writeFileSync(INDEX_HTML_PATH, html, 'utf-8');
  console.log(`[brand] Patched index.html title → "${config.productName}"`);
}

/**
 * Patch electron-builder.yml with brand values.
 */
function patchBuilderYml(config) {
  let yml = fs.readFileSync(BUILDER_YML_PATH, 'utf-8');

  // productName
  yml = yml.replace(/^productName: .*/m, `productName: ${config.productName}`);

  // appId
  yml = yml.replace(/^appId: .*/m, `appId: ${config.appId}`);

  // copyright
  yml = yml.replace(/^copyright: .*/m, `copyright: ${config.copyright}`);

  // output directory
  yml = yml.replace(
    /^(directories:\s*\n\s+output: ).*/m,
    `directories:\n  output: release/${config.id}`
  );

  // DMG app name
  const dmgAppName = `${config.productName}.app`;
  yml = yml.replace(/^      name: '.*\.app'$/m, `      name: '${dmgAppName}'`);

  fs.writeFileSync(BUILDER_YML_PATH, yml, 'utf-8');
  console.log(`[brand] Patched electron-builder.yml`);
  console.log(`[brand] Output directory → release/${config.id}`);
}

/**
 * Copy brand assets to resources/, public/, and renderer assets/ if they exist.
 */
function copyBrandAssets(config, brandDir) {
  const assetMap = {
    [config.assets.iconMac]: 'icon.icns',
    [config.assets.iconWin]: 'icon.ico',
    [config.assets.iconLinux]: 'icon.png',
    [config.assets.tray]: 'tray-icon.png',
    [config.assets.trayMac]: 'tray-iconTemplate.png',
    [config.assets.trayWin]: 'tray-icon.ico',
    [config.assets.logo]: 'logo.png',
  };

  for (const [sourceName, destName] of Object.entries(assetMap)) {
    const src = path.join(brandDir, sourceName);
    const destResources = path.join(RESOURCES_DIR, destName);
    if (fs.existsSync(src)) {
      backupAsset(destResources);
      fs.copyFileSync(src, destResources);
      console.log(`[brand] Copied asset ${sourceName} → resources/${destName}`);
    } else {
      console.log(`[brand] Asset not found: ${sourceName} (skipping, existing resource preserved)`);
    }
  }

  // Copy logo to public/ and renderer/assets/ so the UI can reference it
  const logoSrc = path.join(brandDir, config.assets.logo);
  if (fs.existsSync(logoSrc)) {
    const destPublic = path.join(PUBLIC_DIR, 'logo.png');
    const destRenderer = path.join(RENDERER_ASSETS_DIR, 'logo.png');
    backupAsset(destPublic);
    backupAsset(destRenderer);
    fs.copyFileSync(logoSrc, destPublic);
    fs.copyFileSync(logoSrc, destRenderer);
    console.log(`[brand] Copied logo → public/logo.png and src/renderer/assets/logo.png`);
  }
}

/**
 * Main entry point.
 */
function main() {
  const brandId = process.argv[2];

  if (!brandId) {
    console.error('Usage: node scripts/apply-brand.js <brand-id>');
    console.error('');
    console.error('Available brands:');
    if (fs.existsSync(BRANDS_DIR)) {
      fs.readdirSync(BRANDS_DIR)
        .filter((d) => fs.statSync(path.join(BRANDS_DIR, d)).isDirectory())
        .forEach((d) => console.error(`  - ${d}`));
    }
    process.exit(1);
  }

  const brandDir = path.join(BRANDS_DIR, brandId);
  const brandJsonPath = path.join(brandDir, 'brand.json');

  if (!fs.existsSync(brandJsonPath)) {
    console.error(`[brand] ERROR: Brand config not found: ${brandJsonPath}`);
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(brandJsonPath, 'utf-8'));
  } catch (err) {
    console.error(`[brand] ERROR: Failed to parse brand.json: ${err.message}`);
    process.exit(1);
  }

  try {
    validateBrand(config);
  } catch (err) {
    console.error(`[brand] ERROR: Invalid brand.json: ${err.message}`);
    process.exit(1);
  }

  console.log(`[brand] Applying brand: ${config.productName} (${config.id})`);

  // Backups
  backupFile(PACKAGE_JSON_PATH);
  backupFile(BUILDER_YML_PATH);
  backupFile(INDEX_HTML_PATH);
  backupFile(GENERATED_BRAND_PATH);

  // Patches
  patchPackageJson(config);
  patchBuilderYml(config);
  patchIndexHtml(config);
  generateBrandTs(config);
  copyBrandAssets(config, brandDir);

  console.log(`[brand] Brand "${config.productName}" applied successfully.`);
}

main();

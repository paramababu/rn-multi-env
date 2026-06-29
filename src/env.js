const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('./logger');

async function createEnvFile({ paths, flavorName }) {
  const envPath = path.join(paths.root, `.env.${flavorName}`);
  if (await fs.pathExists(envPath)) return;

  const templatePath = path.join(paths.templates, 'env.example');
  let content =
    `# Environment config for ${flavorName}\n` +
    `API_URL=https://api.${flavorName}.example.com\n` +
    `APP_ENV=${flavorName.toUpperCase()}\n`;

  if (await fs.pathExists(templatePath)) {
    content = (await fs.readFile(templatePath, 'utf8')).replace(/YOUR_FLAVOR/g, flavorName);
  }

  await fs.writeFile(envPath, content);
  logger.note(`🧪 Created .env.${flavorName}`);
}

// `run` is injectable so tests can assert on the chosen install command without
// actually shelling out to a package manager.
async function ensureReactNativeConfig({ paths, run = execSync } = {}) {
  const appTsx = path.join(paths.root, 'App.tsx');
  const appJs = path.join(paths.root, 'App.js');
  const appPath = (await fs.pathExists(appTsx)) ? appTsx : appJs;

  if (!(await fs.pathExists(appPath))) return;

  const appContent = await fs.readFile(appPath, 'utf8');
  if (appContent.includes('react-native-config')) return;

  // RN App.js/App.tsx are ES modules, so add an idiomatic import placed after
  // the existing import block rather than a bare require pinned to the top.
  const importLine = "import Config from 'react-native-config';";
  const lastImport = [...appContent.matchAll(/^import[^\n]*$/gm)].pop();
  const updated = lastImport
    ? appContent.slice(0, lastImport.index + lastImport[0].length) +
      `\n${importLine}` +
      appContent.slice(lastImport.index + lastImport[0].length)
    : `${importLine}\n\n${appContent}`;

  await fs.writeFile(appPath, updated);
  logger.success(`✅ Injected react-native-config import into ${path.basename(appPath)}`);

  try {
    run('npm list react-native-config', { stdio: 'ignore' });
    logger.success('✅ react-native-config is already installed.');
    return;
  } catch {
    logger.warn('📦 Installing react-native-config...');
  }

  try {
    const hasYarn = await fs.pathExists(path.join(paths.root, 'yarn.lock'));
    const hasPnpm = await fs.pathExists(path.join(paths.root, 'pnpm-lock.yaml'));
    const cmd = hasYarn
      ? 'yarn add react-native-config'
      : hasPnpm
        ? 'pnpm add react-native-config'
        : 'npm install react-native-config';
    logger.info(`🔧 Used: ${cmd}`);
    run(cmd, { stdio: 'inherit' });
    logger.success('✅ Successfully installed react-native-config.');
  } catch {
    logger.error('❌ Failed to install react-native-config. Please install it manually.');
  }
}

async function removeEnvFile({ paths, flavorName, dryRun }) {
  const envPath = path.join(paths.root, `.env.${flavorName}`);
  if (!(await fs.pathExists(envPath))) return;

  if (dryRun) {
    logger.note(`[DRY RUN] Would remove .env.${flavorName}`);
  } else {
    await fs.remove(envPath);
    logger.warn(`🧹 Removed .env.${flavorName}`);
  }
}

module.exports = { createEnvFile, ensureReactNativeConfig, removeEnvFile };

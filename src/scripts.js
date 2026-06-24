const fs = require('fs-extra');
const logger = require('./logger');
const { capitalize, readJsonSafe } = require('./utils');

const scriptNameFor = (flavorName) => `android-${flavorName}`;

async function addRunScript({ paths, flavorName }) {
  if (!(await fs.pathExists(paths.packageJson))) return;

  const pkg = await readJsonSafe(paths.packageJson);
  const name = scriptNameFor(flavorName);
  const command = `cd android && ./gradlew install${capitalize(flavorName)}Debug`;

  pkg.scripts = pkg.scripts || {};
  if (pkg.scripts[name]) {
    logger.warn(`⚠️  Script "${name}" already exists in package.json`);
    return;
  }

  pkg.scripts[name] = command;
  await fs.writeJson(paths.packageJson, pkg, { spaces: 2 });
  logger.success(`✅ Added script: "${name}": "${command}"`);
}

async function removeRunScript({ paths, flavorName, dryRun }) {
  if (!(await fs.pathExists(paths.packageJson))) return;

  const pkg = await readJsonSafe(paths.packageJson);
  const name = scriptNameFor(flavorName);
  if (!pkg.scripts || !pkg.scripts[name]) return;

  if (dryRun) {
    logger.note(`[DRY RUN] Would remove script: ${name}`);
    return;
  }

  delete pkg.scripts[name];
  await fs.writeJson(paths.packageJson, pkg, { spaces: 2 });
  logger.warn(`🧹 Removed script: ${name}`);
}

module.exports = { addRunScript, removeRunScript, scriptNameFor };

const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');
const { getPaths } = require('./paths');
const { createAndroidFlavor, removeAndroidFlavor } = require('./android');
const { createIosFiles, removeIosFiles } = require('./ios');
const { createEnvFile, ensureReactNativeConfig, removeEnvFile } = require('./env');
const { addRunScript, removeRunScript } = require('./scripts');

// Orchestrates the per-platform generators. Returns true when the flavor was
// created, false when it already existed.
async function createFlavor({ flavorName, packageName, appName, root = process.cwd() }) {
  const paths = getPaths(root);
  const flavorDir = path.join(paths.androidSrc, flavorName);

  if (await fs.pathExists(flavorDir)) {
    logger.error(`Flavor '${flavorName}' already exists.`);
    return false;
  }

  await createAndroidFlavor({ paths, flavorName, packageName, appName });
  await createIosFiles({ paths, flavorName, packageName, appName });
  await createEnvFile({ paths, flavorName });
  await ensureReactNativeConfig({ paths });
  await addRunScript({ paths, flavorName });

  logger.success(`✅ Flavor '${flavorName}' created successfully!`);
  return true;
}

async function removeFlavor({ flavorName, dryRun = false, root = process.cwd() }) {
  const paths = getPaths(root);

  await removeAndroidFlavor({ paths, flavorName, dryRun });
  await removeEnvFile({ paths, flavorName, dryRun });
  await removeIosFiles({ paths, flavorName, dryRun });
  await removeRunScript({ paths, flavorName, dryRun });

  if (!dryRun) {
    logger.success(`✅ Flavor '${flavorName}' removed.`);
  }
}

module.exports = { createFlavor, removeFlavor };

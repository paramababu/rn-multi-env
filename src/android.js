const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');
const { injectFlavor, removeFlavorBlock } = require('./gradle');

const manifestXml = () => `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application android:label="@string/app_name">
        <!-- Additional config if needed -->
    </application>

</manifest>`;

const stringsXml = (appName) => `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
</resources>`;

async function createAndroidFlavor({ paths, flavorName, packageName, appName }) {
  const flavorDir = path.join(paths.androidSrc, flavorName);
  const resDir = path.join(flavorDir, 'res', 'values');

  await fs.ensureDir(resDir);
  await fs.writeFile(path.join(flavorDir, 'AndroidManifest.xml'), manifestXml());
  await fs.writeFile(path.join(resDir, 'strings.xml'), stringsXml(appName || flavorName));

  await updateBuildGradle({ paths, flavorName, packageName, appName });
}

async function updateBuildGradle({ paths, flavorName, packageName, appName }) {
  if (!(await fs.pathExists(paths.buildGradle))) {
    logger.warn('⚠️  build.gradle not found. Skipping flavor injection.');
    return;
  }

  const content = await fs.readFile(paths.buildGradle, 'utf8');
  const result = injectFlavor(content, { flavorName, packageName, appName });

  if (!result.changed) {
    if (result.reason === 'exists') {
      logger.warn(`⚠️  Flavor '${flavorName}' already present in build.gradle.`);
    } else {
      logger.warn('⚠️  Could not locate productFlavors/defaultConfig in build.gradle. Skipping flavor injection.');
    }
    return;
  }

  await fs.writeFile(paths.buildGradle, result.content);
  logger.info(`🛠️  Updated build.gradle with '${flavorName}' flavor.`);
}

async function removeAndroidFlavor({ paths, flavorName, dryRun }) {
  const flavorDir = path.join(paths.androidSrc, flavorName);
  if (await fs.pathExists(flavorDir)) {
    if (dryRun) {
      logger.note(`[DRY RUN] Would remove Android src for '${flavorName}'`);
    } else {
      await fs.remove(flavorDir);
      logger.warn(`🧹 Removed Android src for '${flavorName}'`);
    }
  }

  if (await fs.pathExists(paths.buildGradle)) {
    const content = await fs.readFile(paths.buildGradle, 'utf8');
    const { content: updated, changed } = removeFlavorBlock(content, flavorName);
    if (changed) {
      if (dryRun) {
        logger.note(`[DRY RUN] Would remove flavor '${flavorName}' from build.gradle`);
      } else {
        await fs.writeFile(paths.buildGradle, updated);
        logger.warn(`🧹 Removed flavor '${flavorName}' from build.gradle`);
      }
    }
  }
}

module.exports = { createAndroidFlavor, updateBuildGradle, removeAndroidFlavor, manifestXml, stringsXml };

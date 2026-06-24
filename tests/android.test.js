const fs = require('fs-extra');
const path = require('path');
const { getPaths } = require('../src/paths');
const { createAndroidFlavor, removeAndroidFlavor } = require('../src/android');
const { makeTempProject, BASE_GRADLE } = require('./helpers');

describe('createAndroidFlavor', () => {
  test('writes manifest + strings and updates build.gradle', async () => {
    const root = await makeTempProject({ 'android/app/build.gradle': BASE_GRADLE });
    const paths = getPaths(root);

    await createAndroidFlavor({
      paths,
      flavorName: 'staging',
      packageName: 'com.demo.staging',
      appName: 'Demo Staging',
    });

    expect(await fs.pathExists(path.join(root, 'android/app/src/staging/AndroidManifest.xml'))).toBe(true);
    const strings = await fs.readFile(path.join(root, 'android/app/src/staging/res/values/strings.xml'), 'utf8');
    expect(strings).toContain('Demo Staging');
    const gradle = await fs.readFile(paths.buildGradle, 'utf8');
    expect(gradle).toContain('applicationId "com.demo.staging"');

    await fs.remove(root);
  });

  test('handles a missing build.gradle gracefully', async () => {
    const root = await makeTempProject({});
    const paths = getPaths(root);
    await expect(createAndroidFlavor({ paths, flavorName: 'staging' })).resolves.toBeUndefined();
    await fs.remove(root);
  });
});

describe('removeAndroidFlavor', () => {
  test('removes the src dir and gradle block', async () => {
    const root = await makeTempProject({ 'android/app/build.gradle': BASE_GRADLE });
    const paths = getPaths(root);
    await createAndroidFlavor({ paths, flavorName: 'staging' });

    await removeAndroidFlavor({ paths, flavorName: 'staging', dryRun: false });

    expect(await fs.pathExists(path.join(root, 'android/app/src/staging'))).toBe(false);
    const gradle = await fs.readFile(paths.buildGradle, 'utf8');
    expect(gradle).not.toMatch(/\bstaging\s*{/);

    await fs.remove(root);
  });

  test('dry-run does not change anything', async () => {
    const root = await makeTempProject({ 'android/app/build.gradle': BASE_GRADLE });
    const paths = getPaths(root);
    await createAndroidFlavor({ paths, flavorName: 'staging' });
    const before = await fs.readFile(paths.buildGradle, 'utf8');

    await removeAndroidFlavor({ paths, flavorName: 'staging', dryRun: true });

    expect(await fs.readFile(paths.buildGradle, 'utf8')).toBe(before);
    expect(await fs.pathExists(path.join(root, 'android/app/src/staging'))).toBe(true);

    await fs.remove(root);
  });
});

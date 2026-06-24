const fs = require('fs-extra');
const path = require('path');
const { createFlavor, removeFlavor } = require('../src/flavor');
const { makeTempProject, BASE_GRADLE } = require('./helpers');

const seed = () =>
  makeTempProject({
    'android/app/build.gradle': BASE_GRADLE,
    'ios/.keep': '',
    'package.json': JSON.stringify({ name: 'demo' }),
  });

describe('createFlavor', () => {
  test('scaffolds android, ios, env and run script', async () => {
    const root = await seed();
    const ok = await createFlavor({
      flavorName: 'staging',
      packageName: 'com.demo.staging',
      appName: 'Demo Staging',
      root,
    });

    expect(ok).toBe(true);
    expect(await fs.pathExists(path.join(root, 'android/app/src/staging/AndroidManifest.xml'))).toBe(true);
    expect(await fs.pathExists(path.join(root, 'ios/config/Staging.xcconfig'))).toBe(true);
    expect(await fs.pathExists(path.join(root, '.env.staging'))).toBe(true);
    const pkg = await fs.readJson(path.join(root, 'package.json'));
    expect(pkg.scripts['android-staging']).toBeDefined();

    await fs.remove(root);
  });

  test('refuses to recreate an existing flavor', async () => {
    const root = await seed();
    await createFlavor({ flavorName: 'staging', root });
    const ok = await createFlavor({ flavorName: 'staging', root });
    expect(ok).toBe(false);
    await fs.remove(root);
  });
});

describe('removeFlavor', () => {
  test('cleans up everything it created', async () => {
    const root = await seed();
    await createFlavor({ flavorName: 'staging', root });

    await removeFlavor({ flavorName: 'staging', root, dryRun: false });

    expect(await fs.pathExists(path.join(root, 'android/app/src/staging'))).toBe(false);
    expect(await fs.pathExists(path.join(root, '.env.staging'))).toBe(false);
    expect(await fs.pathExists(path.join(root, 'ios/config/Staging.xcconfig'))).toBe(false);
    const pkg = await fs.readJson(path.join(root, 'package.json'));
    expect(pkg.scripts['android-staging']).toBeUndefined();

    await fs.remove(root);
  });

  test('dry-run reports without changing the project', async () => {
    const root = await seed();
    await createFlavor({ flavorName: 'staging', root });

    await removeFlavor({ flavorName: 'staging', root, dryRun: true });

    expect(await fs.pathExists(path.join(root, 'android/app/src/staging'))).toBe(true);
    expect(await fs.pathExists(path.join(root, '.env.staging'))).toBe(true);
    await fs.remove(root);
  });
});

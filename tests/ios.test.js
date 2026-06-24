const fs = require('fs-extra');
const path = require('path');
const { getPaths } = require('../src/paths');
const { createIosFiles, removeIosFiles } = require('../src/ios');
const { makeTempProject } = require('./helpers');

describe('createIosFiles', () => {
  test('creates a valid plist and an xcconfig', async () => {
    const root = await makeTempProject({ 'ios/.keep': '' });
    const paths = getPaths(root);

    await createIosFiles({
      paths,
      flavorName: 'staging',
      packageName: 'com.demo.staging',
      appName: 'Demo Staging',
    });

    const xc = await fs.readFile(path.join(root, 'ios/config/Staging.xcconfig'), 'utf8');
    expect(xc).toContain('ENVFILE = .env.staging');
    expect(xc).toContain('PRODUCT_BUNDLE_IDENTIFIER = com.demo.staging');
    expect(xc).toContain('DISPLAY_NAME = Demo Staging');

    const plist = await fs.readFile(path.join(root, 'ios/GoogleService-Info-staging.plist'), 'utf8');
    expect(plist).toContain('<plist version="1.0">');

    await fs.remove(root);
  });

  test('comments out the bundle id when no package is given', async () => {
    const root = await makeTempProject({ 'ios/.keep': '' });
    const paths = getPaths(root);
    await createIosFiles({ paths, flavorName: 'staging' });
    const xc = await fs.readFile(path.join(root, 'ios/config/Staging.xcconfig'), 'utf8');
    expect(xc).toContain('// PRODUCT_BUNDLE_IDENTIFIER');
    await fs.remove(root);
  });

  test('skips when there is no ios folder', async () => {
    const root = await makeTempProject({});
    const paths = getPaths(root);
    await createIosFiles({ paths, flavorName: 'staging' });
    expect(await fs.pathExists(path.join(root, 'ios'))).toBe(false);
    await fs.remove(root);
  });
});

describe('removeIosFiles', () => {
  test('removes plist and xcconfig', async () => {
    const root = await makeTempProject({ 'ios/.keep': '' });
    const paths = getPaths(root);
    await createIosFiles({ paths, flavorName: 'staging' });

    await removeIosFiles({ paths, flavorName: 'staging', dryRun: false });

    expect(await fs.pathExists(path.join(root, 'ios/config/Staging.xcconfig'))).toBe(false);
    expect(await fs.pathExists(path.join(root, 'ios/GoogleService-Info-staging.plist'))).toBe(false);
    await fs.remove(root);
  });
});

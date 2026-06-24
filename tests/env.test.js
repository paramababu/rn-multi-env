const fs = require('fs-extra');
const path = require('path');
const { getPaths } = require('../src/paths');
const { createEnvFile, removeEnvFile, ensureReactNativeConfig } = require('../src/env');
const { makeTempProject } = require('./helpers');

describe('createEnvFile', () => {
  test('uses the repo template and replaces YOUR_FLAVOR', async () => {
    const root = await makeTempProject({});
    const paths = getPaths(root); // real templates/env.example
    await createEnvFile({ paths, flavorName: 'staging' });
    const env = await fs.readFile(path.join(root, '.env.staging'), 'utf8');
    expect(env).not.toContain('YOUR_FLAVOR');
    expect(env).toContain('staging');
    await fs.remove(root);
  });

  test('falls back to generated content when no template exists', async () => {
    const root = await makeTempProject({});
    const paths = { ...getPaths(root), templates: path.join(root, 'no-templates') };
    await createEnvFile({ paths, flavorName: 'staging' });
    const env = await fs.readFile(path.join(root, '.env.staging'), 'utf8');
    expect(env).toContain('APP_ENV=STAGING');
    await fs.remove(root);
  });

  test('does not overwrite an existing env file', async () => {
    const root = await makeTempProject({ '.env.staging': 'KEEP=1' });
    const paths = getPaths(root);
    await createEnvFile({ paths, flavorName: 'staging' });
    expect(await fs.readFile(path.join(root, '.env.staging'), 'utf8')).toBe('KEEP=1');
    await fs.remove(root);
  });
});

describe('ensureReactNativeConfig', () => {
  test('injects the import and picks yarn when yarn.lock exists', async () => {
    const root = await makeTempProject({ 'App.js': 'export default 1;\n', 'yarn.lock': '' });
    const paths = getPaths(root);
    const calls = [];
    const run = (cmd) => {
      calls.push(cmd);
      if (cmd.includes('npm list')) throw new Error('not installed');
    };

    await ensureReactNativeConfig({ paths, run });

    const app = await fs.readFile(path.join(root, 'App.js'), 'utf8');
    expect(app).toContain("require('react-native-config')");
    expect(calls).toContain('yarn add react-native-config');
    await fs.remove(root);
  });

  test('does nothing when there is no App file', async () => {
    const root = await makeTempProject({});
    const paths = getPaths(root);
    let called = false;
    await ensureReactNativeConfig({ paths, run: () => { called = true; } });
    expect(called).toBe(false);
    await fs.remove(root);
  });

  test('does not duplicate the import', async () => {
    const root = await makeTempProject({ 'App.tsx': "require('react-native-config');\nexport default 1;\n" });
    const paths = getPaths(root);
    let called = false;
    await ensureReactNativeConfig({ paths, run: () => { called = true; } });
    expect(called).toBe(false);
    await fs.remove(root);
  });
});

describe('removeEnvFile', () => {
  test('removes the env file', async () => {
    const root = await makeTempProject({ '.env.staging': 'X=1' });
    const paths = getPaths(root);
    await removeEnvFile({ paths, flavorName: 'staging', dryRun: false });
    expect(await fs.pathExists(path.join(root, '.env.staging'))).toBe(false);
    await fs.remove(root);
  });

  test('dry-run keeps the file', async () => {
    const root = await makeTempProject({ '.env.staging': 'X=1' });
    const paths = getPaths(root);
    await removeEnvFile({ paths, flavorName: 'staging', dryRun: true });
    expect(await fs.pathExists(path.join(root, '.env.staging'))).toBe(true);
    await fs.remove(root);
  });
});

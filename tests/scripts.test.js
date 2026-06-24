const fs = require('fs-extra');
const { getPaths } = require('../src/paths');
const { addRunScript, removeRunScript } = require('../src/scripts');
const { makeTempProject } = require('./helpers');

describe('addRunScript', () => {
  test('adds the gradle install script', async () => {
    const root = await makeTempProject({ 'package.json': JSON.stringify({ name: 'demo' }) });
    const paths = getPaths(root);
    await addRunScript({ paths, flavorName: 'staging' });
    const pkg = await fs.readJson(paths.packageJson);
    expect(pkg.scripts['android-staging']).toBe('cd android && ./gradlew installStagingDebug');
    await fs.remove(root);
  });

  test('does not overwrite an existing script', async () => {
    const root = await makeTempProject({
      'package.json': JSON.stringify({ scripts: { 'android-staging': 'custom' } }),
    });
    const paths = getPaths(root);
    await addRunScript({ paths, flavorName: 'staging' });
    const pkg = await fs.readJson(paths.packageJson);
    expect(pkg.scripts['android-staging']).toBe('custom');
    await fs.remove(root);
  });

  test('throws a clear error on malformed package.json', async () => {
    const root = await makeTempProject({ 'package.json': '{ not valid json' });
    const paths = getPaths(root);
    await expect(addRunScript({ paths, flavorName: 'staging' })).rejects.toThrow(/Failed to read JSON/);
    await fs.remove(root);
  });
});

describe('removeRunScript', () => {
  test('deletes the script', async () => {
    const root = await makeTempProject({
      'package.json': JSON.stringify({ scripts: { 'android-staging': 'x', start: 'y' } }),
    });
    const paths = getPaths(root);
    await removeRunScript({ paths, flavorName: 'staging', dryRun: false });
    const pkg = await fs.readJson(paths.packageJson);
    expect(pkg.scripts['android-staging']).toBeUndefined();
    expect(pkg.scripts.start).toBe('y');
    await fs.remove(root);
  });

  test('dry-run leaves the script in place', async () => {
    const root = await makeTempProject({
      'package.json': JSON.stringify({ scripts: { 'android-staging': 'x' } }),
    });
    const paths = getPaths(root);
    await removeRunScript({ paths, flavorName: 'staging', dryRun: true });
    const pkg = await fs.readJson(paths.packageJson);
    expect(pkg.scripts['android-staging']).toBe('x');
    await fs.remove(root);
  });
});

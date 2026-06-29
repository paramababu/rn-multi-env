const { injectFlavor, removeFlavorBlock, findBlockEnd } = require('../src/gradle');
const { BASE_GRADLE } = require('./helpers');

describe('findBlockEnd', () => {
  test('handles nested braces', () => {
    const s = 'x { a { } b { } }';
    const open = s.indexOf('{');
    expect(s.slice(open, findBlockEnd(s, open))).toBe('{ a { } b { } }');
  });
});

describe('injectFlavor', () => {
  test('creates productFlavors when absent and keeps defaultConfig indentation', () => {
    const { content, changed } = injectFlavor(BASE_GRADLE, {
      flavorName: 'staging',
      packageName: 'com.demo.staging',
      appName: 'Demo Staging',
    });
    expect(changed).toBe(true);
    expect(content).toContain('flavorDimensions "default"');
    expect(content).toContain('productFlavors {');
    expect(content).toContain('staging {');
    expect(content).toContain('applicationId "com.demo.staging"');
    expect(content).toContain('    defaultConfig {');
  });

  test('falls back to applicationIdSuffix without a package', () => {
    const { content } = injectFlavor(BASE_GRADLE, { flavorName: 'staging' });
    expect(content).toContain('applicationIdSuffix ".staging"');
  });

  test('appends a second flavor at the correct indentation', () => {
    const first = injectFlavor(BASE_GRADLE, { flavorName: 'staging' }).content;
    const { content, changed } = injectFlavor(first, {
      flavorName: 'prod',
      packageName: 'com.demo.prod',
    });
    expect(changed).toBe(true);
    expect(content).toContain('        prod {');
    expect(content).not.toContain('            prod {'); // no over-indentation
    expect(content).toContain('        staging {');
  });

  test('does not duplicate an existing flavor', () => {
    const first = injectFlavor(BASE_GRADLE, { flavorName: 'staging' }).content;
    const { changed, reason } = injectFlavor(first, { flavorName: 'staging' });
    expect(changed).toBe(false);
    expect(reason).toBe('exists');
  });

  test('reports when there is no anchor to inject into', () => {
    const { changed, reason } = injectFlavor('android {}\n', { flavorName: 'staging' });
    expect(changed).toBe(false);
    expect(reason).toBe('no-anchor');
  });
});

describe('removeFlavorBlock', () => {
  test('removes only the target flavor', () => {
    let content = injectFlavor(BASE_GRADLE, { flavorName: 'staging' }).content;
    content = injectFlavor(content, { flavorName: 'prod' }).content;
    const result = removeFlavorBlock(content, 'prod');
    expect(result.changed).toBe(true);
    expect(result.content).not.toMatch(/\bprod\s*{/);
    expect(result.content).toContain('staging {');
  });

  test('is a no-op when the flavor is absent', () => {
    const { changed } = removeFlavorBlock(BASE_GRADLE, 'ghost');
    expect(changed).toBe(false);
  });

  test('drops the empty productFlavors and flavorDimensions when the last flavor goes', () => {
    const content = injectFlavor(BASE_GRADLE, { flavorName: 'staging' }).content;
    const { content: result, changed } = removeFlavorBlock(content, 'staging');
    expect(changed).toBe(true);
    expect(result).not.toContain('productFlavors');
    expect(result).not.toContain('flavorDimensions');
    expect(result).toContain('defaultConfig {');
  });

  test('treats a regex-meta name literally and does not throw', () => {
    const { changed } = removeFlavorBlock(BASE_GRADLE, 'a.b');
    expect(changed).toBe(false);
  });
});

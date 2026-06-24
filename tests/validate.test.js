const { validateFlavorName } = require('../src/validate');

describe('validateFlavorName', () => {
  test('accepts a camelCase name', () => {
    expect(validateFlavorName('staging')).toBeNull();
    expect(validateFlavorName('stagingTwo')).toBeNull();
    expect(validateFlavorName('staging2')).toBeNull();
  });

  test('rejects hyphens, spaces and underscores', () => {
    expect(validateFlavorName('my-flavor')).toMatch(/Invalid/);
    expect(validateFlavorName('my flavor')).toMatch(/Invalid/);
    expect(validateFlavorName('my_flavor')).toMatch(/Invalid/);
  });

  test('rejects names not starting with a lowercase letter', () => {
    expect(validateFlavorName('Staging')).toMatch(/Invalid/);
    expect(validateFlavorName('2staging')).toMatch(/Invalid/);
  });

  test('rejects empty / undefined', () => {
    expect(validateFlavorName('')).toMatch(/Invalid/);
    expect(validateFlavorName(undefined)).toMatch(/Invalid/);
  });

  test('rejects reserved Gradle names', () => {
    expect(validateFlavorName('test')).toMatch(/reserved/);
    expect(validateFlavorName('main')).toMatch(/reserved/);
    expect(validateFlavorName('androidTest')).toMatch(/reserved/);
  });
});

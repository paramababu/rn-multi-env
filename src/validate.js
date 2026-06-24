// Gradle flavor names must be valid Groovy/Java identifiers; a handful are
// reserved and will break the build if used as a flavor.
const RESERVED_FLAVOR_NAMES = ['test', 'androidTest', 'main'];

// Returns an error message string when invalid, or null when the name is OK.
function validateFlavorName(name) {
  if (!name || !/^[a-z][a-zA-Z0-9]*$/.test(name)) {
    return `Invalid flavor name '${name}'. Use a camelCase identifier starting with a lowercase letter (letters and digits only, no spaces, hyphens or underscores).`;
  }
  if (RESERVED_FLAVOR_NAMES.includes(name)) {
    return `'${name}' is a reserved Gradle name and cannot be used as a flavor.`;
  }
  return null;
}

module.exports = { validateFlavorName, RESERVED_FLAVOR_NAMES };

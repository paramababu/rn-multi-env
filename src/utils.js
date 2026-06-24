const fs = require('fs-extra');

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str);

// Wraps fs.readJson so a malformed package.json surfaces a clear, actionable
// message instead of a raw SyntaxError stack trace.
async function readJsonSafe(file) {
  try {
    return await fs.readJson(file);
  } catch (err) {
    throw new Error(`Failed to read JSON at ${file}: ${err.message}`);
  }
}

module.exports = { capitalize, readJsonSafe };

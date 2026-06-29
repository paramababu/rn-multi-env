// Pure string transformations for build.gradle. No filesystem access here so
// every branch can be exercised with plain string fixtures in unit tests.

// Escape any regex metacharacters so an arbitrary flavor name can be matched
// literally. Validation already restricts created names, but the remove path
// accepts a raw name, so we never trust it inside a RegExp.
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Given the index of an opening '{', return the index just past its matching
// '}', correctly accounting for nested braces.
function findBlockEnd(content, openIdx) {
  let depth = 1;
  let i = openIdx + 1;
  while (depth > 0 && i < content.length) {
    const char = content[i];
    if (char === '{') depth++;
    else if (char === '}') depth--;
    i++;
  }
  return i;
}

function buildFlavorBlock({ flavorName, packageName, appName, indent = 8 }) {
  const pad = ' '.repeat(indent);
  const inner = ' '.repeat(indent + 4);
  // Prefer an explicit applicationId when a package name is supplied, otherwise
  // fall back to a suffix derived from the flavor name.
  const idLine = packageName
    ? `${inner}applicationId "${packageName}"`
    : `${inner}applicationIdSuffix ".${flavorName}"`;
  return (
    `${pad}${flavorName} {\n` +
    `${inner}dimension "default"\n` +
    `${idLine}\n` +
    `${inner}resValue "string", "app_name", "${appName || flavorName}"\n` +
    `${pad}}\n`
  );
}

function hasFlavor(content, flavorName) {
  return new RegExp(`\\b${escapeRegExp(flavorName)}\\s*{`).test(content);
}

// Inject a new flavor into gradle content. Returns { content, changed, reason }.
function injectFlavor(content, { flavorName, packageName, appName }) {
  if (!content.includes('productFlavors')) {
    const dcIdx = content.indexOf('defaultConfig {');
    if (dcIdx === -1) {
      return { content, changed: false, reason: 'no-anchor' };
    }
    // Insert at the start of the defaultConfig line so its indentation is kept.
    const lineStart = content.lastIndexOf('\n', dcIdx) + 1;
    const block =
      `    flavorDimensions "default"\n` +
      `    productFlavors {\n` +
      `${buildFlavorBlock({ flavorName, packageName, appName })}` +
      `    }\n`;
    return {
      content: content.slice(0, lineStart) + block + content.slice(lineStart),
      changed: true,
    };
  }

  const startIdx = content.search(/productFlavors\s*{/);
  if (startIdx === -1) return { content, changed: false, reason: 'no-productFlavors' };

  const openIdx = content.indexOf('{', startIdx);
  const endIdx = findBlockEnd(content, openIdx);
  const inner = content.slice(openIdx + 1, endIdx - 1);

  if (hasFlavor(inner, flavorName)) {
    return { content, changed: false, reason: 'exists' };
  }

  // Insert before the closing brace's own line to keep indentation tidy.
  const insertAt = content.lastIndexOf('\n', endIdx - 1) + 1;
  const block = buildFlavorBlock({ flavorName, packageName, appName });
  let updated = content.slice(0, insertAt) + block + content.slice(insertAt);

  // A flavor references dimension "default"; make sure it is declared.
  if (!/flavorDimensions/.test(updated)) {
    const fpIdx = updated.search(/productFlavors\s*{/);
    updated = updated.slice(0, fpIdx) + 'flavorDimensions "default"\n    ' + updated.slice(fpIdx);
  }

  return { content: updated, changed: true };
}

// When productFlavors no longer contains any flavor, drop the now-empty block
// (and its orphaned flavorDimensions declaration) so removal is the clean
// inverse of injection.
function cleanupEmptyProductFlavors(content) {
  const startIdx = content.search(/productFlavors\s*{/);
  if (startIdx === -1) return content;

  const openIdx = content.indexOf('{', startIdx);
  const endIdx = findBlockEnd(content, openIdx);
  if (content.slice(openIdx + 1, endIdx - 1).trim() !== '') return content;

  const lineStart = content.lastIndexOf('\n', startIdx) + 1;
  let lineEnd = endIdx;
  if (content[lineEnd] === '\n') lineEnd++;

  let result = content.slice(0, lineStart) + content.slice(lineEnd);
  // The dimension is only meaningful while at least one flavor declares it.
  result = result.replace(/^[ \t]*flavorDimensions[^\n]*\n/m, '');
  return result;
}

// Remove a flavor block. Returns { content, changed }.
function removeFlavorBlock(content, flavorName) {
  const idx = content.search(new RegExp(`\\b${escapeRegExp(flavorName)}\\s*{`));
  if (idx === -1) return { content, changed: false };

  const openIdx = content.indexOf('{', idx);
  const endIdx = findBlockEnd(content, openIdx);

  // Strip the whole block including its leading indentation and trailing newline.
  const lineStart = content.lastIndexOf('\n', idx) + 1;
  let lineEnd = endIdx;
  if (content[lineEnd] === '\n') lineEnd++;

  const stripped = content.slice(0, lineStart) + content.slice(lineEnd);
  return { content: cleanupEmptyProductFlavors(stripped), changed: true };
}

module.exports = { escapeRegExp, findBlockEnd, buildFlavorBlock, hasFlavor, injectFlavor, removeFlavorBlock };

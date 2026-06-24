const os = require('os');
const path = require('path');
const fs = require('fs-extra');

// Creates an isolated temp project directory seeded with the given files
// (keyed by relative path). Returns the absolute root.
async function makeTempProject(files = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rnflavor-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    await fs.ensureDir(path.dirname(full));
    await fs.writeFile(full, content);
  }
  return root;
}

const BASE_GRADLE = `android {
    namespace "com.demo"
    defaultConfig {
        applicationId "com.demo"
        minSdkVersion 21
    }
    buildTypes {
        debug {}
    }
}
`;

module.exports = { makeTempProject, BASE_GRADLE };

const path = require('path');

// Resolve every path the CLI touches from a single project root. Accepting the
// root as an argument (instead of reading process.cwd() everywhere) is what
// makes the generators testable against temp directories.
function getPaths(root = process.cwd()) {
  const androidApp = path.join(root, 'android', 'app');
  const ios = path.join(root, 'ios');

  return {
    root,
    androidApp,
    androidSrc: path.join(androidApp, 'src'),
    buildGradle: path.join(androidApp, 'build.gradle'),
    ios,
    iosConfig: path.join(ios, 'config'),
    packageJson: path.join(root, 'package.json'),
    templates: path.join(__dirname, '..', 'templates'),
  };
}

module.exports = { getPaths };

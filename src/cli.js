const { program } = require('commander');
const pkg = require('../package.json');
const logger = require('./logger');
const { validateFlavorName } = require('./validate');
const { createFlavor, removeFlavor } = require('./flavor');
const { promptMissing } = require('./prompt');

// Wraps a command action so any unexpected error becomes a clean message and a
// non-zero exit code instead of an unhandled-rejection stack trace.
function withErrorHandling(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      logger.error(`❌ ${err.message}`);
      process.exitCode = 1;
    }
  };
}

function run(argv = process.argv) {
  program
    .name('rn-multi-env')
    .description('CLI to add multi-environment build flavors for React Native apps')
    .version(pkg.version);

  program
    .command('create <flavorName>')
    .description('Create a new React Native build flavor')
    .option('-p, --package <packageName>', 'Package name / applicationId (e.g., com.myapp.dev)')
    .option('-n, --name <appName>', 'App Name for this flavor')
    .action(
      withErrorHandling(async (flavorName, options) => {
        const error = validateFlavorName(flavorName);
        if (error) {
          logger.error(`❌ ${error}`);
          process.exitCode = 1;
          return;
        }

        const answers = await promptMissing({
          packageName: options.package,
          appName: options.name,
        });

        await createFlavor({
          flavorName,
          packageName: options.package || answers.packageName,
          appName: options.name || answers.appName,
        });
      })
    );

  program
    .command('remove <flavorName>')
    .description('Remove an existing React Native build flavor')
    .option('-d, --dry-run', 'Preview changes without applying them')
    .action(
      withErrorHandling(async (flavorName, options) => {
        await removeFlavor({ flavorName, dryRun: Boolean(options.dryRun) });
      })
    );

  program.parse(argv);
}

module.exports = { run, withErrorHandling };

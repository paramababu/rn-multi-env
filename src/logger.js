const chalk = require('chalk');

// Single place that owns all console output + colouring, so the rest of the
// code stays free of chalk and is easy to silence in tests.
const logger = {
  info: (m) => console.log(chalk.blue(m)),
  success: (m) => console.log(chalk.green(m)),
  warn: (m) => console.log(chalk.yellow(m)),
  error: (m) => console.error(chalk.red(m)),
  step: (m) => console.log(chalk.magenta(m)),
  note: (m) => console.log(chalk.cyan(m)),
  dim: (m) => console.log(chalk.gray(m)),
  bold: (m) => console.log(chalk.bold(m)),
  plain: (m) => console.log(m),
};

module.exports = logger;

const inquirerModule = require('inquirer');
// inquirer v9 is ESM; when required from CommonJS the API lives on `.default`.
const inquirer = inquirerModule.prompt ? inquirerModule : inquirerModule.default;

// Only prompts for the values that weren't supplied via flags.
async function promptMissing({ packageName, appName }) {
  const questions = [];
  if (!packageName) {
    questions.push({
      type: 'input',
      name: 'packageName',
      message: 'Enter the package name (e.g., com.myapp.dev):',
    });
  }
  if (!appName) {
    questions.push({
      type: 'input',
      name: 'appName',
      message: 'Enter the app name:',
    });
  }
  return questions.length ? inquirer.prompt(questions) : {};
}

module.exports = { promptMissing };

const chalk = require('chalk');

module.exports.log = message => console.log(`${Date.now()} >>> ${message}`);
module.exports.warning = message =>
  console.log(`${Date.now()} >>> ${chalk.yellow(message)}`);
module.exports.info = message =>
  console.log(`${Date.now()} >>> ${chalk.cyan(message)}`);
module.exports.error = message =>
  console.log(`${Date.now()} >>> ${chalk.red(message)}`);
module.exports.success = message =>
  console.log(`${Date.now()} >>> ${chalk.green(message)}`);

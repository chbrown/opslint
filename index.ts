import * as async from 'async';
import * as chalk from 'chalk';

import {Gap} from './gaps/index';

// ✓ ✔ ✗ ✘ ⟁ ⚠

export function checkAll(gaps: Gap[], callback: (error?: Error) => void) {
  async.eachSeries<Gap>(gaps, (gap, callback) => {
    console.log(gap.name);
    gap.check((error, messages) => {
      if (error) return callback(error);
      if (messages.length > 0) {
        messages.forEach(message => {
          console.log(chalk.bold.red(`  ✗ ${message}`))
        });
      }
      else {
        console.log(chalk.bold.green(`  ✓ ${gap.description}`))
      }
      callback();
    });
  }, callback);
}

export function fixAll(gaps: Gap[], callback: (error?: Error) => void) {
  async.eachSeries<Gap>(gaps, (gap, callback) => {
    console.log(gap.name);
    gap.fix((error, messages) => {
      if (error) return callback(error);
      messages.forEach(message => {
        console.log(chalk.bold.yellow(`  ⚠ ${message}`))
      });
      callback();
    });
  }, callback);
}

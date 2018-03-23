import * as async from 'async'
import chalk from 'chalk'

import {Rule} from './rules/index'

// ✓ ✔ ✗ ✘ ⟁ ⚠

export function checkAll(rules: Rule[], callback: (error?: Error) => void) {
  async.eachSeries(rules, (rule, callback) => {
    console.log(rule.name)
    rule.check((error, messages) => {
      if (error) return callback(error)
      if (messages.length > 0) {
        messages.forEach(message => {
          console.log(chalk.bold.red(`  ✗ ${message}`))
        })
      }
      else {
        console.log(chalk.bold.green(`  ✓ ${rule.description}`))
      }
      callback()
    })
  }, callback)
}

export function fixAll(rules: Rule[], callback: (error?: Error) => void) {
  async.eachSeries(rules, (rule, callback) => {
    console.log(rule.name)
    rule.fix((error, messages) => {
      if (error) return callback(error)
      messages.forEach(message => {
        console.log(chalk.bold.yellow(`  ⚠ ${message}`))
      })
      callback()
    })
  }, callback)
}

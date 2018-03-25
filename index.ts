import chalk from 'chalk'

import Rule from './rules/rule'

// ✓ ✔ ✗ ✘ ⟁ ⚠

export async function checkAll(rules: Rule[]) {
  for (const rule of rules) {
    console.log(rule.name)
    const messages = await rule.check()

    if (messages.length > 0) {
      for (const message of messages) {
        console.log(chalk.bold.red(`  ✗ ${message}`))
      }
    }
    else {
      console.log(chalk.bold.green(`  ✓ ${rule.description}`))
    }
  }
}

export async function fixAll(rules: Rule[]) {
  for (const rule of rules) {
    console.log(rule.name)
    const messages = await rule.fix()

    for (const message of messages) {
      console.log(chalk.bold.yellow(`  ⚠ ${message}`))
    }
  }
}

export async function doAll(rules, fix: boolean) {
  await checkAll(rules)
  if (fix) {
    await fixAll(rules)
  }
}

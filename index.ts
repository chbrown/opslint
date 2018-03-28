import chalk from 'chalk'

import Rule from './rules/rule'

// ✓ ✔ ✗ ✘ ⟁ ⚠

export async function checkAll(rules: Rule[]) {
  for (const rule of rules) {
    console.log(rule.name)
    const message = await rule.check().then(() => {
      return chalk.bold.green(`  ✓ ${rule.description}`)
    }, reason => {
      return chalk.bold.red(`  ✗ ${reason instanceof Error ? reason.message : reason}`)
    })
    console.log(message)
  }
}

export async function fixAll(rules: Rule[]) {
  for (const rule of rules) {
    console.log(rule.name)
    const changed = await rule.fix()

    if (changed) {
      console.log(chalk.bold.yellow(`  ⚠ ${rule.name} changed`))
    }
  }
}

export async function doAll(rules, fix: boolean) {
  await checkAll(rules)
  if (fix) {
    await fixAll(rules)
  }
}

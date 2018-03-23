#!/usr/bin/env node
import * as program from 'commander'

import {checkAll, fixAll} from '.'

import Readme from './rules/readme'
import TypeDeclarations from './rules/type-declarations'

const Rules = [
  Readme,
  TypeDeclarations,
]

export function main() {
  const {version} = require('./package')
  program
    .version(version, '-v, --version')
    .option('--fix', 'Apply fixes automatically')
    .parse(process.argv)

  const filepath = process.cwd()

  const rules = Rules.map(Rule => new Rule(filepath))
  checkAll(rules, error => {
    if (error) throw error

    if (program.fix) {
      fixAll(rules, error => {
        if (error) throw error

        console.log('Done')
      })
    }
  })
}

if (require.main === module) {
  main()
}

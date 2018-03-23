#!/usr/bin/env node
import * as program from 'commander'

import {doAll} from '.'

import Readme from './rules/readme'
import TypeDeclarations from './rules/type-declarations'

interface NPMPackage {
  version?: string
}

const Rules = [
  Readme,
  TypeDeclarations,
]

export function main() {
  const {version} = require('./package') as NPMPackage
  program
    .version(version, '-v, --version')
    .option('--fix', 'Apply fixes automatically')
    .parse(process.argv)

  const filepath = process.cwd()

  const rules = Rules.map(Rule => new Rule(filepath))
  doAll(rules, program.fix).then(() => {
    console.log('Done')
  }, error => {
    throw error
  })
}

if (require.main === module) {
  main()
}

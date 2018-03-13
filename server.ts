#!/usr/bin/env node
import * as program from 'commander'

import {checkAll, fixAll} from '.'

import Readme from './gaps/readme'
import TypeDeclarations from './gaps/type-declarations'

const Gaps = [
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

  const gaps = Gaps.map(Gap => new Gap(filepath))
  checkAll(gaps, error => {
    if (error) throw error

    if (program.fix) {
      fixAll(gaps, error => {
        if (error) throw error

        console.log('Done')
      })
    }
  })
}

if (require.main === module) {
  main()
}

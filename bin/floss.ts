#!/usr/bin/env node

import {checkAll, fixAll} from '../index';

import Readme from '../gaps/readme';
import TypeDeclarations from '../gaps/type-declarations';

const Gaps = [
  Readme,
  TypeDeclarations,
];

function main() {
  let filepath = process.cwd();
  let fix = process.argv.indexOf('--fix') > -1;

  let gaps = Gaps.map(Gap => new Gap(filepath));
  checkAll(gaps, error => {
    if (error) throw error;

    if (fix) {
      fixAll(gaps, error => {
        if (error) throw error;

        console.log('Done');
      });
    }
  });
}

if (require.main === module) {
  main();
}

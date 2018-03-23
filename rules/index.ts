import {promisify} from 'util'
import {readFile} from 'fs'

const readFilePromise = promisify(readFile)

/**
Failed checks are handled differently from errors.
*/
export type RulePromise = Promise<string[]>

export abstract class Rule {
  // abstract
  name: string
  description: string
  constructor(public filepath: string) { }
  abstract async check(): RulePromise
  abstract async fix(): RulePromise
}

export async function readOptionalFile(filepath: string, defaultData: string) {
  return readFilePromise(filepath, {encoding: 'utf8'})
  .then(fileData => {
    return {missing: false, data: fileData}
  }, (err: NodeJS.ErrnoException) => {
    // swallow missing file error
    if (err.code === 'ENOENT') {
      return {missing: true, data: defaultData}
    }
    // treat all other errors idiomatically
    throw err
  })
}

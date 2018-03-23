import {readFile} from 'fs'

/**
Failed checks are handled differently from errors.
*/
export type RuleCallback = (error: Error, messages?: string[]) => void

export abstract class Rule {
  // abstract
  name: string
  description: string
  constructor(public filepath: string) { }
  abstract check(callback: RuleCallback): void
  abstract fix(callback: RuleCallback): void
}

export function readOptionalFile(filepath: string,
                                 defaultData: string,
                                 callback: (error: Error, data?: string, missing?: boolean) => void) {
  readFile(filepath, {encoding: 'utf8'}, (error, fileData) => {
    let missing = false
    let data = fileData
    if (error) {
      if (error.code === 'ENOENT') {
        // swallow missing file error
        missing = true
        data = defaultData
      }
      else {
        // treat all other errors idiomatically
        return callback(error)
      }
    }
    callback(null, data, missing)
  })
}

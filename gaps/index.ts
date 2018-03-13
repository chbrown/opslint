import {readFile} from 'fs'

/**
Failed checks are handled differently from errors.
*/
export type GapCallback = (error: Error, messages?: string[]) => void

export abstract class Gap {
  // abstract
  name: string
  description: string
  constructor(public filepath: string) { }
  abstract check(callback: GapCallback): void
  abstract fix(callback: GapCallback): void
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

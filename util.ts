import {promisify} from 'util'
import * as fs from 'fs'
import * as rimraf from 'rimraf'

export const access = promisify(fs.access)
export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)
export const rmAll = promisify(rimraf)

export async function exists(path: string) {
  return access(path).then(() => true, error => false)
}

export async function readOptionalFile(path: string, defaultData: string) {
  return readFile(path, {encoding: 'utf8'})
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

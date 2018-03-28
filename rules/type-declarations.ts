import {join} from 'path'
import Rule from './rule'
import {writeFile, readOptionalFile, rmAll, exists, log} from '../util'


const DefinitelyTyped_regExp = /DefinitelyTyped\/(.+\.d\.ts)/
const node_modules_regExp = /node_modules\/(.+\.d\.ts)/

interface TSConfig {
  compilerOptions?: {[name: string]: string | string[] | number | boolean}
  include?: string[]
  exclude?: string[]
  files?: string[]
}

async function updateTSConfig(filepath: string,
                              additionalFiles: string[]) {
  const {data, missing} = await readOptionalFile(filepath, '{}')

  if (missing) {
    log(`creating ${filepath}`)
  }

  log(`adding ${additionalFiles.length} new files to tsconfig`)

  const originalTSConfig = JSON.parse(data) as TSConfig
  const files = [...additionalFiles, ...(originalTSConfig.files || [])]
  const updatedTSConfig = {...originalTSConfig, files}
  const updatedData = JSON.stringify(updatedTSConfig, null, '  ')

  await writeFile(filepath, `${updatedData}\n`, {encoding: 'utf8'})

  log('wrote updates to tsconfig.json')
}

export default class TypeDeclarations extends Rule {
  name = 'type_declarations'
  description = 'type_declarations does not exist'
  async check() {
    const directoryExists = await exists(join(this.filepath, 'type_declarations'))
    if (directoryExists) {
      throw new Error('type_declarations exists')
    }
  }
  /**
  1. read index.d.ts
  2. replace all triple-slash DefinitelyTyped/ references
  */
  async fix() {
    const index_d_ts_path = join(this.filepath, 'type_declarations', 'index.d.ts')
    const {data, missing} = await readOptionalFile(index_d_ts_path, '')
    if (missing) {
      log('type_declarations/index.d.ts does not exist')
    }

    const lines = data.split('\n')

    // transform lines like:
    //   '/// <reference path="DefinitelyTyped/node/node.d.ts" />'
    // to strings:
    //   'node_modules/declarations/node/node.d.ts'
    const DefinitelyTyped = lines.filter(line => DefinitelyTyped_regExp.test(line)).map(line => {
      const m = line.match(DefinitelyTyped_regExp)
      return `node_modules/declarations/${m[1]}`
    })

    // transform lines like:
    //   '/// <reference path="../node_modules/loge/loge.d.ts" />'
    // to strings:
    //   'node_modules/loge/loge.d.ts'
    const node_modules = lines.filter(line => node_modules_regExp.test(line)).map(line => {
      const m = line.match(node_modules_regExp)
      return `node_modules/${m[1]}`
    })

    const additional_files = [...DefinitelyTyped, ...node_modules]

    const other_lines = lines.filter(line => !node_modules_regExp.test(line) &&
                                             !DefinitelyTyped_regExp.test(line) &&
                                             !/^\s*$/.test(line))

    const shims_filepath = join(this.filepath, 'shims.d.ts')
    if (other_lines.length > 0) {
      additional_files.push('shims.d.ts')
      const shimsExist = await exists(shims_filepath)
      if (shimsExist) {
        throw new Error('shims.d.ts already exists')
      }
    }

    await updateTSConfig(join(this.filepath, 'tsconfig.json'), additional_files)

    // delete entire type_declarations directory
    await rmAll(join(this.filepath, 'type_declarations'))

    log('deleted type_declarations/ directory')

    if (other_lines.length) {
      // write anything else to shims.d.ts
      log('writing remainder of type_declarations/index.d.ts to shims.d.ts')
      await writeFile(shims_filepath, other_lines.join('\n'), {encoding: 'utf8'})
    }

    return true
  }
}

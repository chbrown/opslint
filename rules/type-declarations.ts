import {join} from 'path'
import Rule from './rule'
import {writeFile, readOptionalFile, rmAll, exists} from '../util'


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
  const messages: string[] = []
  const {data, missing} = await readOptionalFile(filepath, '{}')

  if (missing) {
    messages.push(`creating ${filepath}`)
  }

  messages.push(`adding ${additionalFiles.length} new files to tsconfig`)

  const originalTSConfig = JSON.parse(data) as TSConfig
  const files = [...additionalFiles, ...(originalTSConfig.files || [])]
  const updatedTSConfig = {...originalTSConfig, files}
  const updatedData = JSON.stringify(updatedTSConfig, null, '  ')

  await writeFile(filepath, `${updatedData}\n`, {encoding: 'utf8'})

  messages.push('wrote updates to tsconfig.json')

  return messages
}

export default class TypeDeclarations extends Rule {
  name = 'type_declarations'
  description = 'type_declarations does not exist'
  async check() {
    const messages: string[] = []
    const directoryExists = await exists(join(this.filepath, 'type_declarations'))
    if (directoryExists) {
      messages.push('type_declarations exists')
    }

    return messages
  }
  /**
  1. read index.d.ts
  2. replace all triple-slash DefinitelyTyped/ references
  */
  async fix() {
    const messages: string[] = []
    const {data, missing} = await readOptionalFile(join(this.filepath, 'type_declarations', 'index.d.ts'), '')
    if (missing) {
      messages.push('type_declarations/index.d.ts does not exist')
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

    const ts_messages = await updateTSConfig(join(this.filepath, 'tsconfig.json'), additional_files)
    messages.push(...ts_messages)

    // delete entire type_declarations directory
    await rmAll(join(this.filepath, 'type_declarations'))

    messages.push('deleted type_declarations/ directory')

    if (other_lines.length === 0) {
      // short circuit if there is no need to write shims.d.ts
      return messages
    }

    messages.push('writing remainder of type_declarations/index.d.ts to shims.d.ts')

    await writeFile(shims_filepath, other_lines.join('\n'), {encoding: 'utf8'})

    return messages
  }
}

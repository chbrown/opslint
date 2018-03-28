import {join} from 'path'
import Rule from './rule'
import {exists, readFile, writeFile, readOptionalFile, log} from '../util'

const licenseSectionRegExp = /\n#+\s*License/i
const correctUrlRegExp = /chbrown\.github\.io\/licenses\/MIT/i

const licenseText = `

## License

Copyright Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/)
`

export default class Readme extends Rule {
  name = 'README.md'
  description = 'README.md exists and contains License section with correct URL'
  get readme_filepath() {
    return join(this.filepath, 'README.md')
  }
  async check() {
    const readmeExists = await exists(this.readme_filepath)
    if (!readmeExists) {
      throw new Error('README.md does not exist')
    }

    const data = await readFile(this.readme_filepath, {encoding: 'utf8'})
    if (!licenseSectionRegExp.test(data)) {
      throw new Error('README.md does not contain License section')
    }
    if (!correctUrlRegExp.test(data)) {
      throw new Error('README.md License section does not contain correct URL')
    }
  }
  async fix() {
    const {data, missing} = await readOptionalFile(this.readme_filepath, '')

    // stop if nothing needs changing
    if (!missing && licenseSectionRegExp.test(data) && correctUrlRegExp.test(data)) {
      log('Nothing to fix')
      return false
    }

    if (missing) {
      log('Creating README.md')
    }

    let fixed_data = data
    // look for [MIT License]() Markdown-syntax link
    const link_match = fixed_data.match(/\[MIT Licensed\]\(([^)]+)\)/i)
    if (link_match) {
      fixed_data = fixed_data.replace(link_match[1], 'http://chbrown.github.io/licenses/MIT/')
      log('Replacing existing URL')
    }
    else {
      fixed_data += licenseText
      log('Adding new License section with correct URL')
    }

    // creates file if needed
    await writeFile(this.readme_filepath, data, {encoding: 'utf8'})
    return true
  }
}

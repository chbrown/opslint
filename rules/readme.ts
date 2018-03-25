import {join} from 'path'
import {Rule} from './index'
import {writeFile, readOptionalFile} from '../util'

const licenseSectionRegExp = /\n#+\s*License/i
const correctUrlRegExp = /chbrown\.github\.io\/licenses\/MIT/i

const licenseText = `

## License

Copyright Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/)
`

export default class Readme extends Rule {
  name = 'README.md'
  description = 'README.md exists, contains License section with correct URL'
  get readme_filepath() {
    return join(this.filepath, 'README.md')
  }
  async check() {
    const messages: string[] = []
    const {data, missing} = await readOptionalFile(this.readme_filepath, '')
    if (missing) {
      messages.push('README.md does not exist')
    }

    if (!licenseSectionRegExp.test(data)) {
      messages.push('README.md does not contain License section')
    }
    if (!correctUrlRegExp.test(data)) {
      messages.push('README.md License section does not contain correct URL')
    }
    return messages
  }
  async fix() {
    const messages: string[] = []
    const {data, missing} = await readOptionalFile(this.readme_filepath, '')
    if (missing) {
      messages.push('Creating README.md')
    }
    // let data = fileData

    // stop if nothing needs changing
    if (correctUrlRegExp.test(data) && licenseSectionRegExp.test(data)) {
      messages.push('Nothing to fix')
      return messages
    }

    let fixed_data = data
    // look for [MIT License]() Markdown-syntax link
    const link_match = fixed_data.match(/\[MIT Licensed\]\(([^)]+)\)/i)
    if (link_match) {
      fixed_data = fixed_data.replace(link_match[1], 'http://chbrown.github.io/licenses/MIT/')
      messages.push('Replacing existing URL')
    }
    else {
      fixed_data += licenseText
      messages.push('Adding new License section with correct URL')
    }

    // creates file if needed
    await writeFile(this.readme_filepath, data, {encoding: 'utf8'})
    return messages
  }
}

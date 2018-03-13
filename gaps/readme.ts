import {join} from 'path';
import {writeFile} from 'fs';
import {Gap, GapCallback, readOptionalFile} from './index';

const licenseSectionRegExp = /\n#+\s*License/i;
const correctUrlRegExp = /chbrown\.github\.io\/licenses\/MIT/i;

export default class Readme extends Gap {
  name = 'README.md';
  description = 'README.md exists, contains License section with correct URL';
  get readme_filepath() {
    return join(this.filepath, 'README.md');
  }
  check(callback: GapCallback) {
    const messages: string[] = [];
    readOptionalFile(this.readme_filepath, '', (error, data, missing) => {
      if (error) return callback(error);
      if (missing) {
        messages.push('README.md does not exist');
      }

      if (!licenseSectionRegExp.test(data)) {
        messages.push('README.md does not contain License section');
      }
      if (!correctUrlRegExp.test(data)) {
        messages.push('README.md License section does not contain correct URL');
      }

      return callback(null, messages);
    });
  }
  fix(callback: GapCallback) {
    const messages: string[] = [];
    readOptionalFile(this.readme_filepath, '', (error, fileData, missing) => {
      if (error) return callback(error);
      if (missing) {
        messages.push('Creating README.md');
      }
      let data = fileData;

      // stop if nothing needs changing
      if (correctUrlRegExp.test(data) && licenseSectionRegExp.test(data)) {
        messages.push('Nothing to fix');
        return callback(null, messages);
      }

      // look for [MIT License]() Markdown-syntax link
      const link_match = data.match(/\[MIT Licensed\]\(([^)]+)\)/i);
      if (link_match) {
        data = data.replace(link_match[1], 'http://chbrown.github.io/licenses/MIT/');
        messages.push('Replacing existing URL');
      }
      else {
        data += [
          '',
          '',
          '## License',
          '',
          'Copyright Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/)',
          '',
        ].join('\n');
        messages.push('Adding new License section with correct URL');
      }

      // creates file if needed
      writeFile(this.readme_filepath, data, {encoding: 'utf8'}, error => {
        callback(error, messages);
      });
    });
  }
}

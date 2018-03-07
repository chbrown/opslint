import {join} from 'path';
import {exists, existsSync, readFile, writeFile} from 'fs';
import {Gap, GapCallback, readOptionalFile} from './index';
import * as rimraf from 'rimraf';

const DefinitelyTyped_regExp = /DefinitelyTyped\/(.+\.d\.ts)/;
const node_modules_regExp = /node_modules\/(.+\.d\.ts)/;

function updateTSConfig(filepath: string,
                        files: string[],
                        callback: (error: Error, messages?: string[]) => void) {
  var messages: string[] = [];
  readOptionalFile(filepath, '{}', (error, data, missing) => {
    if (error) return callback(error);
    if (missing) {
      messages.push(`creating ${filepath}`);
    }

    var tsconfig = JSON.parse(data);
    messages.push(`adding ${files.length} new files to tsconfig`);
    tsconfig.files = files.concat(tsconfig.files || []);
    data = JSON.stringify(tsconfig, null, '  ');
    writeFile(filepath, data + '\n', {encoding: 'utf8'}, error => {
      if (error) return callback(error);

      messages.push(`wrote updates to tsconfig.json`);
      callback(null, messages);
    });
  });
}

export default class TypeDeclarations extends Gap {
  name = 'type_declarations';
  description = 'type_declarations does not exist';
  check(callback: GapCallback) {
    var messages: string[] = [];
    exists(join(this.filepath, 'type_declarations'), exists => {
      if (exists) {
        messages.push('type_declarations exists');
      }
      callback(null, messages);
    });
  }
  /**
  1. read index.d.ts
  2. replace all triple-slash DefinitelyTyped/ references
  */
  fix(callback: GapCallback) {
    var messages: string[] = [];
    readOptionalFile(join(this.filepath, 'type_declarations', 'index.d.ts'), '', (error, data, missing) => {
      if (error) return callback(error);
      if (missing) {
        messages.push('type_declarations/index.d.ts does not exist');
      }

      var lines = data.split('\n');

      // transform lines like:
      //   '/// <reference path="DefinitelyTyped/node/node.d.ts" />'
      // to strings:
      //   'node_modules/declarations/node/node.d.ts'
      var DefinitelyTyped = lines.filter(line => DefinitelyTyped_regExp.test(line)).map(line => {
        var m = line.match(DefinitelyTyped_regExp);
        return `node_modules/declarations/${m[1]}`;
      });

      // transform lines like:
      //   '/// <reference path="../node_modules/loge/loge.d.ts" />'
      // to strings:
      //   'node_modules/loge/loge.d.ts'
      var node_modules = lines.filter(line => node_modules_regExp.test(line)).map(line => {
        var m = line.match(node_modules_regExp);
        return `node_modules/${m[1]}`;
      });

      var additional_files = [...DefinitelyTyped, ...node_modules];

      var other_lines = lines.filter(line => !node_modules_regExp.test(line) &&
                                             !DefinitelyTyped_regExp.test(line) &&
                                             !/^\s*$/.test(line));

      var shims_filepath = join(this.filepath, 'shims.d.ts')
      if (other_lines.length > 0) {
        additional_files.push('shims.d.ts');
        var shims_exist = existsSync(shims_filepath);
        if (shims_exist) {
          return callback(new Error('shims.d.ts already exists'));
        }
      }

      updateTSConfig(join(this.filepath, 'tsconfig.json'), additional_files, (error, ts_messages) => {
        if (error) return callback(error);
        messages.push(...ts_messages);

        // delete entire type_declarations directory
        rimraf(join(this.filepath, 'type_declarations'), error => {
          if (error) return callback(error);
          messages.push('deleted type_declarations/ directory');

          if (other_lines.length === 0) {
            // short circuit if there is no need to write shims.d.ts
            return callback(null, messages);
          }

          messages.push('writing remainder of type_declarations/index.d.ts to shims.d.ts');

          writeFile(shims_filepath, other_lines.join('\n'), {encoding: 'utf8'}, error => {
            callback(error, messages);
          });
        });
      });
    });
  }
}

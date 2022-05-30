import { readFileSync, createReadStream } from 'node:fs';
import { join } from 'node:path';

import File from 'vinyl';
import vinylToString from 'vinyl-contents-tostring';
import { requireFromString, importFromStringSync } from 'module-from-string';
import { dirname } from 'dirname-filename-esm';
import { use, expect } from 'chai';
import { pEvent } from 'p-event';

// https://github.com/import-js/eslint-plugin-import/issues/1649
// eslint-disable-next-line import/no-unresolved,n/no-extraneous-import
import lua2js from 'gulp-redis-lua2js';

const cjs = readFileSync(join(dirname(import.meta), 'foo.cjs'), 'utf8');
const esm = readFileSync(join(dirname(import.meta), 'foo.js'), 'utf8');

// eslint-disable-next-line unicorn/no-await-expression-member
use((await import('chai-as-promised')).default);

function fromStream(luaPath, options) {
  // create the fake file
  const luaFile = new File({
    path: luaPath,
    contents: createReadStream(join(dirname(import.meta), luaPath)),
  });

  // Create a prefixer plugin stream
  const converter = lua2js(options).end(luaFile);

  // wait for the file to come back out
  return pEvent(converter, 'data');
}

function fromBuffer(path, options) {
  // create the fake file
  const file = new File({
    path,
    contents: Buffer.from(readFileSync(join(dirname(import.meta), 'foo.lua'))),
  });

  // Create a prefixer plugin stream
  const converter = lua2js(options).end(file);

  // wait for the file to come back out
  return pEvent(converter, 'data');
}

describe('gulp-redis-lua2js', () => {
  describe('in streaming mode', () => {
    it('should convert given lua file', () => (
      fromStream('foo.lua')
        .then((file) => {
          // make sure it came out the same way it went in
          expect(file.isStream()).to.equal(true);
          expect(file.basename).to.equal('foo.js');

          // buffer the contents to make sure it got prepended to
          return expect(vinylToString(file)).to.become(cjs);
        })
    ));
  });

  describe('in buffering mode', () => {
    it('should convert given lua file', () => (
      fromBuffer('foo.lua').then((file) => {
        // make sure it came out the same way it went in
        expect(file.isBuffer()).to.equal(true);
        expect(file.basename).to.equal('foo.js');

        // buffer the contents to make sure it got prepended to
        expect(file.contents.toString()).to.equal(cjs);
      })
    ));
  });

  describe('options', () => {
    it('should use filename as lua command name', () => (
      fromBuffer('foo.lua').then((file) => {
        const lua = requireFromString(file.contents.toString());
        // buffer the contents to make sure it got prepended to
        expect(lua.name).to.equal('foo');
      })
    ));

    it('should use comment content as lua command name', () => (
      fromBuffer('foo.lua', { useFilenameAsName: false }).then((file) => {
        const lua = requireFromString(file.contents.toString());
        // buffer the contents to make sure it got prepended to
        expect(lua.name).to.equal('pdel');
      })
    ));

    it('should override command name', () => (
      fromBuffer('foo.lua', { name: 'somename' }).then((file) => {
        const lua = requireFromString(file.contents.toString());
        // buffer the contents to make sure it got prepended to
        expect(lua.name).to.equal('somename');
      })
    ));

    it('should convert to an esm module', () => (
      fromBuffer('foo.lua', { type: 'module' }).then((file) => {
        const lua = importFromStringSync(file.contents.toString());
        // buffer the contents to make sure it got prepended to
        expect(lua.name).to.equal('foo');
        expect(file.contents.toString()).to.equal(esm);
      })
    ));
  });
});

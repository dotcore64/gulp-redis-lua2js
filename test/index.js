const File = require('vinyl');

const { join } = require('path');
const { readFileSync, createReadStream } = require('fs');
const vinylToString = require('vinyl-contents-tostring');
const requireFromString = require('require-from-string');
const { use, expect } = require('chai');
const { fromEvent } = require('promise-toolbox');

const lua2js = require('..');

use(require('chai-as-promised'));

const convertedJs = readFileSync(join(__dirname, 'foo.js'), 'utf8');

describe('gulp-redis-lua2js', () => {
  function fromStream(luaPath, options) {
    // create the fake file
    const luaFile = new File({
      path: luaPath,
      contents: createReadStream(join(__dirname, luaPath)),
    });

    // Create a prefixer plugin stream
    const converter = lua2js(options).end(luaFile);

    // wait for the file to come back out
    return fromEvent(converter, 'data');
  }

  function fromBuffer(path, options) {
    // create the fake file
    const file = new File({
      path,
      contents: Buffer.from(readFileSync(join(__dirname, 'foo.lua'))),
    });

    // Create a prefixer plugin stream
    const converter = lua2js(options).end(file);

    // wait for the file to come back out
    return fromEvent(converter, 'data');
  }

  describe('in streaming mode', () => {
    it('should convert given lua file', () => (
      fromStream('foo.lua')
        .then((file) => {
          // make sure it came out the same way it went in
          expect(file.isStream()).to.equal(true);
          expect(file.basename).to.equal('foo.js');

          // buffer the contents to make sure it got prepended to
          return expect(vinylToString(file)).to.become(convertedJs);
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
        expect(file.contents.toString()).to.equal(convertedJs);
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

    it('should use filename as lua command name', () => (
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
  });
});

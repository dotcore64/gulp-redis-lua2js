import File from 'vinyl';

import fs from 'fs';
import path from 'path';
import es from 'event-stream';
import requireFromString from 'require-from-string';
import { expect } from 'chai';

import lua2js from '../src';

const convertedJs = fs.readFileSync(path.join(__dirname, 'foo.js'), 'utf8');

describe('gulp-redis-lua2js', () => {
  function fromStream(luaPath, options) {
    return new Promise(resolve => {
      // create the fake file
      const luaFile = new File({
        path: luaPath,
        contents: fs.createReadStream(path.join(__dirname, luaPath)),
      });

      // Create a prefixer plugin stream
      const converter = lua2js(options);
      converter.write(luaFile);

      // wait for the file to come back out
      converter.once('data', resolve);
    });
  }

  function fromBuffer(luaPath, options) {
    return new Promise(resolve => {
      // create the fake file
      const luaFile = new File({
        path: luaPath,
        contents: new Buffer(fs.readFileSync(path.join(__dirname, 'foo.lua'))),
      });

      // Create a prefixer plugin stream
      const converter = lua2js(options);
      converter.write(luaFile);

      // wait for the file to come back out
      converter.once('data', resolve);
    });
  }

  describe('in streaming mode', () => {
    it('should convert given lua file', () => (
      fromStream('foo.lua')
      .then(file => {
        // make sure it came out the same way it went in
        expect(file.isStream()).to.equal(true);
        expect(path.basename(file.path)).to.equal('foo.js');

        // buffer the contents to make sure it got prepended to
        file.contents.pipe(es.wait((err, data) => {
          // check the contents
          expect(data.toString()).to.equal(convertedJs);
        }));
      })
    ));
  });

  describe('in buffering mode', () => {
    it('should convert given lua file', () => (
      fromBuffer('foo.lua').then(file => {
        // make sure it came out the same way it went in
        expect(file.isBuffer()).to.equal(true);
        expect(path.basename(file.path)).to.equal('foo.js');

        // buffer the contents to make sure it got prepended to
        expect(file.contents.toString()).to.equal(convertedJs.trim());
      })
    ));
  });

  describe('options', () => {
    it('should use filename as lua command name', () => (
      fromBuffer('foo.lua').then(file => {
        const lua = requireFromString(file.contents.toString());
        // buffer the contents to make sure it got prepended to
        expect(lua.name).to.equal('foo');
      })
    ));

    it('should use filename as lua command name', () => (
      fromBuffer('foo.lua', { useFilenameAsName: false }).then(file => {
        const lua = requireFromString(file.contents.toString());
        // buffer the contents to make sure it got prepended to
        expect(lua.name).to.equal('pdel');
      })
    ));

    it('should override command name', () => (
      fromBuffer('foo.lua', { name: 'somename' }).then(file => {
        const lua = requireFromString(file.contents.toString());
        // buffer the contents to make sure it got prepended to
        expect(lua.name).to.equal('somename');
      })
    ));
  });
});

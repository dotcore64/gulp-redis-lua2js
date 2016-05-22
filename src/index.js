const Promise = require('bluebird');
const { PluginError } = require('gulp-util');

const fs = require('fs');
const path = require('path');
const through = require('through2');
const { lua2js } = require('redis-lua2js');

// consts
const PLUGIN_NAME = 'gulp-redis-lua2js';

fs.readFileAsync = Promise.promisify(fs.readFile);

// plugin level function (dealing with files)
function gulpLua2Js({ encoding = 'utf8', useFilenameAsName = true, ...options } = {}) {
  // creating a stream through which each file will pass
  return through.obj(function (file, enc, cb) {
    const newFile = file.clone();

    fs.readFileAsync(file.path, encoding)
    .then(lua => {
      const dirname = path.dirname(file.path);
      const basename = path.basename(file.path, path.extname(file.path));

      if (!options.hasOwnProperty('name') && useFilenameAsName) {
        options.name = basename;
      }

      const js = lua2js(lua, options);

      if (file.isBuffer()) {
        newFile.contents = new Buffer(js);
      } else if (file.isStream()) {
        // start the transformation
        newFile.contents.write(js);
        newFile.contents.end();
      } else {
        throw new PluginError(PLUGIN_NAME, 'Invalid file');
      }

      newFile.path = path.join(dirname, `${basename}.js`);
      // make sure the file goes through the next gulp plugin
      this.push(newFile);
    })
    .asCallback(cb);
  });
}

// exporting the plugin main function
module.exports = gulpLua2Js;

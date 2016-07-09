const { PluginError } = require('gulp-util');

const path = require('path');
const through = require('through2');
const vinylToString = require('vinyl-contents-tostring');
const lua2js = require('redis-lua2js');

// consts
const PLUGIN_NAME = 'gulp-redis-lua2js';

// plugin level function (dealing with files)
function gulpLua2Js({ useFilenameAsName = true, ...options } = {}) {
  // creating a stream through which each file will pass
  return through.obj(function (file, enc, cb) {
    const newFile = file.clone();

    vinylToString(file, enc)
    .then(lua => {
      const dirname = path.dirname(file.path);
      const basename = path.basename(file.path, path.extname(file.path));

      if (!{}.hasOwnProperty.call(options, 'name') && useFilenameAsName) {
        options.name = basename;
      }

      const js = lua2js(lua, options);

      if (file.isBuffer()) {
        newFile.contents = new Buffer(js);
      } else if (file.isStream()) {
        // start the transformation
        newFile.contents = through();
        newFile.contents.end(js);
      } else {
        throw new PluginError(PLUGIN_NAME, 'Invalid file');
      }

      newFile.path = path.join(dirname, `${basename}.js`);
      // make sure the file goes through the next gulp plugin
      this.push(newFile);

      cb();
    });
  });
}

// exporting the plugin main function
module.exports = gulpLua2Js;

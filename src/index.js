const { PluginError } = require('plugin-error');

const through = require('through2');
const lua2js = require('redis-lua2js');
const vinylToString = require('vinyl-contents-tostring');
const { nodeify } = require('promise-toolbox');

// consts
const PLUGIN_NAME = 'gulp-redis-lua2js';

const normalizeOptions = (useFilenameAsName, file, options) => ({
  ...options,
  name: !{}.hasOwnProperty.call(options, 'name') && useFilenameAsName
    ? file.stem
    : options.name,
});

const jsToVinyl = (file) => (js) => Object.assign(file, {
  extname: '.js',
  contents: file.isBuffer() // eslint-disable-line no-nested-ternary
    ? Buffer.from(js)
    : file.isStream()
      ? through().end(js)
      : (() => { throw new PluginError(PLUGIN_NAME, 'Invalid file'); }),
});

// plugin level function (dealing with files)
module.exports = ({ useFilenameAsName = true, ...options } = {}) => (
  through.obj(nodeify((file, enc) => vinylToString(file, enc)
    .then((lua) => lua2js(lua, normalizeOptions(useFilenameAsName, file, options)))
    .then(jsToVinyl(file))))
);

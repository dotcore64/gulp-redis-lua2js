import { callbackify } from 'node:util';

import through from 'through2';
import lua2js from 'redis-lua2js';
import vinylToString from 'vinyl-contents-tostring';
import PluginError from 'plugin-error';

// consts
const PLUGIN_NAME = 'gulp-redis-lua2js';

const jsToVinyl = (file) => (js) => Object.assign(file, {
  extname: '.js',
  contents: file.isBuffer()
    ? Buffer.from(js)
    : file.isStream()
      ? through().end(js)
      : (() => { throw new PluginError(PLUGIN_NAME, 'Invalid file'); })(),
});

// plugin level function (dealing with files)
export default ({ useFilenameAsName = true, name, ...options } = {}) => (
  through.obj(callbackify((file, enc) => vinylToString(file, enc)
    .then((lua) => lua2js(lua, {
      ...options,
      name: typeof name === 'string' && name.length > 0
        ? name
        : useFilenameAsName
          ? file.stem
          : undefined,
    }))
    .then(jsToVinyl(file))))
);

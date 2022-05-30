# gulp-redis-lua2js

[![Build Status][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]

> Convert lua scripts to node modules using [redis-lua2js](https://github.com/dotcore64/redis-lua2js)

## Install

```
$ npm install --save-dev gulp-redis-lua2js
```


## Usage
Convert `pdel.lua` to `pdel.js`:

```js
import gulp from 'gulp';
import lua2js from 'gulp-redis-lua2js';

gulp.task('lua', function() {
  // Backend locales
  return gulp.src('pdel.lua')
  .pipe(lua2js())
  .pipe(gulp.dest('lua'));
});
```

For a real life example, check [redis-pdel](https://github.com/dotcore64/redis-pdel)

## API

### lua2js({ useFilenameAsName, ...options })

Converts the given lua scripts into node modules.

#### useFilenameAsName

Type: `boolean`, default: `true`, if no name was explicitly specified in the options, use the filename (without `lua` extension) as the name of the command when converting

#### options

The options to `lua2js` documented in [redis-lua2js](https://github.com/dotcore64/redis-lua2js)

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

[build-badge]: https://img.shields.io/github/workflow/status/dotcore64/gulp-redis-lua2js/test/master?style=flat-square
[build]: https://github.com/dotcore64/gulp-redis-lua2js/actions

[npm-badge]: https://img.shields.io/npm/v/gulp-redis-lua2js.svg?style=flat-square
[npm]: https://www.npmjs.org/package/gulp-redis-lua2js

[coveralls-badge]: https://img.shields.io/coveralls/dotcore64/gulp-redis-lua2js/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/dotcore64/gulp-redis-lua2js

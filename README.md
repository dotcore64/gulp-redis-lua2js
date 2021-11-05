# gulp-redis-lua2js

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]
[![Dependency Status][dependency-status-badge]][dependency-status]
[![devDependency Status][dev-dependency-status-badge]][dev-dependency-status]

> Convert lua scripts to node modules using [redis-lua2js](https://github.com/dotcore64/redis-lua2js)

## Install

```
$ npm install --save-dev gulp-redis-lua2js
```


## Usage
Convert `pdel.lua` to `pdel.js`:

```js
const gulp = require('gulp');
const lua2js = require('gulp-redis-lua2js');

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

[dependency-status-badge]: https://david-dm.org/dotcore64/gulp-redis-lua2js.svg?style=flat-square
[dependency-status]: https://david-dm.org/dotcore64/gulp-redis-lua2js

[dev-dependency-status-badge]: https://david-dm.org/dotcore64/gulp-redis-lua2js/dev-status.svg?style=flat-square
[dev-dependency-status]: https://david-dm.org/dotcore64/gulp-redis-lua2js#info=devDependencies

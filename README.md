# bookshelf-json-columns

This [Bookshelf.js](https://github.com/tgriesser/bookshelf) plugin enables you to define which model columns have JSON format, preventing manual hook definition for each model with JSON columns.

## Status

[![npm version][npm-image]][npm-url] [![build status][travis-image]][travis-url] [![coverage status][coveralls-image]][coveralls-url]

## Installation

Install the package via `npm`:

```sh
$ npm install --save bookshelf-json-columns
```

## Usage

Require and register the **bookshelf-json-columns** plugin:

```js
var bookshelf = require('bookshelf')(knex);
var jsonColumns = require('bookshelf-json-columns');

bookshelf.plugin(jsonColumns);
```

Define which columns have JSON format with the `jsonColumns` class property:

```js
bookshelf.Model.extend({
  tableName: 'foo'
}, {
  jsonColumns: ['bar', 'biz']
});
```

If you're using ES6 class syntax, define `jsonColumns` as static property:

```js
class Model extends bookshelf.Model {
  get tableName() {
    return 'foo';
  }

  static jsonColumns = ['bar', 'biz'];
}
```

This plugin extends the `initialize` and `save` methods of Bookshelf's `Model`, so if you are also extending or overriding them on your models make sure to call their prototype after your work is done:

```js
bookshelf.Model.extend({
  initialize: function() {
    // Do some stuff.
    store.addModel(this);

    // Call the `initialize` prototype method.
    bookshelf.Model.prototype.initialize.apply(this, arguments);
  },
  save: function() {
    // Do some stuff.
    store.validateModel(this);

    // Call the `save` prototype method.
    bookshelf.Model.prototype.save.apply(this, arguments);
  },
  tableName: 'foo'
}, {
  jsonColumns: ['bar', 'biz']
});
```

## Contributing

Contributions are welcome and greatly appreciated, so feel free to fork this repository and submit pull requests.  

**bookshelf-json-columns** supports PostgreSQL and SQLite3. You can find test suites for each of these database engines in the *test/postgres* and *test/sqlite* folders.

### Setting up

- Fork and clone the **bookshelf-json-columns** repository.
- Duplicate *test/postgres/knexfile.js.dist* and *test/sqlite/knexfile.js.dist* files and update them to your needs.
- Make sure all the tests pass:

```sh
$ npm test
```

### Linting

**bookshelf-json-columns** enforces linting using [ESLint](http://eslint.org/) with the [Seegno-flavored ESLint config](https://github.com/seegno/eslint-config-seegno). We recommend you to install an eslint plugin in your editor of choice, although you can run the linter anytime with:

```sh
$ eslint src test
```

### Pull Request

Please follow these advices to simplify the pull request workflow:

- If you add or enhance functionality, an update of *README.md* usage section should be part of the PR.  
- If your PR fixes a bug you should include tests that at least fail before your code changes and pass after.  
- Keep your branch rebased and fix all conflicts before submitting.  
- Make sure Travis build status is ok.

## License

[MIT](https://opensource.org/licenses/MIT)

[coveralls-image]: https://img.shields.io/coveralls/seegno/bookshelf-json-columns/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/seegno/bookshelf-json-columns?branch=master
[npm-image]: https://img.shields.io/npm/v/bookshelf-json-columns.svg?style=flat-square
[npm-url]: https://npmjs.org/package/bookshelf-json-columns
[travis-image]: https://img.shields.io/travis/seegno/bookshelf-json-columns/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/seegno/bookshelf-json-columns

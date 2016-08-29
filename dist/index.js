'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Stringify JSON columns.
 */

function stringify(model, attributes, options) {
  var _this = this;

  // Do not stringify with `patch` option.
  if (options && options.patch) {
    return;
  }

  this.jsonColumns.forEach(function (column) {
    if (_this.attributes[column]) {
      _this.attributes[column] = (0, _stringify2.default)(_this.attributes[column]);
    }
  });
}

/**
 * Parse JSON columns.
 */

function parse(model, response, options) {
  var _this2 = this;

  // Do not parse with `patch` option.
  if (options && options.patch) {
    return;
  }

  this.jsonColumns.forEach(function (column) {
    if (_this2.attributes[column]) {
      _this2.attributes[column] = JSON.parse(_this2.attributes[column]);
    }
  });
}

/**
 * Export `bookshelf-json-columns` plugin.
 */

exports.default = function (Bookshelf) {
  var Model = Bookshelf.Model.prototype;
  var client = Bookshelf.knex.client.config.client;

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize: function initialize() {
      if (!this.jsonColumns) {
        return Model.initialize.apply(this, arguments);
      }

      // Stringify JSON columns before model is saved.
      this.on('saving', stringify.bind(this));

      // Parse JSON columns after model is saved.
      this.on('saved', parse.bind(this));

      if (client === 'sqlite' || client === 'sqlite3') {
        // Parse JSON columns after model is fetched.
        this.on('fetched', parse.bind(this));
      }

      return Model.initialize.apply(this, arguments);
    },
    save: function save(key, value, options) {
      var _this3 = this;

      if (!this.jsonColumns) {
        return Model.save.apply(this, arguments);
      }

      // Handle arguments as Bookshelf.
      var attributes = void 0;

      if (key === null || (typeof key === 'undefined' ? 'undefined' : (0, _typeof3.default)(key)) === 'object') {
        attributes = key || {};
        options = value ? (0, _extends3.default)({}, value) : {};
      } else {
        (attributes = {})[key] = value;
        options = options ? (0, _extends3.default)({}, options) : {};
      }

      // Only handle arguments with `patch` option.
      if (!options.patch) {
        return Model.save.apply(this, arguments);
      }

      // Stringify JSON columns.
      (0, _keys2.default)(attributes).forEach(function (attribute) {
        if (_this3.jsonColumns.indexOf(attribute) !== -1) {
          attributes[attribute] = (0, _stringify2.default)(attributes[attribute]);
        }
      });

      return Model.save.call(this, attributes, options).then(function (model) {
        // Parse JSON columns.
        (0, _keys2.default)(attributes).forEach(function (attribute) {
          if (_this3.jsonColumns.indexOf(attribute) !== -1) {
            model.attributes[attribute] = JSON.parse(model.attributes[attribute]);
          }
        });

        return model;
      });
    }
  });

  if (client === 'sqlite' || client === 'sqlite3') {
    (function () {
      var Collection = Bookshelf.Collection.prototype;

      Bookshelf.Collection = Bookshelf.Collection.extend({
        initialize: function initialize() {
          if (!this.model.prototype.jsonColumns) {
            return Collection.initialize.apply(this, arguments);
          }

          // Parse JSON columns after collection is fetched.
          this.on('fetched', function (collection) {
            collection.models.forEach(function (model) {
              parse.apply(model);
            });
          });

          return Collection.initialize.apply(this, arguments);
        }
      });
    })();
  }
};

module.exports = exports['default'];
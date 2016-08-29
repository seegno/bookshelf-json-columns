
/**
 * Stringify JSON columns.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function stringify(model, attributes, options) {
  var _this = this;

  // Do not stringify with `patch` option.
  if (options && options.patch) {
    return;
  }

  this.jsonColumns.forEach(function (column) {
    if (_this.attributes[column]) {
      _this.attributes[column] = JSON.stringify(_this.attributes[column]);
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

exports['default'] = function (Bookshelf) {
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
      var attributes = undefined;

      if (key === null || typeof key === 'object') {
        attributes = key || {};
        options = value ? _extends({}, value) : {};
      } else {
        (attributes = {})[key] = value;
        options = options ? _extends({}, options) : {};
      }

      // Only handle arguments with `patch` option.
      if (!options.patch) {
        return Model.save.apply(this, arguments);
      }

      // Stringify JSON columns.
      Object.keys(attributes).forEach(function (attribute) {
        if (_this3.jsonColumns.includes(attribute)) {
          attributes[attribute] = JSON.stringify(attributes[attribute]);
        }
      });

      return Model.save.call(this, attributes, options).then(function (model) {
        // Parse JSON columns.
        Object.keys(attributes).forEach(function (attribute) {
          if (_this3.jsonColumns.includes(attribute)) {
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
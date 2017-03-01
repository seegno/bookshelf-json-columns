'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Stringify JSON columns.
 */

function stringify(model, attributes, options) {
  // Do not stringify with `patch` option.
  if (options && options.patch) {
    return;
  }

  // Mark json columns as stringfied.
  options.parseJsonColumns = true;

  this.constructor.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      this.attributes[column] = JSON.stringify(this.attributes[column]);
    }
  });
}

/**
 * Parse JSON columns.
 */

function parse(model, response) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // Do not parse with `patch` option.
  if (options.patch) {
    return;
  }

  // Do not parse on `fetched` event after saving.
  // eslint-disable-next-line no-underscore-dangle
  if (!options.parseJsonColumns && options.query && options.query._method !== 'select') {
    return;
  }

  this.constructor.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      this.attributes[column] = JSON.parse(this.attributes[column]);
    }
  });
}

/**
 * Export `bookshelf-json-columns` plugin.
 */

exports.default = Bookshelf => {
  const Model = Bookshelf.Model.prototype;
  const client = Bookshelf.knex.client.config.client;
  const parseOnFetch = client === 'sqlite' || client === 'sqlite3' || client === 'mysql';

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize: function initialize() {
      if (!this.constructor.jsonColumns) {
        return Model.initialize.apply(this, arguments);
      }

      // Stringify JSON columns before model is saved.
      this.on('saving', stringify.bind(this));

      // Parse JSON columns after model is saved.
      this.on('saved', parse.bind(this));

      if (parseOnFetch) {
        // Parse JSON columns after model is fetched.
        this.on('fetched', parse.bind(this));
      }

      return Model.initialize.apply(this, arguments);
    },
    save: function save(key, value, options) {
      if (!this.constructor.jsonColumns) {
        return Model.save.apply(this, arguments);
      }

      // Handle arguments as Bookshelf.
      let attributes;

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
      Object.keys(attributes).forEach(attribute => {
        if (this.constructor.jsonColumns.indexOf(attribute) !== -1 && attributes[attribute]) {
          attributes[attribute] = JSON.stringify(attributes[attribute]);
        }
      });

      return Model.save.call(this, attributes, options).then(model => {
        // Parse JSON columns.
        Object.keys(attributes).forEach(attribute => {
          if (this.constructor.jsonColumns.indexOf(attribute) !== -1) {
            model.attributes[attribute] = JSON.parse(model.attributes[attribute]);
          }
        });

        return model;
      });
    }
  });

  if (!parseOnFetch) {
    return;
  }

  const Collection = Bookshelf.Collection.prototype;

  Bookshelf.Collection = Bookshelf.Collection.extend({
    initialize: function initialize() {
      if (!this.model.jsonColumns) {
        return Collection.initialize.apply(this, arguments);
      }

      // Parse JSON columns after collection is fetched.
      this.on('fetched', collection => {
        collection.models.forEach(model => {
          parse.apply(model);
        });
      });

      return Collection.initialize.apply(this, arguments);
    }
  });
};

module.exports = exports['default'];
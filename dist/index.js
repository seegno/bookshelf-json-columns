
/**
 * Stringify JSON columns.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function stringify() {
  var _this = this;

  this.jsonColumns.forEach(function (column) {
    if (_this.attributes[column]) {
      _this.attributes[column] = JSON.stringify(_this.attributes[column]);
    }
  });
}

/**
 * Parse JSON columns.
 */

function parse() {
  var _this2 = this;

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

      if (client === 'sqlite') {
        // Parse JSON columns after model is fetched.
        this.on('fetched', parse.bind(this));
      }

      return Model.initialize.apply(this, arguments);
    }
  });

  if (client === 'sqlite') {
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
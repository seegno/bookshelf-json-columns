
/**
 * Export `bookshelf-json-columns` plugin.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function parse() {
  var _this = this;

  this.jsonColumns.forEach(function (column) {
    if (_this.attributes[column]) {
      _this.attributes[column] = JSON.parse(_this.attributes[column]);
    }
  });
}

function stringify() {
  var _this2 = this;

  this.jsonColumns.forEach(function (column) {
    if (_this2.attributes[column]) {
      _this2.attributes[column] = JSON.stringify(_this2.attributes[column]);
    }
  });
}

exports['default'] = function (Bookshelf) {
  var Model = Bookshelf.Model.prototype;

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize: function initialize() {
      if (!this.jsonColumns) {
        return Model.initialize.apply(this, arguments);
      }

      // Stringify JSON columns before saving.
      this.on('saving', stringify.bind(this));

      // Parse JSON columns after saving and after fetched.
      this.on('saved fetched', parse.bind(this));

      // Parse JSON after collection is fetched.
      this.on('fetched:collection', function (collection) {
        collection.models.forEach(function (model) {
          parse.call(model);
        });
      });

      return Model.initialize.apply(this, arguments);
    }
  });
};

module.exports = exports['default'];

/**
 * Export `bookshelf-json-columns` plugin.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (Bookshelf) {
  var Model = Bookshelf.Model.prototype;

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize: function initialize() {
      var _this = this;

      if (!this.jsonColumns) {
        return Model.initialize.apply(this, arguments);
      }

      // Stringify JSON columns before saving.
      this.on('saving', function () {
        _this.jsonColumns.forEach(function (column) {
          if (_this.attributes[column]) {
            _this.attributes[column] = JSON.stringify(_this.attributes[column]);
          }
        });
      });

      // Parse JSON columns after saving.
      this.on('saved', function () {
        _this.jsonColumns.forEach(function (column) {
          if (_this.attributes[column]) {
            _this.attributes[column] = JSON.parse(_this.attributes[column]);
          }
        });
      });

      return Model.initialize.apply(this, arguments);
    }
  });
};

module.exports = exports['default'];
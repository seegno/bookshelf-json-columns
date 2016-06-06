
/**
 * Export `bookshelf-json-columns` plugin.
 */

function parse() {
  this.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      this.attributes[column] = JSON.parse(this.attributes[column]);
    }
  });
}

function stringify() {
  this.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      this.attributes[column] = JSON.stringify(this.attributes[column]);
    }
  });
}

export default Bookshelf => {
  const Model = Bookshelf.Model.prototype;

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize() {
      if (!this.jsonColumns) {
        return Model.initialize.apply(this, arguments);
      }

      // Stringify JSON columns before saving.
      this.on('saving', stringify.bind(this));

      // Parse JSON columns after saving and after fetched.
      this.on('saved fetched', parse.bind(this));

      // Parse JSON after collection is fetched.
      this.on('fetched:collection', collection => {
        collection.models.forEach(model => {
          parse.apply(model);
        });
      });

      return Model.initialize.apply(this, arguments);
    }
  });
}


/**
 * Export `bookshelf-json-columns` plugin.
 */

export default Bookshelf => {
  const Model = Bookshelf.Model.prototype;

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize() {
      if (!this.jsonColumns) {
        return Model.initialize.apply(this, arguments);
      }

      // Stringify JSON columns before saving.
      this.on('saving', () => {
        this.jsonColumns.forEach(column => {
          if (this.attributes[column]) {
            this.attributes[column] = JSON.stringify(this.attributes[column]);
          }
        });
      });

      // Parse JSON columns after saving.
      this.on('saved', () => {
        this.jsonColumns.forEach(column => {
          if (this.attributes[column]) {
            this.attributes[column] = JSON.parse(this.attributes[column]);
          }
        });
      });

      return Model.initialize.apply(this, arguments);
    }
  });
}

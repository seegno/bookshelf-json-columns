
/**
 * Stringify JSON columns.
 */

function stringify() {
  this.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      this.attributes[column] = JSON.stringify(this.attributes[column]);
    }
  });
}

/**
 * Parse JSON columns.
 */

function parse() {
  this.jsonColumns.forEach(column => {
    if (this.attributes[column]) {
      this.attributes[column] = JSON.parse(this.attributes[column]);
    }
  });
}

/**
 * Export `bookshelf-json-columns` plugin.
 */

export default Bookshelf => {
  const Model = Bookshelf.Model.prototype;
  const client = Bookshelf.knex.client.config.client;

  Bookshelf.Model = Bookshelf.Model.extend({
    initialize() {
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
    const Collection = Bookshelf.Collection.prototype;

    Bookshelf.Collection = Bookshelf.Collection.extend({
      initialize() {
        if (!this.model.prototype.jsonColumns) {
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
  }
}

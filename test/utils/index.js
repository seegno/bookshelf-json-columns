
/**
 * Export `clearTable`.
 */

export function clearTable(repository) {
  return repository.knex('test').del();
}

/**
* Export `dropTable`.
*/

export function dropTable(repository) {
  return repository.knex.schema.dropTable('test');
}

/**
 * Export `recreateTable`.
 */

export function recreateTable(repository) {
  return repository.knex.schema
    .dropTableIfExists('test')
    .createTable('test', table => {
      table.increments('id').primary();
      table.json('foo');
      table.string('qux');
    });
}

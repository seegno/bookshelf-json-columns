
/**
 * Module dependencies.
 */

import bookshelf from 'bookshelf';
import jsonColumns from '../src';
import knex from 'knex';
import knexfile from './knexfile';
import should from 'should';
import sinon from 'sinon';

/**
 * Test `bookshelf-json-columns` plugin.
 */

describe('bookshelf-json-columns', () => {
  const repository = bookshelf(knex(knexfile));
  const ModelPrototype = repository.Model.prototype;

  repository.plugin(jsonColumns);

  before(async () => {
    await repository.knex.schema.dropTableIfExists('test');
    await repository.knex.schema.createTable('test', (table) => {
      table.increments('id').primary();
      table.json('foo');
      table.string('qux');
    });
  });

  after(async () => {
    await repository.knex.schema.dropTable('test');
  });

  describe('if a json column is not registered', () => {
    const Model = repository.Model.extend({ tableName: 'test' });

    it('should throw an error on create', async () => {
      try {
        await Model.forge().save({ foo: ['bar'] });
      } catch(e) {
        e.should.be.instanceOf(Error);
        e.code.should.equal('22P02');
        e.routine.should.equal('report_parse_error');
      }
    });

    it('should throw an error creating through a collection', async () => {
      const Collection = repository.Collection.extend({ model: Model });
      const collection = Collection.forge();

      try {
        await collection.create(Model.forge({ foo: ['bar'] }));
      } catch(e) {
        e.should.be.instanceOf(Error);
        e.code.should.equal('22P02');
        e.routine.should.equal('report_parse_error');
      }
    });

    it('should throw an error on update', async () => {
      const model = await Model.forge().save();

      try {
        await model.save({ foo: ['bar'] });
      } catch(e) {
        e.should.be.instanceOf(Error);
        e.code.should.equal('22P02');
        e.routine.should.equal('report_parse_error');
      }
    });

    it('should not override the prototype initialize method', async () => {
      sinon.spy(ModelPrototype, 'initialize');

      await Model.forge().save();

      ModelPrototype.initialize.callCount.should.equal(1);

      sinon.restore(ModelPrototype);
    });
  });

  describe('if a json column is registered', () => {
    const Model = repository.Model.extend({ jsonColumns: ['foo'], tableName: 'test' });

    it('should keep the json format on create', async () => {
      const model = await Model.forge().save({ foo: ['bar'] });

      model.get('foo').should.eql(['bar']);
    });

    it('should keep the json format creating through a collection', async () => {
      const Collection = repository.Collection.extend({ model: Model });
      const collection = Collection.forge();

      await collection.create(Model.forge({ foo: ['bar'] }));

      collection.at(0).get('foo').should.eql(['bar']);
    });

    it('should keep a null value on create', async () => {
      const model = await Model.forge().save();

      should(model.get('foo')).be.undefined();
    });

    it('should keep the json format on update', async () => {
      const model = await Model.forge().save();

      await model.save({ foo: ['bar'] });

      model.get('foo').should.eql(['bar']);
    });

    it('should keep a null value on update', async () => {
      const model = await Model.forge().save();

      await model.save();

      should(model.get('foo')).be.undefined();
    });

    it('should keep the json format when updating other columns', async () => {
      const model = await Model.forge().save({ foo: ['bar'] });

      await model.save({ qux: 'qix' }, { patch: true });

      model.get('foo').should.eql(['bar']);
    });

    it('should not override the prototype initialize method', async () => {
      sinon.spy(ModelPrototype, 'initialize');

      await Model.forge().save();

      ModelPrototype.initialize.callCount.should.equal(1);

      sinon.restore(ModelPrototype);
    });
  });
});

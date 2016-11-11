
/**
 * Module dependencies.
 */

import { clearTable, dropTable, recreateTable } from '../utils';
import bookshelf from 'bookshelf';
import jsonColumns from '../../src';
import knex from 'knex';
import knexfile from './knexfile';
import should from 'should';
import sinon from 'sinon';

/**
 * Test `bookshelf-json-columns` plugin with SQLite client.
 */

describe('with SQLite client', () => {
  const repository = bookshelf(knex(knexfile));
  const CollectionPrototype = repository.Collection.prototype;
  const ModelPrototype = repository.Model.prototype;

  repository.plugin(jsonColumns);

  before(async () => {
    await recreateTable(repository);
  });

  afterEach(async () => {
    await clearTable(repository);
  });

  after(async () => {
    await dropTable(repository);
  });

  describe('when a JSON column is not registered', () => {
    const Model = repository.Model.extend({ tableName: 'test' });

    it('should not save a valid JSON value on create', async () => {
      const model = await Model.forge().save({ foo: ['bar'] });
      const fetched = await Model.forge({ id: model.get('id') }).fetch();

      should(fetched.get('foo')).be.null();
    });

    it('should not save a valid JSON value creating through a collection', async () => {
      const Collection = repository.Collection.extend({ model: Model });
      const collection = Collection.forge();

      await collection.create(Model.forge({ foo: ['bar'] }));

      const fetched = await Collection.forge().fetch();

      should(fetched.at(0).get('foo')).be.null();
    });

    it('should not save a valid JSON value on update', async () => {
      const model = await Model.forge().save();

      await model.save({ foo: ['bar'] });

      const fetched = await Model.forge({ id: model.get('id') }).fetch();

      should(fetched.get('foo')).be.null();
    });

    it('should not parse a JSON value on fetch', async () => {
      const model = await Model.forge().save({ foo: JSON.stringify(['bar']) });

      await model.refresh();

      model.get('foo').should.equal(JSON.stringify(['bar']));
    });

    it('should not override model prototype initialize method', async () => {
      sinon.spy(ModelPrototype, 'initialize');

      Model.forge();

      ModelPrototype.initialize.callCount.should.equal(1);

      sinon.restore(ModelPrototype);
    });

    it('should not override collection prototype initialize method', async () => {
      const Collection = repository.Collection.extend({ model: Model });

      sinon.spy(CollectionPrototype, 'initialize');

      Collection.forge({});

      CollectionPrototype.initialize.callCount.should.equal(1);

      sinon.restore(CollectionPrototype);
    });
  });

  describe('when a JSON column is registered', () => {
    const Model = repository.Model.extend({ tableName: 'test' }, { jsonColumns: ['foo'] });

    it('should keep a JSON value on create', async () => {
      const model = await Model.forge().save({ foo: ['bar'] });
      const fetched = await Model.forge({ id: model.get('id') }).fetch();

      fetched.get('foo').should.eql(['bar']);
    });

    it('should keep the JSON value using save with a key and value', async () => {
      const model = await Model.forge().save('foo', ['bar'], { method: 'insert' });

      model.get('foo').should.eql(['bar']);
    });

    it('should keep a JSON value when creating through a collection', async () => {
      const Collection = repository.Collection.extend({ model: Model });
      const collection = Collection.forge();

      await collection.create(Model.forge({ foo: ['bar'] }));

      const fetched = await Collection.forge().fetch();

      fetched.at(0).get('foo').should.eql(['bar']);
    });

    it('should keep a null value on create', async () => {
      const model = await Model.forge().save();
      const fetched = await Model.forge({ id: model.get('id') }).fetch();

      should(fetched.get('foo')).be.null();
    });

    it('should keep a JSON value on update', async () => {
      const model = await Model.forge().save();

      await model.save({ foo: ['bar'] });

      const fetched = await Model.forge({ id: model.get('id') }).fetch();

      fetched.get('foo').should.eql(['bar']);
    });

    it('should keep a null value on update', async () => {
      const model = await Model.forge().save();

      await model.save();

      const fetched = await Model.forge({ id: model.get('id') }).fetch();

      should(fetched.get('foo')).be.null();
    });

    it('should not stringify null values on update with `patch` option', async () => {
      sinon.spy(ModelPrototype, 'save');

      const model = await Model.forge().save();

      await model.save({ foo: null }, { patch: true });

      ModelPrototype.save.callCount.should.equal(2);
      ModelPrototype.save.secondCall.args[0].should.eql({ foo: null });

      sinon.restore(ModelPrototype);
    });

    it('should keep a JSON value when updating with `patch` option', async () => {
      const model = await Model.forge().save();

      await model.save({ foo: ['bar'] }, { patch: true });

      model.get('foo').should.eql(['bar']);
    });

    it('should keep a JSON value when updating other columns', async () => {
      const model = await Model.forge().save({ foo: ['bar'] });

      await model.save({ qux: 'qix' }, { patch: true });

      const fetched = await Model.forge({ id: model.get('id') }).fetch();

      fetched.get('foo').should.eql(['bar']);
    });

    it('should keep a JSON value on fetch', async () => {
      const model = await Model.forge().save({ foo: ['bar'] });

      await model.refresh();

      model.get('foo').should.eql(['bar']);
    });

    it('should keep a JSON value when updating through query', async () => {
      const model = await Model.forge().save({ foo: ['bar'] });

      model.query().update({ qux: 'qix' });

      await model.refresh();

      model.get('foo').should.eql(['bar']);
    });

    it('should not override model prototype initialize method', async () => {
      sinon.spy(ModelPrototype, 'initialize');

      Model.forge();

      ModelPrototype.initialize.callCount.should.equal(1);

      sinon.restore(ModelPrototype);
    });

    it('should not override collection prototype initialize method', async () => {
      const Collection = repository.Collection.extend({ model: Model });

      sinon.spy(CollectionPrototype, 'initialize');

      Collection.forge();

      CollectionPrototype.initialize.callCount.should.equal(1);

      sinon.restore(CollectionPrototype);
    });
  });
});

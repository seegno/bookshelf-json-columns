
/**
 * Module dependencies.
 */

import { dropTable, recreateTable } from '../utils';
import bookshelf from 'bookshelf';
import jsonColumns from '../../src';
import knex from 'knex';
import knexfile from './knexfile';
import should from 'should';
import sinon from 'sinon';

/**
 * Test `bookshelf-json-columns` plugin with MySQL client.
 */

describe('with MySQL client', () => {
  const repository = bookshelf(knex(knexfile));
  const ModelPrototype = repository.Model.prototype;

  repository.plugin(jsonColumns);

  before(async () => {
    await recreateTable(repository);
  });

  after(async () => {
    await dropTable(repository);
  });

  describe('when a JSON column is not registered', () => {
    const Model = repository.Model.extend({ tableName: 'test' });

    it('should throw an error on create', async () => {
      try {
        await Model.forge().save({ foo: { bar: 'baz' } });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Error);
        e.code.should.equal('ER_BAD_FIELD_ERROR');
      }
    });

    it('should throw an error creating through a collection', async () => {
      const Collection = repository.Collection.extend({ model: Model });
      const collection = Collection.forge();

      try {
        await collection.create(Model.forge({ foo: { bar: 'baz' } }));

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Error);
        e.code.should.equal('ER_BAD_FIELD_ERROR');
      }
    });

    it('should throw an error on update', async () => {
      const model = await Model.forge().save();

      try {
        await model.save({ foo: { bar: 'baz' } });

        should.fail();
      } catch (e) {
        e.should.be.instanceOf(Error);
        e.code.should.equal('ER_BAD_FIELD_ERROR');
      }
    });

    it('should not override model prototype initialize method', async () => {
      sinon.spy(ModelPrototype, 'initialize');

      Model.forge();

      ModelPrototype.initialize.callCount.should.equal(1);

      sinon.restore(ModelPrototype);
    });
  });

  describe('when a JSON column is registered', () => {
    const Model = repository.Model.extend({ tableName: 'test' }, { jsonColumns: ['foo'] });

    it('should keep a JSON value on create', async () => {
      const model = await Model.forge().save({ foo: { bar: 'baz' } });

      model.get('foo').should.eql({ bar: 'baz' });
    });

    it('should keep a JSON value using save with a key and value', async () => {
      const model = await Model.forge().save('foo', { bar: 'baz' }, { method: 'insert' });

      model.get('foo').should.eql({ bar: 'baz' });
    });

    it('should keep a JSON value when creating through a collection', async () => {
      const Collection = repository.Collection.extend({ model: Model });
      const collection = Collection.forge();

      await collection.create(Model.forge({ foo: { bar: 'baz' } }));

      collection.at(0).get('foo').should.eql({ bar: 'baz' });
    });

    it('should keep a null value on create', async () => {
      const model = await Model.forge().save();

      should(model.get('foo')).be.null();
    });

    it('should keep a JSON value on update', async () => {
      const model = await Model.forge().save();

      await model.save({ foo: { bar: 'baz' } });

      model.get('foo').should.eql({ bar: 'baz' });
    });

    it('should keep a null value on update', async () => {
      const model = await Model.forge().save();

      await model.save();

      should(model.get('foo')).be.null();
    });

    it('should not stringify null values on update with `patch` option', async () => {
      sinon.spy(ModelPrototype, 'save');

      const model = await Model.forge().save();

      await model.save({ foo: null }, { patch: true });

      ModelPrototype.save.callCount.should.equal(2);
      ModelPrototype.save.secondCall.args[0].should.eql({ foo: null });

      sinon.restore(ModelPrototype);
    });

    it('should keep an empty string on update with `patch` option', async () => {
      sinon.spy(ModelPrototype, 'save');

      const model = await Model.forge().save();

      await model.save({ foo: '' }, { patch: true });

      model.get('foo').should.equal('');
    });

    it('should keep a JSON value when updating with `patch` option', async () => {
      const model = await Model.forge().save();

      await model.save({ foo: { bar: 'baz' } }, { patch: true });

      model.get('foo').should.eql({ bar: 'baz' });
    });

    it('should keep a JSON value when updating other columns', async () => {
      const model = await Model.forge().save({ foo: { bar: 'baz' } });

      await model.save({ qux: 'qix' }, { patch: true });

      model.get('foo').should.eql({ bar: 'baz' });
    });

    it('should keep a JSON value on fetch', async () => {
      await Model.forge().save({ foo: { bar: 'baz' }, qux: 'qix' });

      const model = await Model.forge({ qux: 'qix' }).fetch();

      model.get('foo').should.eql({ bar: 'baz' });
    });

    it('should keep a JSON value when updating through query', async () => {
      const model = await Model.forge().save({ foo: { bar: 'baz' } });

      model.query().update({ qux: 'qix' });

      await model.refresh();

      model.get('foo').should.eql({ bar: 'baz' });
    });

    it('should not override model initialize method', async () => {
      sinon.spy(ModelPrototype, 'initialize');

      Model.forge();

      ModelPrototype.initialize.callCount.should.equal(1);

      sinon.restore(ModelPrototype);
    });
  });
});

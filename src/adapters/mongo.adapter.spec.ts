import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { QueryModel } from '../models/query-model';
import { MongoAdapter } from './mongo.adapter';

describe('MongoAdapter', () => {

  var sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('run should return a single object', (done) => {
    let subject = new MongoAdapter({mongoUri: '', options: {}});
    let collection = (_: string) => ({ find: (_: any) => ({ toArray: () => ([{}]) }) });
    subject.client = <any>{ collection: collection }
    sandbox.stub(subject, 'openConnection').returns(Promise.resolve());
    subject.run(new QueryModel()).then(result => {
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('run should sort objects in ascending order', (done) => {
    let subject = new MongoAdapter({mongoUri: '', options: {}});
    let result = [{"title": "a"},{"title": "b"}];
    let collection = (_: string) => ({ find: (_: any) => ({ toArray: () => (result) }) });
    subject.client = <any>{ collection: collection }
    sandbox.stub(subject, 'openConnection').returns(Promise.resolve());
    let query = new QueryModel();
    query.sort = { key: 'title' };
    subject.run(query).then(result => {
      expect(result[0].title).to.equal('a');
      done();
    });
  });

  it('run should sort objects in descending order', (done) => {
    let subject = new MongoAdapter({mongoUri: '', options: {}});
    let result = [{"title": "a"},{"title": "b"}];
    let collection = (_: string) => ({ find: (_: any) => ({ toArray: () => (result) }) });
    subject.client = <any>{ collection: collection }
    sandbox.stub(subject, 'openConnection').returns(Promise.resolve());
    let query = new QueryModel();
    query.sort = { key: 'title', descending: true };
    subject.run(query).then(result => {
      expect(result[0].title).to.equal('b');
      done();
    });
  });

  it('run should limit result length', (done) => {
    let subject = new MongoAdapter({mongoUri: '', options: {}});
    let result = [{"title": "a"},{"title": "b"}];
    let collection = (_: string) => ({ find: (_: any) => ({ toArray: () => (result) }) });
    subject.client = <any>{ collection: collection }
    sandbox.stub(subject, 'openConnection').returns(Promise.resolve());
    let query = new QueryModel();
    query.limit = 1;
    subject.run(query).then(result => {
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('run should not limit results if limit is greater than length', (done) => {
    let subject = new MongoAdapter({mongoUri: '', options: {}});
    let result = [{"title": "a"},{"title": "b"}];
    let collection = (_: string) => ({ find: (_: any) => ({ toArray: () => (result) }) });
    subject.client = <any>{ collection: collection }
    sandbox.stub(subject, 'openConnection').returns(Promise.resolve());
    let query = new QueryModel();
    query.limit = 3;
    subject.run(query).then(result => {
      expect(result.length).to.equal(2);
      done();
    });
  });

});
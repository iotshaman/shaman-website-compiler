import 'mocha';
import * as sinon from 'sinon';
import * as http from 'http';
import * as https from 'https';
import { expect } from 'chai';
import { HttpAdapter } from './http.adapter';
import { QueryModel } from '../models/query-model';

describe('HttpAdapter', () => {

  var sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('openConnection should return empty promise', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    adapter.openConnection().then(done);
  });

  it('run should return an error if the request returns an error', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let request = { on: (_: string, cb: any) => cb(new Error("testing")) };
    sandbox.stub(http, 'get').returns(<any>request);
    adapter.run(new QueryModel()).catch(_ => done());
  });

  it('run should return an error if response code < 200', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let response = { statusCode: 100 };
    sandbox.stub(http, 'get').yields(response);
    adapter.run(new QueryModel()).catch(_ => done());
  });

  it('run should return an error if response code > 299', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let response = { statusCode: 400 };
    sandbox.stub(http, 'get').yields(response);
    adapter.run(new QueryModel()).catch(_ => done());
  });

  it('run (http) should return an object', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let response = { statusCode: 200, on: sandbox.stub() };
    response.on.withArgs('data').yields('[{}]');
    response.on.withArgs('end').yields(null);
    sandbox.stub(http, 'get').yields(response);
    adapter.run(new QueryModel()).then(result => {
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('run (https) should return an object', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: 'https://localhost/'});
    let response = { statusCode: 200, on: sandbox.stub() };
    response.on.withArgs('data').yields('[{}]');
    response.on.withArgs('end').yields(null);
    sandbox.stub(https, 'get').yields(response);
    adapter.run(new QueryModel()).then(result => {
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('run (https) should use query.args.name to return object', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: 'https://localhost/'});
    let response = { statusCode: 200, on: sandbox.stub() };
    response.on.withArgs('data').yields('{"products": [{}]}');
    response.on.withArgs('end').yields(null);
    sandbox.stub(https, 'get').yields(response);
    let query = new QueryModel();
    query.args = {name: 'products'};
    adapter.run(query).then(result => {
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('run should sort objects in ascending order', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let response = { statusCode: 200, on: sandbox.stub() };
    response.on.withArgs('data').yields('[{"title": "a"},{"title": "b"}]');
    response.on.withArgs('end').yields(null);
    sandbox.stub(http, 'get').yields(response);
    let query = new QueryModel();
    query.sort = { key: 'title' };
    adapter.run(query).then(result => {
      expect(result[0].title).to.equal('a');
      done();
    });
  });

  it('run should sort objects in descending order', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let response = { statusCode: 200, on: sandbox.stub() };
    response.on.withArgs('data').yields('[{"title": "a"},{"title": "b"}]');
    response.on.withArgs('end').yields(null);
    sandbox.stub(http, 'get').yields(response);
    let query = new QueryModel();
    query.sort = { key: 'title', descending: true };
    adapter.run(query).then(result => {
      expect(result[0].title).to.equal('b');
      done();
    });
  });

  it('run should limit result length', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let response = { statusCode: 200, on: sandbox.stub() };
    response.on.withArgs('data').yields('[{"title": "a"},{"title": "b"}]');
    response.on.withArgs('end').yields(null);
    sandbox.stub(http, 'get').yields(response);
    let query = new QueryModel();
    query.limit = 1;
    adapter.run(query).then(result => {
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('run should not limit results if limit is greater than length', (done) => {
    let adapter = new HttpAdapter({apiBaseUri: '/'});
    let response = { statusCode: 200, on: sandbox.stub() };
    response.on.withArgs('data').yields('[{"title": "a"},{"title": "b"}]');
    response.on.withArgs('end').yields(null);
    sandbox.stub(http, 'get').yields(response);
    let query = new QueryModel();
    query.limit = 3;
    adapter.run(query).then(result => {
      expect(result.length).to.equal(2);
      done();
    });
  });

});
import 'mocha';
import { expect } from 'chai';
import { JsonRepoAdapter } from './json-repo.adapter';
import { QueryModel } from '../models/query-model';

describe('JsonRepoAdapter', () => {

  let adapter: MockJsonRepoAdapter;

  beforeEach(() => {
    adapter = new MockJsonRepoAdapter(["blog"]);
    adapter.add('blog', 'blog1', {title: 'blog1', content: 'Blog #1'});
    adapter.add('blog', 'blog2', {title: 'blog2', content: 'Blog #2'});
    adapter.save();
  })

  it('run should return all blog objects', (done) => {
    let query = new QueryModel();
    query.path = 'blog';
    adapter.run(query).then(rslt => {
      expect(rslt.length).to.equal(2);
      done();
    })
  });

  it('run should return filtered blog objects', (done) => {
    let query = new QueryModel();
    query.path = 'blog';
    query.args = ["title", "blog2"];
    adapter.run(query).then(rslt => {
      expect(rslt.length).to.equal(1);
      done();
    })
  });

  it('run should sort object in ascending order', (done) => {
    let query = new QueryModel();
    query.path = 'blog';
    query.sort = { key: 'title' };
    adapter.run(query).then(rslt => {
      expect(rslt[0].title).to.equal('blog1');
      done();
    })
  });

  it('run should sort object in descending order', (done) => {
    let query = new QueryModel();
    query.path = 'blog';
    query.sort = { key: 'title', descending: true };
    adapter.run(query).then(rslt => {
      expect(rslt[0].title).to.equal('blog2');
      done();
    })
  });

  it('run should limit objects', (done) => {
    let query = new QueryModel();
    query.path = 'blog';
    query.limit = 1;
    adapter.run(query).then(rslt => {
      expect(rslt.length).to.equal(1);
      done();
    })
  });

  it('run should not limit objects of limit is greater than length', (done) => {
    let query = new QueryModel();
    query.path = 'blog';
    query.limit = 3;
    adapter.run(query).then(rslt => {
      expect(rslt.length).to.equal(2);
      done();
    })
  });

});

class MockJsonRepoAdapter extends JsonRepoAdapter {

  constructor(models: string[]) {
    super({dataPath: null, models: models});
  }

  add = (model: string, key: string, data: any) => {
    this.context.models[model].add(key, data);
  }

  save = (): Promise<void> => {
    return this.context.saveChanges();
  }

}
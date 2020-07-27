import 'mocha';
import { expect } from 'chai';
import { RequireAdapter } from './adapter.functions';
import { AdapterConfig } from '../models';
import { JsonRepoAdapter } from '../adapters';

describe('AdapterFunctions', () => {

  it('RequireAdapter should return JsonRepoAdapter', () => {
    let adapter = new AdapterConfig();
    adapter.module = '../adapters/json-repo.adapter';
    adapter.name = "JsonRepoAdapter";
    adapter.configuration = { models: [] };
    var result = RequireAdapter(adapter);
    expect(result instanceof JsonRepoAdapter).to.be.true;
  })

});
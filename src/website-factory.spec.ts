import 'mocha';
import { expect } from 'chai';
import { IoC } from './composition/app.composition';
import { WebsiteFactory } from './website-factory';
import { WebsiteConfig, AdapterConfig } from './models';
import { Website } from './website';

describe('ShamanFactory', () => {

  beforeEach(() => {
    IoC.snapshot();
  });

  afterEach(() => {
    IoC.restore();
  });

  it('ShamanFactory should return a website', () => {
    let adapter = new AdapterConfig();
    adapter.module = '../adapters/json-repo.adapter';
    adapter.name = "JsonRepoAdapter";
    adapter.configuration = { models: [] };
    let subject = WebsiteFactory(new WebsiteConfig({adapter}));
    expect(subject instanceof Website).to.be.true;
  });

});
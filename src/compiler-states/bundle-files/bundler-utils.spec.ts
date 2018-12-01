import 'mocha';
import * as sinon from 'sinon';
import { expect }  from 'chai';
import 'sinon-chai';

import { BundlerUtils, BundleSpec } from './bundler-utils';
import { CompilerData } from '../../compiler/compiler-data.model';
import { FileData } from '../../files';

describe('Bundler Utils', () => {

  let utils = BundlerUtils;

  it('GetBundleSpecsFromConfig should return empty array if no html files', () => {
    let data = new CompilerData({});
    data.files = [
      {name: 'index.css', contents: '', type: 'css'}
    ]
    let subject = utils.GetBundleSpecsFromConfig(data);
    expect(subject.length).to.equal(0);
  });

  it('GetBundleSpecsFromConfig should return empty array if no data in html files', () => {
    let data = new CompilerData({});
    data.files = [
      {name: 'index.html', contents: '', type: 'html'}
    ]
    let subject = utils.GetBundleSpecsFromConfig(data);
    expect(subject.length).to.equal(0);
  });

  it('GetBundleSpecsFromConfig should return empty array if no shaman configs found', () => {
    let data = new CompilerData({});
    data.files = [
      {name: 'index.html', contents: '', type: 'html', data: {}}
    ]
    let subject = utils.GetBundleSpecsFromConfig(data);
    expect(subject.length).to.equal(0);
  });

  it('GetBundleSpecsFromConfig should return empty array if no shaman bundles found', () => {
    let data = new CompilerData({});
    data.files = [
      {name: 'index.html', contents: '', type: 'html', data: { shaman: { bundles: [] } }}
    ]
    let subject = utils.GetBundleSpecsFromConfig(data);
    expect(subject.length).to.equal(0);
  });

  it('GetBundleSpecsFromConfig should return empty array if no shaman bundles found', () => {
    let data = new CompilerData({});
    let bundle: BundleSpec = { name: 'index.bundle', type: 'css', files: []}
    data.files = [
      {name: 'index.html', contents: '', type: 'html', data: { shaman: { bundles: [bundle] } }}
    ]
    let subject = utils.GetBundleSpecsFromConfig(data);
    expect(subject.length).to.equal(1);
  });

  it('LoadBundleContent should return file bundle with correct name', () => {
    let bundle: BundleSpec = { name: 'index.bundle', type: 'css', files: ["index.css"]};
    let file: FileData = { name: 'index.css', contents: '', type: 'css' };
    let subject = utils.LoadBundleContent([bundle], 'css', [file]);
    expect(subject.length).to.equal(1);
    expect(subject[0].name).to.equal('index.bundle.min.css');
  });

  it('LoadBundleContent should throw error if file in bundle spec not found', (done) => {
    try {
      let bundle: BundleSpec = { name: 'index.bundle', type: 'css', files: ["index.css"]};
      let subject = utils.LoadBundleContent([bundle], 'css', []);
    } catch(ex) {
      expect(ex.message).to.equal("Bundler: File not found - 'index.css'");
      done();
    }
  })

})
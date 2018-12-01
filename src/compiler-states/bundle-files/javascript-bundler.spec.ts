import 'mocha';
import * as sinon from 'sinon';
import { expect }  from 'chai';
import 'sinon-chai';

import { IOC, IOC_TYPES } from '../../inversify';
import { IFileCompressor, FileCompressor, FileData } from '../../files';
import { CompilerData } from '../../compiler/compiler-data.model';
import { JavascriptBundler } from './javascript-bundler';

describe('Javascript Bundler', () => {

  let compressor;

  beforeEach(() => {
    IOC.snapshot();
    compressor = sinon.createStubInstance(FileCompressor);
  });

  afterEach(() => {
    IOC.restore();
  });

  it('Should be created', () => {
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).to(FileCompressor);
    let jsCompressor = new JavascriptBundler();
    expect(jsCompressor).not.to.be.null;
  });

  it('Process should add minified file to compiler data', (done) => {
    compressor.BundleJs = sinon.stub();
    compressor.BundleJs.returns(new Promise((res) => { res('') }));
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).toConstantValue(compressor);
    let jsCompressor = new JavascriptBundler();
    jsCompressor.OnStateChange((data: CompilerData) => {
      expect(data.files.length).to.equal(4);
      done();
    });
    let compilerData = new CompilerData({});
    compilerData.files = [
      {name: 'index.html', contents: '', type: 'html', data: SampleBundleConfig},
      {name: 'index.js', contents: '', type: 'js'},
      {name: 'blog.js', contents: '', type: 'js'}
    ]
    jsCompressor.Process(compilerData);
  });

  it('Process should bubble errors', (done) => {
    compressor.BundleJs = sinon.stub();
    compressor.BundleJs.returns(new Promise((res, err) => { err("error") }));
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).toConstantValue(compressor);
    let jsCompressor = new JavascriptBundler();
    jsCompressor.OnCompilerError((error: Error) => {
      expect(error.message).to.equal("error");
      done();
    })
    let compilerData = new CompilerData({});
    compilerData.files = [
      {name: 'index.html', contents: '', type: 'html', data: SampleBundleConfig},
      {name: 'index.js', contents: '', type: 'js'},
      {name: 'blog.js', contents: '', type: 'js'}
    ]
    jsCompressor.Process(compilerData);
  });

});

const SampleBundleConfig = {
  "shaman": {
    "bundles": [
      {
        "name": "index.bundle",
        "type": "js",
        "files": [
          "index.js",
          "blog.js"
        ]
      }
    ]
  }
}
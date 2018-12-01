import 'mocha';
import * as sinon from 'sinon';
import { expect }  from 'chai';
import 'sinon-chai';

import { IOC, IOC_TYPES } from '../../inversify';
import { IFileCompressor, FileCompressor, FileData } from '../../files';
import { CompilerData } from '../../compiler/compiler-data.model';
import { CssBundler } from './css-bundler';

describe('Css Bundler', () => {

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
    let jsCompressor = new CssBundler();
    expect(jsCompressor).not.to.be.null;
  });

  it('Process should add minified file to compiler data', (done) => {
    compressor.BundleCss = sinon.stub();
    compressor.BundleCss.returns(new Promise((res) => { res('') }));
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).toConstantValue(compressor);
    let jsCompressor = new CssBundler();
    jsCompressor.OnStateChange((data: CompilerData) => {
      expect(data.files.length).to.equal(4);
      done();
    });
    let compilerData = new CompilerData({});
    compilerData.files = [
      {name: 'index.html', contents: '', type: 'html', data: SampleBundleConfig},
      {name: 'index.css', contents: '', type: 'css'},
      {name: 'blog.css', contents: '', type: 'css'}
    ]
    jsCompressor.Process(compilerData);
  });

  it('Process should bubble errors', (done) => {
    compressor.BundleCss = sinon.stub();
    compressor.BundleCss.returns(new Promise((res, err) => { err("error") }));
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).toConstantValue(compressor);
    let jsCompressor = new CssBundler();
    jsCompressor.OnCompilerError((error: Error) => {
      expect(error.message).to.equal("error");
      done();
    })
    let compilerData = new CompilerData({});
    compilerData.files = [
      {name: 'index.html', contents: '', type: 'html', data: SampleBundleConfig},
      {name: 'index.css', contents: '', type: 'css'},
      {name: 'blog.css', contents: '', type: 'css'}
    ]
    jsCompressor.Process(compilerData);
  });

});

const SampleBundleConfig = {
  "shaman": {
    "bundles": [
      {
        "name": "index.bundle",
        "type": "css",
        "files": [
          "index.css",
          "blog.css"
        ]
      }
    ]
  }
}
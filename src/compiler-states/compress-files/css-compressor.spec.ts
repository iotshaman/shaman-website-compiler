import 'mocha';
import * as sinon from 'sinon';
import { expect }  from 'chai';
import 'sinon-chai';

import { IOC, IOC_TYPES } from '../../inversify';
import { IFileCompressor, FileCompressor, FileData } from '../../files';
import { CompilerData } from '../../compiler/compiler-data.model';
import { CssCompressor } from './css-compressor';

describe('Css Compressor', () => {

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
    let cssCompressor = new CssCompressor();
    expect(cssCompressor).not.to.be.null;
  });

  it('Process should do nothing if minify command not present', (done) => {
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).to(FileCompressor);
    let cssCompressor = new CssCompressor();
    cssCompressor.OnStateChange((data: CompilerData) => {
      expect(data.files.length).to.equal(0);
      done();
    })
    let compilerData = new CompilerData({});
    cssCompressor.Process(compilerData);    
  });

  it('Process should add minified file to compiler data', (done) => {
    compressor.MinifyCss = sinon.stub();
    compressor.MinifyCss.returns(new Promise((res) => { res('') }));
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).toConstantValue(compressor);
    let cssCompressor = new CssCompressor();
    cssCompressor.OnStateChange((data: CompilerData) => {
      expect(data.files.length).to.equal(2);
      expect(data.files[1].type).to.equal('min.css');
      done();
    })
    let compilerData = new CompilerData({minify: true});
    compilerData.files = [{name: 'test.css', contents: '', type: 'css'}]
    cssCompressor.Process(compilerData);
  });

  it('Process should bubble errors', (done) => {
    compressor.MinifyCss = sinon.stub();
    compressor.MinifyCss.returns(new Promise((res, err) => { err("error") }));
    IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).toConstantValue(compressor);
    let cssCompressor = new CssCompressor();
    cssCompressor.OnCompilerError((error: Error) => {
      expect(error.message).to.equal("error");
      done();
    })
    let compilerData = new CompilerData({minify: true});
    compilerData.files = [{name: 'test.css', contents: '', type: 'css'}]
    cssCompressor.Process(compilerData);
  })

});
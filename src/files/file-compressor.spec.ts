import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as Promise from 'promise';

import { FileCompressor } from './file-compressor';
import { FileData } from './file-data.model';

describe('File Compressor', () => {

  it('Should be created', () => {
    let fileService = new FileCompressor();
    expect(fileService).not.to.be.null;
  });

  it('MinifyJs should return compressed file data', (done) => {
    let compressor = new FileCompressor();
    compressor.minifyJs = (map, options) => { return { code: 'let foo=bar' } }
    let file: FileData = { name: '/test.js', contents: 'let foo = "bar"', type: 'js'};
    compressor.MinifyJs(file).then((rslt: string) => {
      expect(rslt).to.equal('let foo=bar');
      done();
    });
  });

  it('MinifyJs should throw an error if minification fails', (done) => {
    let compressor = new FileCompressor();
    compressor.minifyJs = (map, options) => { return { error: 'error' } }
    let file: FileData = { name: '/test.js', contents: 'let foo = "bar"', type: 'js'};
    compressor.MinifyJs(file).catch((ex: Error) => {
      expect(ex.message).to.equal('error');
      done();
    })
  });

  it('BundleJs should return compressed file data', (done) => {
    let compressor = new FileCompressor();
    compressor.minifyJs = (map, options) => { return { code: 'let foo=bar' } }
    let file: FileData = { name: '/test.js', contents: 'let foo = "bar"', type: 'js'};
    compressor.BundleJs([file], '/test.min.js').then((rslt: FileData) => {
      expect(rslt.name).to.equal('/test.min.js');
      expect(rslt.contents).to.equal('let foo=bar');
      done();
    });
  });

  it('BundleJs should throw an error if minification fails', (done) => {
    let compressor = new FileCompressor();
    compressor.minifyJs = (map, options) => { return { error: 'error' } }
    let file: FileData = { name: '/test.js', contents: 'let foo = "bar"', type: 'js'};
    compressor.BundleJs([file], '/test.min.js').catch((ex: Error) => {
      expect(ex.message).to.equal('error');
      done();
    })
  });

  it('MinifyCss should return compressed file data', (done) => {
    let compressor = new FileCompressor();
    compressor.minifyCss = MockCleanCss;
    let file: FileData = { name: '/test.css', contents: 'body { color: black }', type: 'css'};
    compressor.MinifyCss(file).then((rslt: string) => {
      expect(rslt).to.equal('body{color:black}');
      done();
    })
    .catch((ex) => {
      console.log(ex.message);
    })
  });

  it('BundleCss should return compressed file data', (done) => {
    let compressor = new FileCompressor();
    compressor.minifyCss = MockCleanCss;
    let file: FileData = { name: '/test.css', contents: 'body { color: black }', type: 'css'};
    compressor.BundleCss([file], '/test.min.css').then((rslt: FileData) => {
      expect(rslt.name).to.equal('/test.min.css');
      expect(rslt.contents).to.equal('body{color:black}');
      done();
    });
  });

});

class MockCleanCss {
  constructor(args: any) {}
  minify = (map) => { return { styles: 'body{color:black}' } }
}
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as Promise from 'promise';

import { FileService } from './file.service';

describe('File Service', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('Should be created', () => {
    let fileService = new FileService();
    expect(fileService).not.to.be.null;
  });

  it('ReadFile should return file contents', (done) => {
    let fileService = new FileService();
    let fileReader = sandbox.stub(fileService.fs, 'readFile');
    fileReader.yields(null, 'sometext');
    fileService.ReadFile('/home', 'file1.txt').then((rslt: string) => {
      expect(rslt).to.equal('sometext');
      done();
    })
  });

  it('ReadFile should return an error', (done) => {
    let fileService = new FileService();
    let fileReader = sandbox.stub(fileService.fs, 'readFile');
    fileReader.yields(new Error("test"));
    fileService.ReadFile('/home', 'file1.txt').catch((ex: Error) => {
      expect(ex.message).to.equal('test');
      done();
    })
  });

  it('ReadFile should return json data', (done) => {
    let fileService = new FileService();
    let fileReader = sandbox.stub(fileService.fs, 'readJson');
    fileReader.yields(null, { data: true });
    fileService.ReadJson('/home', 'file1.txt').then((rslt: any) => {
      expect(rslt.data).to.equal(true);
      done();
    })
  });

  it('ReadFile should return empty json object if json reader errors', (done) => {
    let fileService = new FileService();
    let fileReader = sandbox.stub(fileService.fs, 'readJson');
    fileReader.yields(new Error("test"));
    fileService.ReadJson('/home', 'file1.txt').then((rslt: any) => {
      expect(JSON.stringify(rslt)).to.equal(JSON.stringify({}));
      done();
    })
  });

});
import 'mocha';
import * as sinon from 'sinon';
import { expect }  from 'chai';
import 'sinon-chai';

import { IOC, IOC_TYPES } from '../../inversify';
import { FileService, IFileService } from '../../files';
import { CompilerData } from '../../compiler/compiler-data.model';
import { FileLoader } from './file-loader';

describe('File Loader', () => {

  let fileService;

  beforeEach(() => {
    IOC.snapshot();
    fileService = sinon.createStubInstance(FileService);
  });

  afterEach(() => {
    IOC.restore();
  });

  it('Should be created', () => {
    IOC.bind<IFileService>(IOC_TYPES.FileService).to(FileService);
    let loader = new FileLoader();
    expect(loader).not.to.be.null;
  });

  it('Process should load files array in compiler data', (done) => {
    fileService.ReadFile = sinon.stub();
    fileService.ReadFile.returns(new Promise((res) => { res('text goes here') }));
    IOC.bind<IFileService>(IOC_TYPES.FileService).toConstantValue(fileService);
    let loader = new FileLoader();
    loader.OnStateChange((data: CompilerData) => {
      expect(data.files[0].contents).to.equal('text goes here');
      done();
    })
    let compilerData = new CompilerData({});
    compilerData.files = [{name: 'test.txt', contents: '', type: 'html'}]
    loader.Process(compilerData);
  });

  it('Process should bubble errors', (done) => {
    fileService.ReadFile = sinon.stub();
    fileService.ReadFile.returns(new Promise((res, err) => { err("error") }));
    IOC.bind<IFileService>(IOC_TYPES.FileService).toConstantValue(fileService);
    let loader = new FileLoader();
    loader.OnCompilerError((error: Error) => {
      expect(error.message).to.equal("error");
      done();
    })
    let compilerData = new CompilerData({});
    compilerData.files = [{name: 'test.txt', contents: '', type: 'html'}]
    loader.Process(compilerData);
  })

});
import 'mocha';
import * as sinon from 'sinon';
import { expect }  from 'chai';
import 'sinon-chai';

import { IOC, IOC_TYPES } from '../../inversify';
import { GlobLoader } from './glob-loader';
import { GlobService, IGlobService } from '../../globs';
import { CompilerData } from '../../compiler/compiler-data.model';

describe('Glob Loader', () => {

  let globService;

  beforeEach(() => {
    IOC.snapshot();
    globService = sinon.createStubInstance(GlobService);
  });

  afterEach(() => {
    IOC.restore();
  });

  it('Should be created', () => {
    IOC.bind<IGlobService>(IOC_TYPES.GlobService).to(GlobService);
    let loader = new GlobLoader();
    expect(loader).not.to.be.null;
  });

  it('Process should load files array in compiler data', (done) => {
    globService.GetFilesFromGlob = sinon.stub();
    globService.GetFilesFromGlob.onCall(0).returns(new Promise((res) => {
      res([{ name: 'test1.html', contents: '', type: 'html' }])
    }));
    globService.GetFilesFromGlob.returns(new Promise((res) => { res([]) }));
    IOC.bind<IGlobService>(IOC_TYPES.GlobService).toConstantValue(globService);
    let loader = new GlobLoader();
    loader.OnStateChange((data: CompilerData) => {
      expect(data.files.length).to.equal(1);
      done();
    })
    loader.Process(new CompilerData({}));
  });

  it('Process should bubble errors', (done) => {
    globService.GetFilesFromGlob = sinon.stub();
    globService.GetFilesFromGlob.returns(new Promise((res, err) => { err("error") }));
    IOC.bind<IGlobService>(IOC_TYPES.GlobService).toConstantValue(globService);
    let loader = new GlobLoader();
    loader.OnCompilerError((error: Error) => {
      expect(error.message).to.equal("error");
      done();
    })
    loader.Process(new CompilerData({}));
  })

});
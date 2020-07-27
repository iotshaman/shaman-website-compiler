import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as _fsx from 'fs-extra';
import * as _gaze from 'gaze';
import { createMock } from 'ts-auto-mock';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData } from '../models';
import { CreateDataContext } from '../data/compiler.context.spec';
import { ILogger } from '../logger';
import { IEventService } from '../services/event.service';
import { IGlobService } from './glob.service';
import { IHandlebarsService } from './handlebars.service';
import { FileImportService } from './file-import.service';

describe('WebsiteRouter', () => {
  
  var sandbox: sinon.SinonSandbox;
  var config: WebsiteConfig;
  var globService: IGlobService;
  var eventService: IEventService;
  var handlebarsService: IHandlebarsService;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    config = new WebsiteConfig();
    globService = createMock<IGlobService>();
    eventService = createMock<IEventService>();
    handlebarsService = createMock<IHandlebarsService>();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(config);
    IoC.bind<IGlobService>(TYPES.GlobService).toConstantValue(<any>globService);
    IoC.bind<IEventService>(TYPES.CompilerEvents).toConstantValue(<any>eventService);
    IoC.bind<IHandlebarsService>(TYPES.HandlebarsService).toConstantValue(<any>handlebarsService);
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(createMock<ILogger>());
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('should be created', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new FileImportService();
      expect(subject).not.to.be.null;
      done();
    });
  });

  it('importPartialFilesFromGlobs should return empty result set', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new FileImportService();
      globService.GetFilesFromGlob = sandbox.stub().returns(Promise.resolve([]));
      subject.importPartialFilesFromGlobs().then(result => {
        expect(result.length).to.equal(0);
        done();
      });
    });
  });

  it('importPartialFilesFromGlobs should set partial file content', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new FileImportService();
      let file = new FileData("a.partial.html", "./a.partial.html");
      globService.GetFilesFromGlob = sandbox.stub().returns(Promise.resolve([file]));
      sandbox.stub(_fsx, 'readFile').returns(<any>Promise.resolve('test'))
      subject.importPartialFilesFromGlobs().then(result => {
        expect(result[0].content).to.equal('test');
        done();
      });
    });
  });

  it('importPartialFilesFromGlobs should insert partials into database', (done) => {
    CreateDataContext(IoC).then(context => {
      let subject = new FileImportService();
      let file = new FileData("a.partial.html", "./a.partial.html");
      globService.GetFilesFromGlob = sandbox.stub().returns(Promise.resolve([file]));
      handlebarsService.registerPartials = sandbox.stub().callsFake(f => (f));
      sandbox.stub(_fsx, 'readFile').returns(<any>Promise.resolve('test'))
      subject.importPartialFilesFromGlobs().then(_ => {
        let partials = context.models.files.filter(f => f.extension == 'partial.html');
        expect(partials.length).to.equal(1);
        done();
      });
    });
  });

  it('importFilesFromGlobs should return empty result set', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new FileImportService();
      globService.GetFilesFromGlob = sandbox.stub().returns(Promise.resolve([]));
      subject.importFilesFromGlobs().then(result => {
        expect(result.length).to.equal(0);
        done();
      });
    });
  });

  it('importFilesFromGlobs should insert files into database', (done) => {
    CreateDataContext(IoC).then(context => {
      let subject = new FileImportService();
      let globStub = globService.GetFilesFromGlob = sandbox.stub();
      let html = new FileData("index.html", "./index.html");
      let js = new FileData("index.js", "./index.js");
      let css = new FileData("index.css", "./index.css");
      globStub.withArgs(config.pages).returns(Promise.resolve([html]));
      globStub.withArgs(config.scripts).returns(Promise.resolve([js]));
      globStub.withArgs(config.styles).returns(Promise.resolve([css]));
      subject.importFilesFromGlobs().then(result => {
        let partials = context.models.files.filter(f => !!f);
        expect(partials.length).to.equal(3);
        done();
      });
    });
  });

  it('importAssetFilesFromGlobs should return empty result set', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new FileImportService();
      globService.GetFilesFromGlob = sandbox.stub().returns(Promise.resolve([]));
      subject.importAssetFilesFromGlobs().then(result => {
        expect(result.length).to.equal(0);
        done();
      });
    });
  });

  it('importAssetFilesFromGlobs should insert asset files into database', (done) => {
    CreateDataContext(IoC).then(context => {
      let subject = new FileImportService();
      let globStub = globService.GetFilesFromGlob = sandbox.stub();
      let asset = new FileData("sample.png", "./sample.png");
      globStub.withArgs(config.assets).returns(Promise.resolve([asset]));
      subject.importAssetFilesFromGlobs().then(_ => {
        let assets = context.models.assets.filter(a => !!a);
        expect(assets.length).to.equal(1);
        done();
      });
    });
  });

  it('importHelperFilesFromGlobs should return empty result set', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new FileImportService();
      globService.GetFilesFromGlob = sandbox.stub().returns(Promise.resolve([]));
      subject.importHelperFilesFromGlobs().then(result => {
        expect(result.length).to.equal(0);
        done();
      });
    });
  });

});
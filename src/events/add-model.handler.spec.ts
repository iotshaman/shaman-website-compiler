import 'mocha';
import * as sinon from 'sinon';
import * as fsx from 'fs-extra';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData, FileModelConfig, Bundle } from '../models';
import { IEventService } from '../services/event.service';
import { ILogger } from '../logger';
import { createMock } from 'ts-auto-mock';
import { AddModelHandler } from './add-model.handler';
import { CreateDataContext } from '../data/compiler.context.spec';
import { CompilerDataContext } from '../data/compiler.context';

describe('AddModelHandler', () => {
  
  var sandbox: sinon.SinonSandbox;
  var eventService: IEventService;
  var logger: ILogger;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    eventService = createMock<IEventService>();
    logger = createMock<ILogger>();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(new WebsiteConfig());
    IoC.bind<IEventService>(TYPES.CompilerEvents).toConstantValue(eventService);
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(logger);
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('processEvent should do nothing if file is not html', () => {
    CreateDataContext(IoC).then(_ => {
      let stub = sandbox.stub(fsx, 'readJSON');
      let subject = new AddModelHandler();
      subject.processEvent(new FileData("sample.js", "./sample.js")).then(_ => {
        expect(stub.called).to.be.false;
      });
    })
  });

  it('processEvent should call raise "file-model-added" event', () => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      sandbox.stub(fsx, 'readJSON').returns(<any>Promise.resolve({}));
      let stub = eventService.publish = sandbox.stub();
      let subject = new AddModelHandler();
      subject.processEvent(new FileData("sample.html", "./sample.html")).then(_ => {
        expect(stub.getCall(0).args[0]).to.equal('file-model-added');
      });
    })
  });

  it('processEvent should add shaman model details, if not provided', () => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      sandbox.stub(fsx, 'readJSON').returns(<any>Promise.resolve({}));
      let stub = eventService.publish = sandbox.stub();
      let subject = new AddModelHandler();
      subject.processEvent(new FileData("sample.html", "./sample.html")).then(_ => {
        let file: FileData = <any>stub.getCall(0).args[1];
        expect(file.model.shaman.bundles.length).to.equal(0);
      });
    })
  });

  it('processEvent should warn user when file model does not exist', () => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      sandbox.stub(fsx, 'readJSON').returns(<any>Promise.reject());
      let stub = logger.log = sandbox.stub();
      let subject = new AddModelHandler();
      subject.processEvent(new FileData("sample.html", "./sample.html")).then(_ => {
        let logLevel = stub.getCall(0).args[1];
        expect(logLevel).to.equal(1);
      });
    })
  });

  it('processEvent should add shaman model details from file contents', () => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      let model = new FileModelConfig();
      model.bundles = [new Bundle()];
      sandbox.stub(fsx, 'readJSON').returns(<any>Promise.resolve({shaman: model}));
      let stub = eventService.publish = sandbox.stub();
      let subject = new AddModelHandler();
      subject.processEvent(new FileData("sample.html", "./sample.html")).then(_ => {
        let file: FileData = <any>stub.getCall(0).args[1];
        expect(file.model.shaman.bundles.length).to.equal(1);
      });
    })
  });

});

function addTestFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('sample.html', './sample.html'); 
  file.available = true;
  context.models.files.add('sample.html', file);
  return context.saveChanges().then(_ => (context));
}
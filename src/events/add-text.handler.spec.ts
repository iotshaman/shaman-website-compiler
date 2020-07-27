import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData } from '../models';
import { IEventService } from '../services/event.service';
import { ILogger } from '../logger';
import { createMock } from 'ts-auto-mock';
import { AddTextHandler } from './add-text.handler';
import { CreateDataContext } from '../data/compiler.context.spec';
import { CompilerDataContext } from '../data/compiler.context';
import { IFileImportService } from '../services/file-import.service';

describe('AddTextHandler', () => {
  
  var sandbox: sinon.SinonSandbox;
  var eventService: IEventService;
  var logger: ILogger;
  var fileImportService: IFileImportService;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    eventService = createMock<IEventService>();
    logger = createMock<ILogger>();
    fileImportService = createMock<IFileImportService>();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(new WebsiteConfig());
    IoC.bind<IEventService>(TYPES.CompilerEvents).toConstantValue(eventService);
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(logger);
    IoC.bind<IFileImportService>(TYPES.FileImportService).toConstantValue(fileImportService);
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('processEvent should update content in database', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      let fileImportResult = <any>Promise.resolve({ text: 'content' });
      fileImportService.importFileText = sandbox.stub().returns(fileImportResult);
      let subject = new AddTextHandler();
      subject.processEvent(new FileData("sample.html", "./sample.html")).then(_ => {
        let file = context.models.files.find('sample.html');
        expect(file.text).to.equal('content');
        done();
      });
    });
  });

  it('processEvent should call raise "file-contents-added" event', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      let fileImportResult = <any>Promise.resolve({ text: 'content' });
      fileImportService.importFileText = sandbox.stub().returns(fileImportResult);
      let stub = eventService.publish = sandbox.stub();
      let subject = new AddTextHandler();
      subject.processEvent(new FileData("sample.html", "./sample.html")).then(_ => {
        expect(stub.getCall(0).args[0]).to.equal('file-contents-added');
        done();
      });
    });
  });

});

function addTestFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('sample.html', './sample.html'); 
  file.available = true;
  context.models.files.add('sample.html', file);
  return context.saveChanges().then(_ => (context));
}
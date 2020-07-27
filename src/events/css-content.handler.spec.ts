import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData } from '../models';
import { IEventService } from '../services/event.service';
import { ILogger } from '../logger';
import { createMock } from 'ts-auto-mock';
import { CssContentHandler } from './css-content.handler';
import { CreateDataContext } from '../data/compiler.context.spec';
import { CompilerDataContext } from '../data/compiler.context';

describe('CssContentHandler', () => {
  
  var sandbox: sinon.SinonSandbox;
  var config: WebsiteConfig;
  var eventService: IEventService;
  var logger: ILogger;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    config = new WebsiteConfig();
    eventService = createMock<IEventService>();
    logger = createMock<ILogger>();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(config);
    IoC.bind<IEventService>(TYPES.CompilerEvents).toConstantValue(eventService);
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(logger);
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('processEvent should do nothing if file is not css', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new CssContentHandler();
      let stub = sandbox.stub(subject.minify, 'minify');
      subject.processEvent(new FileData("sample.js", "./sample.js")).then(_ => {
        expect(stub.called).to.be.false;
        done();
      });
    })
  });

  it('processEvent should not minify file if config.production = false', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.production = false;
      let subject = new CssContentHandler();
      sandbox.stub(subject.minify, 'minify').returns('.css{}');
      let file = new FileData("sample.css", "./sample.css");
      file.text = '.css { }';
      subject.processEvent(file).then(_ => {
        let result = context.models.files.find('sample.css');
        expect(result.content).to.equal('.css { }');
        done();
      })
    });
  });

  it('processEvent should minify file if config.production = true', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.production = true;
      let subject = new CssContentHandler();
      sandbox.stub(subject.minify, 'minify').returns({ styles: '.css{}' });
      let file = new FileData("sample.css", "./sample.css");
      subject.processEvent(file).then(_ => {
        let result = context.models.files.find('sample.css');
        expect(result.content).to.equal('.css{}');
        done();
      })
    });
  });

  it('processEvent should set routePath to *.min.css if config.production = true', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.production = true;
      let subject = new CssContentHandler();
      sandbox.stub(subject.minify, 'minify').returns({ styles: '.css{}' });
      let file = new FileData("sample.css", "./sample.css");
      subject.processEvent(file).then(_ => {
        let result = context.models.files.find('sample.css');
        expect(result.routePath).to.equal('sample.min.css');
        done();
      })
    });
  });

  it('processEvent should call raise "file-contents-added" event', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      config.production = false;
      let subject = new CssContentHandler();
      let stub = eventService.publish = sandbox.stub();
      subject.processEvent(new FileData("sample.css", "./sample.css")).then(_ => {
        expect(stub.getCall(0).args[0]).to.equal('file-available');
        done();
      });
    });
  });

});

function addTestFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('sample.css', './sample.css'); 
  file.available = true;
  context.models.files.add('sample.css', file);
  return context.saveChanges().then(_ => (context));
}
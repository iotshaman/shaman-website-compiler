import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData, QueryModel } from '../models';
import { IEventService } from '../services/event.service';
import { ILogger } from '../logger';
import { createMock } from 'ts-auto-mock';
import { HtmlContentHandler } from './html-content.handler';
import { CreateDataContext } from '../data/compiler.context.spec';
import { CompilerDataContext } from '../data/compiler.context';
import { IQueryAdapter } from '../adapters';
import { IHandlebarsService } from '../services/handlebars.service';

describe('HtmlContentHandler', () => {
  
  var sandbox: sinon.SinonSandbox;
  var config: WebsiteConfig;
  var eventService: IEventService;
  var logger: ILogger;
  var handlebarsService: IHandlebarsService;
  var queryAdapter: IQueryAdapter;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    config = new WebsiteConfig();
    eventService = createMock<IEventService>();
    logger = createMock<ILogger>();
    handlebarsService = createMock<IHandlebarsService>();
    queryAdapter = createMock<IQueryAdapter>();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(config);
    IoC.bind<IEventService>(TYPES.CompilerEvents).toConstantValue(eventService);
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(logger);
    IoC.bind<IHandlebarsService>(TYPES.HandlebarsService).toConstantValue(handlebarsService);
    IoC.bind<IQueryAdapter>(TYPES.QueryAdapter).toConstantValue(queryAdapter);
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('processEvent should do nothing if file is not css', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new HtmlContentHandler();
      let stub = eventService.publish = sandbox.stub();
      subject.processEvent(new FileData("sample.js", "./sample.js")).then(_ => {
        expect(stub.called).to.be.false;
        done();
      });
    })
  });

  it('processEvent should update file contents', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      let subject = new HtmlContentHandler();
      handlebarsService.renderTemplate = sandbox.stub().returns('<html>\r\n</html>');
      let file = new FileData('sample.html', './sample.html'); 
      file.model = { shaman: {} };
      subject.processEvent(file).then(_ => {
        let file = context.models.files.find("sample.html");
        expect(file.content).to.equal('<html>\r\n</html>');
        done();
      });
    })
  });

  it('processEvent should minify file contents', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.production = true;
      let subject = new HtmlContentHandler();
      handlebarsService.renderTemplate = sandbox.stub().returns('<html>\r\n</html>');
      sandbox.stub(subject, 'minify').returns('<html></html>')
      let file = new FileData('sample.html', './sample.html'); 
      file.model = { shaman: {} };
      subject.processEvent(file).then(_ => {
        let file = context.models.files.find("sample.html");
        expect(file.content).to.equal('<html></html>');
        done();
      });
    })
  });

  it('processEvent should call raise "file-available" event', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      config.production = true;
      let subject = new HtmlContentHandler();
      handlebarsService.renderTemplate = sandbox.stub().returns('<html>\r\n</html>');
      sandbox.stub(subject, 'minify').returns('<html></html>')
      let file = new FileData('sample.html', './sample.html'); 
      file.model = { shaman: {} };
      let stub = eventService.publish = sandbox.stub();
      subject.processEvent(file).then(_ => {
        expect(stub.getCall(0).args[0]).to.equal('file-available');
        done();
      });
    });
  });

  it('processEvent should warn user if dynamic file has no queries', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      let subject = new HtmlContentHandler();
      let stub = logger.log = sandbox.stub();
      handlebarsService.renderTemplate = sandbox.stub().returns('<html>\r\n</html>');
      let file = new FileData('sample.html', './sample.html'); 
      file.model = { shaman: { dynamic: { path: '', key: '' }, query: [] } };
      subject.processEvent(file).then(_ => {
        let logLevel = stub.getCall(0).args[1];
        expect(logLevel).to.equal(1);
        done();
      });
    })
  });

  it('processEvent should warn user if dynamic query returns empty', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      let subject = new HtmlContentHandler();
      let stub = logger.log = sandbox.stub();
      queryAdapter.run = sandbox.stub().returns(Promise.resolve([]));
      handlebarsService.renderTemplate = sandbox.stub().returns('<html>\r\n</html>');
      let file = new FileData('sample.html', './sample.html'); 
      let query = new QueryModel(); query.dynamic = true;
      file.model = { shaman: { dynamic: { path: '', key: '' }, query: [query] } };
      subject.processEvent(file).then(_ => {
        let logLevel = stub.getCall(0).args[1];
        expect(logLevel).to.equal(1);
        done();
      });
    })
  });

  it('processEvent should minify dynamic routes', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.production = true;
      let subject = new HtmlContentHandler();
      queryAdapter.run = sandbox.stub().returns(Promise.resolve([{title: 'a.html'}]));
      handlebarsService.renderTemplate = sandbox.stub().returns('<html>\r\n</html>');
      sandbox.stub(subject, 'minify').returns('<html></html>')
      let file = new FileData('sample.html', './sample.html'); 
      let query = new QueryModel(); query.dynamic = true;
      file.model = { shaman: { dynamic: { path: '', key: 'title' }, query: [query] } };
      subject.processEvent(file).then(_ => {
        let route = context.models.dynamicRoutes.find('a.html');
        expect(route.content).to.equal('<html></html>');
        done();
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
import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData, Bundle, QueryModel } from '../models';
import { IEventService } from '../services/event.service';
import { ILogger } from '../logger';
import { createMock } from 'ts-auto-mock';
import { ProcessModelHandler } from './process-model.handler';
import { CreateDataContext } from '../data/compiler.context.spec';
import { CompilerDataContext } from '../data/compiler.context';
import { IQueryAdapter } from '../adapters';

describe('ProcessModelHandler', () => {
  
  var sandbox: sinon.SinonSandbox;
  var config: WebsiteConfig;
  var eventService: IEventService;
  var logger: ILogger;
  var queryAdapter: IQueryAdapter;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    config = new WebsiteConfig();
    eventService = createMock<IEventService>();
    logger = createMock<ILogger>();
    queryAdapter = createMock<IQueryAdapter>();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(config);
    IoC.bind<IEventService>(TYPES.CompilerEvents).toConstantValue(eventService);
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(logger);
    IoC.bind<IQueryAdapter>(TYPES.QueryAdapter).toConstantValue(queryAdapter);
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('processEvent should do nothing if file is not html', (done) => {
    CreateDataContext(IoC).then(_ => {
      let subject = new ProcessModelHandler();
      let stub = eventService.publish = sandbox.stub();
      subject.processEvent(new FileData("sample.js", "./sample.js")).then(_ => {
        expect(stub.called).to.be.false;
        done();
      });
    })
  });

  it('processEvent should update content in database', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      let subject = new ProcessModelHandler();
      let file = new FileData("sample.html", "./sample.html");
      let bundle = new Bundle({name: 'a', type: 'js', files: ['a.js'], path: 'a.js'})
      file.model = { shaman: { bundles: [bundle], query: [] } };
      subject.processEvent(file).then(_ => {
        expect(context.models.bundles.filter(b => !!b).length).to.equal(1);
        done();
      });
    });
  });

  it('processEvent should set bundle.extension to *.min.js when config.production = true', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.production = true;
      let subject = new ProcessModelHandler();
      let file = new FileData("sample.html", "./sample.html");
      let bundle = new Bundle({name: 'a', type: 'js', files: ['a.js'], path: 'a.js'})
      file.model = { shaman: { bundles: [bundle], query: [] } };
      subject.processEvent(file).then(_ => {
        let bundle = context.models.bundles.find('a');
        expect(bundle.extension).to.equal('min.js');
        done();
      });
    });
  });

  it('processEvent should update content in database', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      let subject = new ProcessModelHandler();
      queryAdapter.run = sandbox.stub().returns(Promise.resolve({success:true}))
      let file = new FileData("sample.html", "./sample.html");
      let query: QueryModel = { name: 'q1', path: '' };
      file.model = { shaman: { bundles: [], query: [query] } };
      subject.processEvent(file).then(_ => {
        let result = context.models.files.find("sample.html");
        expect(result.query.q1.success).to.be.true;
        done();
      });
    });
  });

  it('processEvent should call raise "file-contents-added" event', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      let subject = new ProcessModelHandler();
      queryAdapter.run = sandbox.stub().returns(Promise.resolve({success:true}))
      let file = new FileData("sample.html", "./sample.html");
      file.model = { shaman: { bundles: [], query: [] } };
      let stub = eventService.publish = sandbox.stub();
      subject.processEvent(file).then(_ => {
        expect(stub.getCall(0).args[0]).to.equal('file-model-processed');
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
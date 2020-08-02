import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as _fsx from 'fs-extra';
import * as _gaze from 'gaze';
import { createMock } from 'ts-auto-mock';
import { IoC, TYPES } from './composition/app.composition';
import { WebsiteConfig, Route, FileData } from './models';
import { CreateDataContext } from './data/compiler.context.spec';
import { CompilerDataContext } from './data/compiler.context';
import { ILogger } from './logger';
import { WebsiteCompiler } from './website-compiler';
import { IWebsiteServer } from './website-server';
import { IEventService, EventService } from './services/event.service';
import { Website } from './website';

describe('WebsiteRouter', () => {
  
  var sandbox: sinon.SinonSandbox;
  var config: WebsiteConfig;
  var compiler: WebsiteCompiler;
  var server: IWebsiteServer;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    config = new WebsiteConfig();
    compiler = createMock<WebsiteCompiler>();
    server = createMock<IWebsiteServer>();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(config);
    IoC.bind<WebsiteCompiler>(TYPES.WebsiteCompiler).toConstantValue(<any>compiler);
    IoC.bind<IWebsiteServer>(TYPES.WebsiteServer).toConstantValue(<any>server);
    IoC.bind<IEventService>(TYPES.CompilerEvents).toConstantValue(new EventService());
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(createMock<ILogger>());
    sandbox.stub(_fsx, 'ensureFile').returns(<any>Promise.resolve());
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('Website should not output files if config.output = false', (done) => {
    CreateDataContext(IoC).then(_ => {
      config.output = null;
      config.serve = false;
      compiler.compile = sandbox.stub().returns(Promise.resolve([]));
      let outputStub = sandbox.stub(_fsx, 'outputFile').returns(<any>Promise.resolve());
      let subject = new Website();
      subject.build().then(_ => {
        expect(outputStub.called).not.to.be.true;
        done();
      });
    });
  });

  it('Website should output files', (done) => {
    CreateDataContext(IoC).then(_ => {
      config.output = './output';
      config.serve = false;
      let route = new Route("index.html", "<html></html>", "html");
      compiler.compile = sandbox.stub().returns(Promise.resolve([route]));
      let outputStub = sandbox.stub(_fsx, 'outputFile').returns(<any>Promise.resolve());
      let subject = new Website();
      subject.build().then(_ => {
        expect(outputStub.called).to.be.true;
        done();
      });
    });
  });

  it('Website should output asset files', (done) => {
    CreateDataContext(IoC).then(addTestAssetFileToContext).then(_ => {
      config.output = './output';
      config.serve = false;
      compiler.compile = sandbox.stub().returns(Promise.resolve([]));
      let copyStub = sandbox.stub(_fsx, 'copy').returns(<any>Promise.resolve());
      let subject = new Website();
      subject.build().then(_ => {
        expect(copyStub.called).to.be.true;
        done();
      });
    });
  });

  it('Website should not start server if config.serve = false', (done) => {
    CreateDataContext(IoC).then(_ => {
      config.output = null;
      config.serve = false;
      compiler.compile = sandbox.stub().returns(Promise.resolve([]));
      let outputStub = server.start = sandbox.stub();
      let subject = new Website();
      subject.build().then(_ => {
        expect(outputStub.called).not.to.be.true;
        done();
      });
    });
  });

  it('Website should not start server if server is already started', (done) => {
    CreateDataContext(IoC).then(_ => {
      config.output = null;
      config.serve = true;
      compiler.compile = sandbox.stub().returns(Promise.resolve([]));
      server.listening = true;
      let outputStub = server.start = sandbox.stub();
      let subject = new Website();
      sandbox.stub(subject, 'gaze');
      subject.build().then(_ => {
        expect(outputStub.called).not.to.be.true;
        done();
      });
    });
  });

  it('Website should start server', (done) => {
    CreateDataContext(IoC).then(_ => {
      config.output = null;
      config.serve = true;
      compiler.compile = sandbox.stub().returns(Promise.resolve([]));
      let outputStub = server.start = sandbox.stub();
      let subject = new Website();
      sandbox.stub(subject, 'gaze');
      subject.build().then(_ => {
        expect(outputStub.called).to.be.true;
        done();
      });
    });
  });

  it('Website should not watch for file changes if config.serve = false', (done) => {
    CreateDataContext(IoC).then(_ => {
      config.output = null;
      config.serve = false;
      compiler.compile = sandbox.stub().returns(Promise.resolve([]));
      let subject = new Website();
      let gazeStub = sandbox.stub(subject, 'gaze');
      subject.build().then(_ => {
        expect(gazeStub.called).not.to.be.true;
        done();
      });
    });
  });

  it('Website should not add listener to watcher if gaze returns error', (done) => {
    CreateDataContext(IoC).then(_ => {
      config.output = null;
      config.serve = true;
      compiler.compile = sandbox.stub().returns(Promise.resolve([]));
      let subject = new Website();
      let watcherStub = sandbox.stub();
      sandbox.stub(subject, 'gaze').yields(new Error("test error"), watcherStub);
      subject.build().then(_ => {
        expect(watcherStub.called).not.to.be.true;
        done();
      });
    });
  });

  it('Website should not add listener to watcher if gaze returns error', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(_ => {
      config.output = null;
      config.serve = true;
      let route = new Route("sample.html", "<html></html>", "html");
      compiler.compile = sandbox.stub().returns(Promise.resolve([route]));
      let subject = new Website();
      let watcher = { on: sandbox.stub().yields("sample.html") };
      sandbox.stub(subject, 'gaze').yields(null, watcher);
      let fileChangedStub = sandbox.stub(subject, 'fileChanged');
      subject.build().then(_ => {
        expect(fileChangedStub.called).to.be.true;
        done();
      });
    });
  });

  it('Website should set file.available = false', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.root = "/home";
      config.output = null;
      let subject = new Website();
      subject.fileChanged("/home/sample.html");
      expect(context.models.files.find('sample.html').available).to.be.false;
      done();
    });
  });

  it('Website should update server routes', (done) => {
    CreateDataContext(IoC).then(addTestFileToContext).then(context => {
      config.root = "/home";
      config.output = null;
      let subject = new Website();
      let updateStub = server.updateRoutes = sandbox.stub();
      subject.fileChanged("/home/sample.html").then(_ => {
        expect(updateStub.called).to.be.true;
        done();
      })
    });
  });

});

function addTestAssetFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('sample.png', './sample.png'); 
  file.available = true;
  context.models.assets.add('sample.png', file);
  return context.saveChanges().then(_ => (context));
}

function addTestFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('sample.html', '/home/sample.html'); 
  file.available = true;
  context.models.files.add('sample.html', file);
  return context.saveChanges().then(_ => (context));
}
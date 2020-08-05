import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as http from 'http';
import * as fs from 'fs';
import { IoC, TYPES } from './composition/app.composition';
import { WebsiteConfig, FileData, Route } from './models';
import { CreateDataContext } from './data/compiler.context.spec';
import { CompilerDataContext } from './data/compiler.context';
import { ILogger, Logger } from './logger';
import { WebsiteServer } from './website-server';

describe('WebsiteRouter', () => {
  
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(new WebsiteConfig());
    IoC.bind<ILogger>(TYPES.Logger).toConstantValue(new Logger("error"));
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('server should listen on port 3000 by default', (done) => {
    CreateDataContext(IoC).then(_ => {
      let stub = sandbox.stub();
      sandbox.stub(http, 'createServer').returns(<any>{listen: stub});
      let server = new WebsiteServer();
      server.start([]);
      expect(stub.calledWith(3000)).to.be.true;
      done();
    });
  });

  it('server should set listening to true', (done) => {
    CreateDataContext(IoC).then(_ => {
      sandbox.stub(http, 'createServer').returns(<any>{listen: sandbox.stub()});
      let server = new WebsiteServer();
      server.start([]);
      expect(server.listening).to.be.true;
      done();
    });
  });

  it('server should return 404 if route is not found', (done) => {
    CreateDataContext(IoC).then(_ => {
      let responseCode = -1;
      let response = { writeHead: (_a, _b) => {responseCode = _a}, end: done}
      let stub = sandbox.stub(http, 'createServer')
      stub = stub.returns(<any>{listen: sandbox.stub()});
      stub = stub.yields({ url: '/' }, response);
      let server = new WebsiteServer();
      server.start([]);
      expect(responseCode).to.equal(404);
    });
  });

  it('server should return 404 if asset file not found', (done) => {
    CreateDataContext(IoC).then(_ => {
      let responseCode = -1;
      let response = { writeHead: (_a, _b) => {responseCode = _a}, end: done}
      let stub = sandbox.stub(http, 'createServer')
      stub = stub.returns(<any>{listen: sandbox.stub()});
      stub = stub.yields({ url: '/sample.png' }, response);
      let server = new WebsiteServer();
      server.start([]);
      expect(responseCode).to.equal(404);
    });
  });

  it('server should return asset file', (done) => {
    CreateDataContext(IoC).then(addTestAssetFileToContext).then(_ => {
      let responseHeader = {'Content-Type': 'NA'};
      let response = { writeHead: (_a, _b) => {responseHeader = _b}, end: () => {}}
      let stub = sandbox.stub(http, 'createServer')
      stub = stub.returns(<any>{listen: sandbox.stub()});
      stub = stub.yields({ url: '/sample.png' }, response);
      sandbox.stub(fs, 'createReadStream').returns(<any>{pipe: (_res) => {}})
      let server = new WebsiteServer();
      server.start([]);
      expect(responseHeader['Content-Type']).to.equal('image/png');
      done();
    });
  });

  it('server should return index.html file', (done) => {
    CreateDataContext(IoC).then(_ => {
      let onWrite = (content: string) => {
        expect(content).to.equal('<html>index.html</html>');
        done();
      }
      let response = { writeHead: (_a, _b) => {}, end: () => {}, write: onWrite}
      let stub = sandbox.stub(http, 'createServer')
      stub = stub.returns(<any>{listen: sandbox.stub()});
      stub = stub.yields({ url: '/index.html' }, response);
      let server = new WebsiteServer();
      let route = new Route('index.html', '<html>index.html</html>', 'html');
      server.start([route]);
    });
  });

  it('server should return sitemap.xml file', (done) => {
    CreateDataContext(IoC).then(_ => {
      let onWrite = (content: string) => {
        expect(content).to.equal('<xml>sitemap.xml</xml>');
        done();
      }
      let response = { writeHead: (_a, _b) => {}, end: () => {}, write: onWrite}
      let stub = sandbox.stub(http, 'createServer')
      stub = stub.returns(<any>{listen: sandbox.stub()});
      stub = stub.yields({ url: '/sitemap.xml' }, response);
      sandbox.stub(fs, 'createReadStream').returns(<any>{pipe: (_res) => {}})
      let server = new WebsiteServer();
      let route = new Route('sitemap.xml', '<xml>sitemap.xml</xml>', 'xml');
      server.start([route]);
    });
  });

  it('server should remove query string when looking for route', (done) => {
    CreateDataContext(IoC).then(_ => {
      let onWrite = (content: string) => {
        expect(content).to.equal('<html>index.html</html>');
        done();
      }
      let response = { writeHead: (_a, _b) => {}, end: () => {}, write: onWrite}
      let stub = sandbox.stub(http, 'createServer')
      stub = stub.returns(<any>{listen: sandbox.stub()});
      stub = stub.yields({ url: '/index.html?test=true' }, response);
      let server = new WebsiteServer();
      let route = new Route('index.html', '<html>index.html</html>', 'html');
      server.start([route]);
    });
  });

});

function addTestAssetFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('sample.png', './sample.png'); 
  file.available = true;
  context.models.assets.add('sample.png', file);
  return context.saveChanges().then(_ => (context));
}
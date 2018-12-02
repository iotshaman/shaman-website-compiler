import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as Promise from 'promise';

import { ShamanRouter } from './shaman-router';
import { CompilerData } from '../compiler/compiler-data.model';

describe('Shaman Router', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('Should be created', () => {
    let data = new CompilerData({});
    let router = new ShamanRouter(data);
    expect(router).not.to.be.null;
  });

  it('Shaman router should load routes', () => {
    let data = new CompilerData({});
    data.files = [{ name: 'views/test1.html', type: 'html', contents: '' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    expect(router.routes['/views/test1.html']).not.to.be.null;
  });

  it('Shaman router should remove wwwRoot from routes', () => {
    let data = new CompilerData({ htmlRoot: 'views/' });
    data.files = [{ name: 'views/test1.html', type: 'html', contents: '' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    expect(router.routes['/test1.html']).not.to.be.null;
  });

  it('Shaman router should lremove html suffix', () => {
    let data = new CompilerData({ dropHtmlSuffix: true });
    data.files = [{ name: 'views/test1.html', type: 'html', contents: '' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    expect(router.routes['/views/test1']).not.to.be.null;
  });

  it('Shaman router should throw error if duplicate route', (done) => {
    let data = new CompilerData({});
    data.endTime = new Date();
    data.files = [
      { name: 'views/test1.html', type: 'html', contents: '' },
      { name: 'views/test1.html', type: 'html', contents: '' }
    ]
    try {
      let router = new ShamanRouter(data);
    } catch(ex) {
      expect(ex.message).to.equal("Shaman Router: route already exists - /views/test1.html")
      done();
    }
  });
  
  it('Shaman router should load html mime type', () => {
    let data = new CompilerData({});
    data.files = [{ name: 'views/test1.html', type: 'html', contents: '' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    expect(router.routes['/views/test1.html'].mimeType).to.equal('text/html');
  });
  
  it('Shaman router should load javascript mime type', () => {
    let data = new CompilerData({});
    data.files = [
      { name: 'views/test1.js', type: 'js', contents: '' },
      { name: 'views/test1.min.js', type: 'min.js', contents: '' },
      { name: 'views/test1.bundle.min.js', type: 'bundle.js', contents: '' },
    ]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    expect(router.routes['/views/test1.js'].mimeType).to.equal('text/javascript');
    expect(router.routes['/views/test1.min.js'].mimeType).to.equal('text/javascript');
    expect(router.routes['/views/test1.bundle.min.js'].mimeType).to.equal('text/javascript');
  });
  
  it('Shaman router should load css mime type', () => {
    let data = new CompilerData({});
    data.files = [
      { name: 'views/test1.css', type: 'css', contents: '' },
      { name: 'views/test1.min.css', type: 'min.css', contents: '' },
      { name: 'views/test1.bundle.min.css', type: 'bundle.css', contents: '' },
    ]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    expect(router.routes['/views/test1.css'].mimeType).to.equal('text/css');
    expect(router.routes['/views/test1.min.css'].mimeType).to.equal('text/css');
    expect(router.routes['/views/test1.bundle.min.css'].mimeType).to.equal('text/css');
  });

  it('Shaman router should apply cache headers', () => {
    let data = new CompilerData({});
    data.files = [{ name: 'test.html', type: 'html', contents: '' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    expect(router.routes['/test.html'].headers.find(h => h.header == 'Last-Modified')).not.to.be.null;
    expect(router.routes['/test.html'].headers.find(h => h.header == 'Content-Type')).not.to.be.null;
    expect(router.routes['/test.html'].headers.find(h => h.header == 'Expires')).not.to.be.null;
  });

  it('Express method should call next if route not found', (done) => {
    let data = new CompilerData({});
    let router = new ShamanRouter(data);
    router.Express(mockRequest(), mockResponse(), () => {
      done();
    })
  });

  it('Express method should render contents if route found ', (done) => {
    let data = new CompilerData({});
    data.files = [{ name: 'test.html', type: 'html', contents: 'test content' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    let res = mockResponse((content) => {
      expect(content).to.equal("test content");
      done();
    })
    router.Express(mockRequest(), res, () => {})
  });

  it('Express method should render contents for default route', (done) => {
    let data = new CompilerData({});
    data.files = [{ name: 'index.html', type: 'html', contents: 'test content' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    let res = mockResponse((content) => {
      expect(content).to.equal("test content");
      done();
    })
    router.Express(mockRequest('/'), res, () => {})
  });

  it('Express method should render contents for default route with no html suffix', (done) => {
    let data = new CompilerData({dropHtmlSuffix: true});
    data.files = [{ name: 'index.html', type: 'html', contents: 'test content' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    let res = mockResponse((content) => {
      expect(content).to.equal("test content");
      done();
    })
    router.Express(mockRequest('/'), res, () => {})
  });

  it('Express method should remove query string to find route', (done) => {
    let data = new CompilerData({});
    data.files = [{ name: 'test.html', type: 'html', contents: 'test content' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    let res = mockResponse((content) => {
      expect(content).to.equal("test content");
      done();
    })
    router.Express(mockRequest('/test.html?id=123'), res, () => {})
  });

  it('Express method should remove hash to find route', (done) => {
    let data = new CompilerData({});
    data.files = [{ name: 'test.html', type: 'html', contents: 'test content' }]
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    let res = mockResponse((content) => {
      expect(content).to.equal("test content");
      done();
    })
    router.Express(mockRequest('/test.html#breadcrumb'), res, () => {})
  });

  it('Shaman router should throw error if dynamic route is duplicate', (done) => {
    let data = new CompilerData({});
    data.endTime = new Date();
    data.files = [
      { name: 'test.html', type: 'html', contents: '' }
    ]
    let router = new ShamanRouter(data);
    try {
      router.LoadDynamicRoute('test.html', '', {});
    } catch(ex) {
      expect(ex.message).to.equal("Shaman Router: route already exists - /test.html")
      done();
    }
  });

  it('LoadDynamicRoute should throw error if view not found', (done) => {
    let data = new CompilerData({});
    data.endTime = new Date();
    data.files = [
      { name: 'test.html', type: 'html', contents: '' }
    ]
    let router = new ShamanRouter(data);
    try {
      router.LoadDynamicRoute('test-dynamic.html', 'test.dynamic.html', {});
    } catch(ex) {
      expect(ex.message).to.equal("Shaman Router: could not find dynamic view - test.dynamic.html")
      done();
    }
  });

  it('LoadDynamicRoute should throw error if view not found', () => {
    let data = new CompilerData({});
    data.endTime = new Date();
    data.files = [
      { name: 'test.html', type: 'html', contents: '', data: {name: "test"} },
      { name: 'test.dynamic.html', type: 'dynamic.html', contents: '', data: {name: "dynamic"} }
    ]
    let router = new ShamanRouter(data);
    let compiler = sandbox.stub(router.handlebars, 'compile');
    compiler.returns((data) => { return '' });
    router.LoadDynamicRoute('/test-dynamic.html', 'test.dynamic.html', {foo: "bar"});
    expect(router.routes['/test-dynamic.html']).not.to.be.null;
  });

});

function mockRequest(url = '/test.html') {
  return {
    method: 'GET', 
    url: url,
    headers: []
  }
}
function mockResponse(write = (content) => {}) {
  return {
    header: function (obj1, obj2) {},
    writeHead: function (obj1, obj2) {},
    write: write,
    status: function (num) { return function(content) {} },
    end: function () {}
  }
}
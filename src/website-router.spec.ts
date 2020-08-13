import 'mocha';
import { expect } from 'chai';
import { IoC, TYPES } from './composition/app.composition';
import { WebsiteConfig, FileData, Bundle } from './models';
import { CreateDataContext } from './data/compiler.context.spec';
import { DynamicRoute } from './models/dynamic-route';
import { WebsiteRouter } from './website-router';
import { CompilerDataContext } from './data/compiler.context';

describe('WebsiteRouter', () => {

  beforeEach(() => {
    IoC.snapshot();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(new WebsiteConfig());
  });

  afterEach(() => {
    IoC.restore();
  });

  it('getAllRoutes should return sample.html route', (done) => {
    CreateDataContext(IoC)
      .then(addTestFileToContext)
      .then(_ => {
        let router = new WebsiteRouter();
        return router.getAllRoutes();
      })
      .then(routes => {
        expect(routes.findIndex(r => r.path == 'sample.html')).not.to.equal(-1);
        done();
      })
  });

  it('getAllRoutes should return bundle1.js route', (done) => {
    CreateDataContext(IoC)
      .then(addTestBundleToContext)
      .then(_ => {
        let router = new WebsiteRouter();
        return router.getAllRoutes();
      })
      .then(routes => {
        expect(routes.findIndex(r => r.path == 'bundle1.js')).not.to.equal(-1);
        done();
      })
  });

  it('getAllRoutes should return dynamic1.html route', (done) => {
    CreateDataContext(IoC)
      .then(addDynamicRouteToContext)
      .then(_ => {
        let router = new WebsiteRouter();
        return router.getAllRoutes();
      })
      .then(routes => {
        expect(routes.findIndex(r => r.path == 'dynamic1.html')).not.to.equal(-1);
        done();
      })
  });

  it('getAllRoutes should not create route for private.html file', (done) => {
    CreateDataContext(IoC)
      .then(addTestFileToContext)
      .then(addPrivateFileToContext)
      .then(_ => {
        let router = new WebsiteRouter();
        return router.getAllRoutes();
      })
      .then(routes => {
        expect(routes.findIndex(r => r.path == 'private.html')).to.equal(-1);
        done();
      })
  });

});

function addTestFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('sample.html', './sample.html'); 
  file.available = true;
  file.model.shaman;
  context.models.files.add('sample.html', file);
  return context.saveChanges().then(_ => (context));
}

function addTestBundleToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let bundle = new Bundle({name: 'bundle1', type: 'js', files: [], path: ''});
  bundle.content = 'var $ = {}';
  context.models.bundles.add('bundle1', bundle);
  return context.saveChanges().then(_ => (context));
}

function addDynamicRouteToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let route = new DynamicRoute();
  route.path = 'dynamic1.html';
  route.content = 'test content';
  context.models.dynamicRoutes.add(route.path, route);
  return context.saveChanges().then(_ => (context));
}

function addPrivateFileToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file = new FileData('private.html', './private.html'); 
  file.available = true;
  file.model.shaman = { private: true };
  context.models.files.add('private.html', file);
  return context.saveChanges().then(_ => (context));
}
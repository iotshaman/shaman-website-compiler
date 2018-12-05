import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { ShamanRouteMap } from './shaman-route.model';
import { SitemapFactory } from './sitemap-factory';

describe('Sitemap Factory', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('Should be created', () => {
    let sitemapFactory = new SitemapFactory();
    expect(sitemapFactory).not.to.be.null;
  });

  it('GenerateSitemap should return empty string if no valid routes', () => {
    let sitemapFactory = new SitemapFactory();
    let sitemap = sandbox.stub(sitemapFactory.sitemap, 'createSitemap');
    sitemap.returns(new MockSitemap());
    let routes: ShamanRouteMap = {
      '/dont-add.txt': { path: '', file: null, content: '', headers: [], mimeType: 'text/plain'}
    }
    let rslt = sitemapFactory.GenerateSitemap({}, routes);
    expect(rslt).to.equal('');
  });

  it('GenerateSitemap should handle index.html as special route', () => {
    let sitemapFactory = new SitemapFactory();
    let sitemap = sandbox.stub(sitemapFactory.sitemap, 'createSitemap');
    sitemap.returns(new MockSitemap());
    let routes: ShamanRouteMap = {
      '/index.html': { path: '', file: null, content: '', headers: [], mimeType: 'text/html'}
    }
    let rslt = sitemapFactory.GenerateSitemap({}, routes);
    expect(rslt).to.equal('/');
  });

  it('GenerateSitemap should handle index as special route', () => {
    let sitemapFactory = new SitemapFactory();
    let sitemap = sandbox.stub(sitemapFactory.sitemap, 'createSitemap');
    sitemap.returns(new MockSitemap());
    let routes: ShamanRouteMap = {
      '/index': { path: '', file: null, content: '', headers: [], mimeType: 'text/html'}
    }
    let rslt = sitemapFactory.GenerateSitemap({}, routes);
    expect(rslt).to.equal('/');
  });

  it('GenerateSitemap should add html files to sitemap', () => {
    let sitemapFactory = new SitemapFactory();
    let sitemap = sandbox.stub(sitemapFactory.sitemap, 'createSitemap');
    sitemap.returns(new MockSitemap());
    let routes: ShamanRouteMap = {
      '/blog.html': { path: '', file: null, content: '', headers: [], mimeType: 'text/html'}
    }
    let rslt = sitemapFactory.GenerateSitemap({}, routes);
    expect(rslt).to.equal('/blog.html');
  });

});

class MockSitemap {
  files: string = '';
  add = (route) => { this.files += route.url; }
  toString = () => { return this.files; }
}
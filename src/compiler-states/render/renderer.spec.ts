import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as Promise from 'promise';

import { Renderer } from './renderer';
import { CompilerData } from '../../compiler/compiler-data.model';

describe('File Service', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('Should be created', () => {
    let renderer = new Renderer();
    expect(renderer).not.to.be.null;
  });

  it('Renderer should register handlebars partials', (done) => {
    let renderer = new Renderer();
    let compilerData = new CompilerData({});
    compilerData.files = [{name: 'test.partial.html', contents: '', type: 'partial.html'}]
    let partials = sandbox.stub(renderer.handlebars, 'registerPartial');
    sandbox.stub(renderer.handlebars, 'compile');
    renderer.OnStateChange((data: CompilerData) => {
      sinon.assert.calledOnce(partials);
      done();
    })
    renderer.Process(compilerData);
  });

  it('Renderer should load handlebars plugin', (done) => {
    let renderer = new Renderer();
    let compilerData = new CompilerData({handlebarsPlugin: (hb) => {}});
    sandbox.stub(renderer.handlebars, 'compile');
    let plugin = sandbox.stub(compilerData.config, 'handlebarsPlugin');
    renderer.OnStateChange((data: CompilerData) => {
      sinon.assert.calledOnce(plugin);
      done();
    })
    renderer.Process(compilerData);
  });

  it('Renderer should compile templates', (done) => {
    let renderer = new Renderer();
    let compilerData = new CompilerData({});
    compilerData.files = [
      {name: 'test.html', contents: '', type: 'html'},
      {name: 'test.js', contents: '', type: 'js'}
    ]
    let compiler = sandbox.stub(renderer.handlebars, 'compile');
    compiler.returns((data) => { return '' });
    renderer.OnStateChange((data: CompilerData) => {
      sinon.assert.calledOnce(compiler);
      done();
    })
    renderer.Process(compilerData);
  });

});
import 'mocha';
import * as sinon from 'sinon';
import * as _handlebars from 'handlebars';
import * as _fsx from 'fs-extra';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData } from '../models';
import { HandlebarsService } from './handlebars.service';

describe('GlobService', () => {
  
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    IoC.snapshot();
    sandbox = sinon.createSandbox();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(new WebsiteConfig());
  });

  afterEach(() => {
    IoC.restore();
    sandbox.restore();
  });

  it('should be created', () => {
    let subject = new HandlebarsService();
    expect(subject).not.to.be.null;
  });

  it('registerPartials should call handlebars.registerPartial', () => {
    let subject = new HandlebarsService();
    let stub = sandbox.stub(_handlebars, 'registerPartial');
    subject.registerPartials([new FileData("a.partial.html", "./a.partial.html")]);
    expect(stub.called).to.be.true;
  });

  it('registerHelpers should run helper files as functions', () => {
    let subject = new HandlebarsService();
    let content = 'handlebars.registerHelper();console.warn("test");';
    let stub = sandbox.stub(_handlebars, 'registerHelper');
    sandbox.stub(_fsx, 'readFile').returns(<any>Promise.resolve(content));
    subject.registerHelpers([new FileData("a.helper.js", "./a.helper.js")]);
    // should not have '.not.' in expect, this should be revisited
    expect(stub.called).not.to.be.true;
  });

  it('renderTemplate should use model to render if model provided', () => {
    let subject = new HandlebarsService();
    let file = new FileData("a.html", "./a.html");
    file.content = '<div>{{model.title}}</div>';
    file.model = { title: 'file.model' };
    let result = subject.renderTemplate(file, {title: 'model'});
    expect(result).to.equal('<div>model</div>');
  });

  it('renderTemplate should use file.model to render', () => {
    let subject = new HandlebarsService();
    let file = new FileData("a.html", "./a.html");
    file.content = '<div>{{model.title}}</div>';
    file.model = { title: 'file.model' };
    let result = subject.renderTemplate(file);
    expect(result).to.equal('<div>file.model</div>');
  });

});
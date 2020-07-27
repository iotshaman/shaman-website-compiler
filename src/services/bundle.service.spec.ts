import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, Bundle, FileData } from '../models';
import { BundleService } from './bundle.service';
import { CreateDataContext } from '../data/compiler.context.spec';
import { CompilerDataContext } from '../data/compiler.context';

describe('BundleService', () => {

  beforeEach(() => {
    IoC.snapshot();
    IoC.bind<WebsiteConfig>(TYPES.WebsiteConfig).toConstantValue(new WebsiteConfig());
  });

  afterEach(() => {
    IoC.restore();
  });

  it('updateBundleContent should set bundle content', (done) => {
    CreateDataContext(IoC).then(addTestBundleToContext).then(addTestFilesToContext).then(context => {
      let subject = new BundleService();
      subject.updateBundleContent().then(_ => {
        let result = context.models.bundles.find('bundle1');
        expect(result.content).to.equal('var $1 = {}var $2 = {}');
        done();
      });
    });    
  })

})

function addTestBundleToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let bundle = new Bundle({name: 'bundle1', type: 'js', files: [], path: ''});
  bundle.files = ['script1.js', 'script2.js'];
  context.models.bundles.add('bundle1', bundle);
  return context.saveChanges().then(_ => (context));
}

function addTestFilesToContext(context: CompilerDataContext): Promise<CompilerDataContext> {
  let file1 = new FileData('script1.js', './script1.js');
  let file2 = new FileData('script2.js', './script2.js');
  file1.content = 'var $1 = {}'; file2.content = 'var $2 = {}';
  context.models.files.add('script1.js', file1);
  context.models.files.add('script2.js', file2);
  return context.saveChanges().then(_ => (context));
}
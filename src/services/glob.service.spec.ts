import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig } from '../models';
import { GlobService } from './glob.service';

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

  it('GetFilesFromGlob should return files', () => {
    let subject = new GlobService();
    sandbox.stub(subject, 'fastGlob').returns(Promise.resolve(['a.html', 'b.html']));
    subject.GetFilesFromGlob([]).then(rslt => {
      expect(rslt.length).to.equal(2);
    });
  });

});
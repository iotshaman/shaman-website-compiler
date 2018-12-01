import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import * as Promise from 'promise';

import { GlobService } from './glob.service';

describe('Glob Service', () => {

  it('Should be created', () => {
    let globService = new GlobService();
    expect(globService).not.to.be.null;
  });

  it('Get should return an array of files', (done) => {
    let globService = new GlobService();
    globService.fastGlob = (patterns, type, options) => { 
      return new Promise((res) => { res(['file1.html']); })
    }
    globService.GetFilesFromGlob([], 'html', {}).then((rslt) => {
      expect(rslt).not.to.be.null;
      expect(rslt[0].name).to.equal('file1.html');
      expect(rslt[0].type).to.equal('html');
      expect(rslt[0].contents).to.equal('');
      done();
    })
  });

});
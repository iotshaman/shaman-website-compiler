import { IOC, Configure } from './inversify.config';
import { IOC_TYPES } from './invesify.types';
import { expect } from 'chai';
import 'mocha';
import { GlobService } from '../globs';

describe('Inversify', () => {

  beforeEach(() => {
    IOC.snapshot();
    Configure();
  })

  afterEach(() => {
    IOC.restore();
  })

  it('should load dependencies', () => {
    let subject = IOC.get<GlobService>(IOC_TYPES.GlobService);
    expect(subject).not.to.be.null;
  })

})
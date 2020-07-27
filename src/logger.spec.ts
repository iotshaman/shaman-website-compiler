import 'mocha';
import * as sinon from "sinon";
import { expect } from 'chai';
import { Logger } from './logger';

describe('Logger', () => {

  var sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('logger.level should be set to "info" if not provided', () => {
    let logger = new Logger();
    expect(logger.level).to.equal(2);
  });

  it('logger.level should be set to "info" if not invalid level provided', () => {
    let logger = new Logger("INVALID");
    expect(logger.level).to.equal(2);
  });

  it('logger should not output if level is less than loggers log-level', () => {
    var logger = new Logger();
    let stub = sandbox.stub(logger.console, 'log');
    logger.log('test');
    expect(stub.called).to.be.false;
  });

  it('logger should write to console', () => {
    var logger = new Logger();
    let stub = sandbox.stub(logger.console, 'log');
    logger.log('test', 1);
    expect(stub.called).to.be.true;
  });

});
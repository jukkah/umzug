'use strict';

var expect    = require('expect.js');
var Umzug     = require('../../lib/index');
var sinon     = require('sinon');
var helper    = require('../helper');

describe('constructor', () => {
  beforeEach(() => {
    helper.clearTmp();
  });

  it('exposes some methods', () => {
    var umzug = new Umzug();

    expect(umzug).to.have.property('execute');
    expect(umzug).to.have.property('pending');
    expect(umzug).to.have.property('up');
    expect(umzug).to.have.property('down');
    expect(umzug).to.have.property('log');
  });

  it('instantiates the default storage', () => {
    var umzug = new Umzug();
    expect(umzug).to.have.property('storage');
  });

  it('loads the specified storage module', () => {
    var umzug = new Umzug({ storage: 'moment' });
    expect(umzug).to.have.property('storage');
  });

  it('throws an error if the specified storage is neither a package nor a file', () => {
    expect(() => {
      new Umzug({ storage: 'nomnom' });
    }).to.throwError(
      'Unable to resolve the storage: nomnom, Error: Cannot find module \'nomnom\''
    );
  });

  it('accepts a logging function', () => {
    var spy = sinon.spy();
    var umzug = new Umzug({ logging: spy });
    umzug.log();
    expect(spy.called).to.be(true);
  });
});

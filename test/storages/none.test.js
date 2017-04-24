'use strict';

var expect    = require('expect.js');
var helper    = require('../helper');
var Storage   = require('../../lib/storages/none');

describe('none', () => {
  beforeEach(() => {
    helper.clearTmp();
  });

  describe('constructor', () => {
    it('stores no options', () => {
      var storage = new Storage();
      expect(storage).to.not.have.property('options');
    });
  });

  describe('executed', () => {
    beforeEach(() => {
      this.storage = new Storage();
      return helper.prepareMigrations(3);
    });

    it('returns an empty array', () => {
      return this.storage.executed().then((data) => {
        expect(data).to.eql([]);
      });
    });

    it('returns an empty array even if migrations were executed', () => {
      return this.storage.logMigration('foo.js').then(() => {
        return this.storage.executed();
      }).then((data) => {
        expect(data).to.eql([]);
      });
    });
  });
});

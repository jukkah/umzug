'use strict';

var expect    = require('expect.js');
var helper    = require('../helper');
var Umzug     = require('../../lib/index');

describe('executed', () => {
  beforeEach(() => {
    helper.clearTmp();
    return helper
      .prepareMigrations(3)
      
      .then((migrationNames) => {
        this.migrationNames = migrationNames;
        this.umzug          = new Umzug({
          migrations:     { path: __dirname + '/../tmp/' },
          storageOptions: { path: __dirname + '/../tmp/umzug.json' }
        });
      });
  });

  describe('when no migrations has been executed yet', () => {
    beforeEach(() => {
      return this.umzug.executed()
        .then((migrations) => {
          this.migrations = migrations;
        });
    });

    it('returns an array', () => {
      expect(this.migrations).to.be.an(Array);
    });

    it('returns 0 items', () => {
      expect(this.migrations).to.have.length(0);
    });
  });

  describe('when one migration has been executed yet', () => {
    beforeEach(() => {
      return this.umzug.execute({
        migrations: [ this.migrationNames[0] ],
        method:     'up'
      }).then(() => {
        return this.umzug.executed();
      }).then((migrations) => {
        this.migrations = migrations;
      });
    });

    it('returns an array', () => {
      expect(this.migrations).to.be.an(Array);
    });

    it('returns 1 items', () => {
      expect(this.migrations).to.have.length(1);
      expect(this.migrations[0].file).to.equal(this.migrationNames[0] + '.js');
    });
  });

  describe('when all migration has been executed yet', () => {
    beforeEach(() => {
      return this.umzug.execute({
        migrations: this.migrationNames,
        method:     'up'
      }).then(() => {
        return this.umzug.executed();
      }).then((migrations) => {
        this.migrations = migrations;
      });
    });

    it('returns an array', () => {
      expect(this.migrations).to.be.an(Array);
    });

    it('returns 3 items', () => {
      expect(this.migrations).to.have.length(3);
      expect(this.migrations[0].file).to.equal(this.migrationNames[0] + '.js');
      expect(this.migrations[1].file).to.equal(this.migrationNames[1] + '.js');
      expect(this.migrations[2].file).to.equal(this.migrationNames[2] + '.js');
    });
  });

  describe('when storage returns a thenable', () => {
    beforeEach(() => {
      // migration has been executed already
      return this.umzug.execute({
        migrations: [ this.migrationNames[0] ],
        method:     'up'
      }).then(() => {
        this.umzug.storage = helper.wrapStorageAsCustomThenable(this.umzug.storage);
        return this.umzug.executed();
      }).then((migrations) => {
        this.migrations = migrations;
      });
    });

    it('returns an array', () => {
      expect(this.migrations).to.be.an(Array);
    });

    it('returns 1 items', () => {
      expect(this.migrations).to.have.length(1);
      expect(this.migrations[0].file).to.equal(this.migrationNames[0] + '.js');
    });
  });
});

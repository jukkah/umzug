'use strict';

var expect    = require('expect.js');
var helper    = require('../helper');
var Migration = require('../../lib/migration');
var Umzug     = require('../../lib/index');

describe('pending', () => {
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
      return this.umzug.pending().then((migrations) => {
        this.migrations = migrations;
      });
    });

    it('returns an array', () => {
      expect(this.migrations).to.be.an(Array);
    });

    it('returns 3 items', () => {
      expect(this.migrations).to.have.length(3);
    });

    it('returns migration instances', () => {
      this.migrations.forEach((migration) => {
        expect(migration).to.be.a(Migration);
      });
    });
  });

  describe('when a migration has been executed already', () => {
    beforeEach(() => {
      return this.umzug.execute({
        migrations: [ this.migrationNames[0] ],
        method:     'up'
      }).then(() => {
        return this.umzug.pending();
      }).then((migrations) => {
        this.migrations = migrations;
      });
    });

    it('returns only 2 items', () => {
      expect(this.migrations).to.have.length(2);
    });

    it('returns only the migrations that have not been run yet', () => {
      var self = this;

      this.migrationNames.slice(1).forEach((migrationName, i) => {
        expect(self.migrations[i].file).to.equal(migrationName + '.js');
      });
    });
  });

  describe('when storage returns a thenable', () => {
    beforeEach(() => {

      //a migration has been executed already
      return this.umzug.execute({
        migrations: [ this.migrationNames[0] ],
        method:     'up'
      }).then(() => {

        //storage returns a thenable
        this.umzug.storage = helper.wrapStorageAsCustomThenable(this.umzug.storage);

        return this.umzug.pending();
      }).then((migrations) => {
        this.migrations = migrations;
      });
    });

    it('returns only 2 items', () => {
      expect(this.migrations).to.have.length(2);
    });

    it('returns only the migrations that have not been run yet', () => {
      var self = this;

      this.migrationNames.slice(1).forEach((migrationName, i) => {
        expect(self.migrations[i].file).to.equal(migrationName + '.js');
      });
    });
  });
});

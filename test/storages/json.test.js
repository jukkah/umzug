'use strict';

var Bluebird  = require('bluebird');
var expect    = require('expect.js');
var fs        = require('fs');
var helper    = require('../helper');
var path      = require('path');
var Storage   = require('../../lib/storages/json');

describe('JSON', () => {
  beforeEach(() => {
    helper.clearTmp();
  });

  describe('constructor', () => {
    it('stores options', () => {
      var storage = new Storage();
      expect(storage).to.have.property('options');
    });

    it('sets the default storage path', () => {
      var storage = new Storage();
      expect(storage.options.storageOptions.path).to.equal(
        path.normalize(process.cwd() + '/umzug.json')
      );
    });
  });

  describe('logMigration', () => {
    beforeEach(() => {
      this.path    = __dirname + '/../tmp/umzug.json';
      this.storage = new Storage({
        storageOptions: { path: this.path }
      });
      return helper.prepareMigrations(3);
    });

    it('creates a new file if not exists yet', () => {
      expect(fs.existsSync(this.path)).to.not.be.ok();
      return this.storage.logMigration('asd.js').then(() => {
        expect(fs.existsSync(this.path)).to.be.ok();
      });
    });

    it('adds the passed value to the storage', () => {
      return this.storage.logMigration('asd.js').then(() => {
        return Bluebird.promisify(fs.readFile)(this.path);
      }).then((content) => {
        return JSON.parse(content);
      }).then((data) => {
        expect(data).to.eql(['asd.js']);
      });
    });
  });

  describe('unlogMigration', () => {
    beforeEach(() => {
      this.path    = __dirname + '/../tmp/umzug.json';
      this.storage = new Storage({
        storageOptions: { path: this.path }
      });
      return helper.prepareMigrations(3);
    });

    it('removes the passed value from the storage', () => {
      var read = () => {
        return Bluebird
          .promisify(fs.readFile)(this.path)
          .then((content) => {
            return JSON.parse(content);
          });
      };

      return this.storage.logMigration('foo.js').then(() => {
        return this.storage.logMigration('bar.js');
      })
      .then(read)
      .then((data) => {
        expect(data).to.eql([ 'foo.js', 'bar.js' ]);
      })
      .then(() => {
        return this.storage.unlogMigration('foo.js');
      })
      .then(read)
      .then((data) => {
        expect(data).to.eql([ 'bar.js' ]);
      });
    });
  });

  describe('executed', () => {
    beforeEach(() => {
      this.path    = __dirname + '/../tmp/umzug.json';
      this.storage = new Storage({
        storageOptions: { path: this.path }
      });
      return helper.prepareMigrations(3);
    });

    it('returns an empty array if no migrations were logged yet', () => {
      return this.storage.executed().then((data) => {
        expect(data).to.eql([]);
      });
    });

    it('returns executed migrations', () => {
      return this.storage.logMigration('foo.js').then(() => {
        return this.storage.executed();
      }).then((data) => {
        expect(data).to.eql([ 'foo.js' ]);
      });
    });
  });
});

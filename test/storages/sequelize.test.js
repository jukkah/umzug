'use strict';

var expect    = require('expect.js');
var helper    = require('../helper');
var Storage   = require('../../lib/storages/sequelize');
var Sequelize = require('sequelize');

describe('sequelize', () => {
  beforeEach(() => {
    helper.clearTmp();

    this.storagePath = __dirname + '/../tmp/storage.sqlite';
    this.sequelize   = new Sequelize('database', 'username', 'password', {
      dialect: 'sqlite',
      storage: this.storagePath,
      logging: false
    });
  });

  describe('constructor', () => {
    it('requires a "sequelize" or "model" storage option', () => {
      expect(() => {
        new Storage();
      }).to.throwException('One of "sequelize" or "model" storage option is required');
    });

    it('stores options', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize
        }
      });
      expect(storage).to.have.property('options');
      expect(storage.options).to.have.property('storageOptions');
    });

    it('accepts a "sequelize" option and creates a model', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize
        }
      });
      expect(storage.options.storageOptions.model).to.equal(
        this.sequelize.model('SequelizeMeta')
      );
      expect(storage.options.storageOptions.model.getTableName()).to.equal(
        'SequelizeMeta'
      );
      return storage.options.storageOptions.model.sync()
        .then((model) => {
          return model.describe();
        })
        .then((description) => {
          expect(description).to.only.have.keys(['name']);
          expect(description.name.type).to.eql('VARCHAR(255)');
          // expect(description.name.defaultValue).to.be.oneOf([null, undefined])
          if (description.name.defaultValue !== undefined) {
            expect(description.name.defaultValue).to.eql(null);
          }
          expect(description.name.primaryKey).to.be.ok();
        });
    });

    it('accepts a "modelName" option', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          modelName: 'CustomModel'
        }
      });
      expect(storage.options.storageOptions.model).to.equal(
        this.sequelize.model('CustomModel')
      );
      expect(storage.options.storageOptions.model.getTableName()).to.equal(
        'CustomModels'
      );
    });

    it('accepts a "tableName" option', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          tableName: 'CustomTable'
        }
      });
      expect(storage.options.storageOptions.model).to.equal(
        this.sequelize.model('SequelizeMeta')
      );
      expect(storage.options.storageOptions.model.getTableName()).to.equal(
        'CustomTable'
      );
    });

    it('accepts a "columnName" option', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          columnName: 'customColumn'
        }
      });
      return storage.options.storageOptions.model.sync()
        .then((model) => {
          return model.describe();
        })
        .then((description) => {
          expect(description).to.only.have.keys(['customColumn']);
        });
    });

    it('accepts a "timestamps" option', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          timestamps: true
        }
      });
      return storage.options.storageOptions.model.sync()
        .then((model) => {
          return model.describe();
        })
        .then((description) => {
          expect(description).to.only.have.keys(['name','createdAt','updatedAt']);
        });
    });

    it('accepts a "columnType" option', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          columnType: new Sequelize.STRING(190)
        }
      });
      return storage.options.storageOptions.model.sync()
        .then((model) => {
          return model.describe();
        })
        .then((description) => {
          expect(description.name.type).to.eql('VARCHAR(190)');
          // expect(description.name.defaultValue).to.be.oneOf([null, undefined])
          if (description.name.defaultValue !== undefined) {
            expect(description.name.defaultValue).to.eql(null);
          }
          expect(description.name.primaryKey).to.eql(true);
        });
    });

    it('accepts a "model" option', () => {
      var Model = this.sequelize.define('CustomModel', {
        columnName: {
          type: Sequelize.STRING
        },
        someOtherColumn: {
          type: Sequelize.INTEGER
        }
      });

      var storage = new Storage({
        storageOptions: {
          model: Model
        }
      });
      expect(storage.options.storageOptions.model).to.equal(Model);
    });
  }); //end describe('constructor', () => {

  describe('logMigration', () => {
    it('creates the table if it doesn\'t exist yet', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize
        }
      });

      return storage.options.storageOptions.model.sequelize.getQueryInterface().showAllTables()
        .then((allTables) => {
          expect(allTables).to.be.empty();
        })
        .then(() => {
          return storage.logMigration('asd.js');
        })
        .then(() => {
          return storage.options.storageOptions.model.sequelize.getQueryInterface().showAllTables();
        })
        .then((allTables) => {
          expect(allTables).to.eql(['SequelizeMeta']);
        });
    });

    it('writes the migration to the database', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize
        }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations.length).to.be(1);
          expect(migrations[0].name).to.be('asd.js');
        });
    });

    it('writes the migration to the database with a custom column name', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          columnName: 'customColumnName'
        }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations.length).to.be(1);
          expect(migrations[0].customColumnName).to.be('asd.js');
        });
    });

    it('writes the migration to the database with timestamps', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          timestamps: true
        }
      });

      // Sequelize | startTime | createdAt | endTime
      // <= v2     | .123      | .000      | .456
      // >= v3     | .123      | .345      | .456
      // Sequelize <= v2 doesn't store milliseconds in timestamps so comparing
      // it to startTime with milliseconds fails. That's why we ignore
      // milliseconds in startTime too.
      var startTime = new Date(Math.floor(Date.now() / 1000) * 1000);

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations.length).to.be(1);
          expect(migrations[0].name).to.be('asd.js');
          expect(migrations[0].createdAt).to.be.within(startTime, new Date());
        });
    });
  }); //end describe('logMigration', () => {

  describe('unlogMigration', () => {
    it('creates the table if it doesn\'t exist yet', () => {
      var storage = new Storage({
        storageOptions: { sequelize: this.sequelize }
      });

      return storage.options.storageOptions.model.sequelize.getQueryInterface().showAllTables()
        .then((allTables) => {
          expect(allTables).to.be.empty();
        })
        .then(() => {
          return storage.unlogMigration('asd.js');
        })
        .then(() => {
          return storage.options.storageOptions.model.sequelize.getQueryInterface().showAllTables();
        })
        .then((allTables) => {
          expect(allTables).to.eql(['SequelizeMeta']);
        });
    });

    it('deletes the migration from the database', () => {
      var storage = new Storage({
        storageOptions: { sequelize: this.sequelize }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations.length).to.be(1);
        })
        .then(() => {
          return storage.unlogMigration('asd.js');
        })
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations).to.be.empty();
        });
    });

    it('deletes only the passed migration', () => {
      var storage = new Storage({ storageOptions: { sequelize: this.sequelize } });

      return storage.logMigration('migration1.js')
        .then(() => { return storage.logMigration('migration2.js'); })
        .then(() => { return storage.unlogMigration('migration2.js'); })
        .then(() => { return storage._model().findAll(); })
        .then((migrations) => {
          expect(migrations.length).to.be(1);
          expect(migrations[0].name).to.equal('migration1.js');
        });
    });

    it('deletes the migration from the database with a custom column name', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          columnName: 'customColumnName'
        }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations.length).to.be(1);
        })
        .then(() => {
          return storage.unlogMigration('asd.js');
        })
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations).to.be.empty();
        });
    });

    it('deletes the migration from the database with timestamps', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          timestamps: true
        }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations.length).to.be(1);
        })
        .then(() => {
          return storage.unlogMigration('asd.js');
        })
        .then(() => {
          return storage.options.storageOptions.model.findAll();
        })
        .then((migrations) => {
          expect(migrations).to.be.empty();
        });
    });

  });

  describe('executed', () => {
    it('creates the table if it doesn\'t exist yet', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize
        }
      });

      return storage.options.storageOptions.model.sequelize.getQueryInterface().showAllTables()
        .then((allTables) => {
          expect(allTables).to.be.empty();
        })
        .then(() => {
          return storage.executed();
        })
        .then(() => {
          return storage.options.storageOptions.model.sequelize.getQueryInterface().showAllTables();
        })
        .then((allTables) => {
          expect(allTables).to.eql(['SequelizeMeta']);
        });
    });

    it('returns an empty array if no migrations were logged yet', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize
        }
      });

      return storage.executed()
        .then((migrations) => {
          expect(migrations).to.be.empty();
        });
    });

    it('returns executed migrations', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize
        }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.executed();
        })
        .then((migrations) => {
          expect(migrations).to.be.eql(['asd.js']);
        });
    });

    it('returns executed migrations with a custom column name', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          columnName: 'customColumnName'
        }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.executed();
        })
        .then((migrations) => {
          expect(migrations).to.be.eql(['asd.js']);
        });
    });

    it('returns executed migrations with timestamps', () => {
      var storage = new Storage({
        storageOptions: {
          sequelize: this.sequelize,
          timestamps: true
        }
      });

      return storage.logMigration('asd.js')
        .then(() => {
          return storage.executed();
        })
        .then((migrations) => {
          expect(migrations).to.be.eql(['asd.js']);
        });
    });
  }); //end describe('executed', () => {
}); //end describe('sequelize', () => {

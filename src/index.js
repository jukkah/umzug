'use strict';

var _            = require('lodash');
var Bluebird     = require('bluebird');
var fs           = require('fs');
var Migration    = require('./migration');
var path         = require('path');
var EventEmitter = require('events').EventEmitter;

/**
 * @class Umzug
 * @extends EventEmitter
 */
module.exports = class Umzug extends EventEmitter {
  /**
   * Constructs Umzug instance.
   *
   * @param {Object} [options]
   * @param {String} [options.storage='json'] - The storage. Possible values:
   * 'json', 'sequelize', an argument for `require()`, including absolute paths.
   * @param {function|false} [options.logging=false] - The logging function.
   * A function that gets executed every time migrations start and have ended.
   * @param {String} [options.upName='up'] - The name of the positive method
   * in migrations.
   * @param {String} [options.downName='down'] - The name of the negative method
   * in migrations.
   * @param {Object} [options.storageOptions] - The options for the storage.
   * Check the available storages for further details.
   * @param {Object} [options.migrations] -
   * @param {Array} [options.migrations.params] - The params that gets passed to
   * the migrations. Might be an array or a synchronous function which returns
   * an array.
   * @param {String} [options.migrations.path] - The path to the migrations
   * directory.
   * @param {RegExp} [options.migrations.pattern] - The pattern that determines
   * whether or not a file is a migration.
   * @param {Migration~wrap} [options.migrations.wrap] - A function that
   * receives and returns the to be executed function. This can be used to
   * modify the function.
   * @constructs Umzug
   */
  constructor(options) {
    super();
    this.options = _.assign({
      storage:        'json',
      storageOptions: {},
      logging:        false,
      upName:         'up',
      downName:       'down'
    }, options);

    if (this.options.logging && !_.isFunction(this.options.logging)) {
      throw new Error('The logging-option should be either a function or false');
    }

    this.options.migrations = _.assign({
      params:  [],
      path:    path.resolve(process.cwd(), 'migrations'),
      pattern: /^\d+[\w-]+\.js$/,
      wrap:    (fun) => { return fun; }
    }, this.options.migrations);

    this.storage = this._initStorage();
  }

  /**
   * Executes given migrations with a given method.
   *
   * @param {Object}   [options]
   * @param {String[]} [options.migrations=[]]
   * @param {String}   [options.method='up']
   * @returns {Promise}
   */
  execute(options) {
    var self = this;

    options = _.assign({
      migrations: [],
      method:     'up'
    }, options || {});

    return Bluebird
      .map(options.migrations, (migration) => {
        return self._findMigration(migration);
      })
      .then((migrations) => {
        return _.assign({}, options, { migrations: migrations });
      })
      .then((options) => {
        return Bluebird.each(options.migrations, (migration) => {
          var name = path.basename(migration.file, path.extname(migration.file));
          var startTime;
          return self
            ._wasExecuted(migration)
            .catch(() => {
              return false;
            })
            .then((executed) => {
              return (typeof executed === 'undefined') ? true : executed;
            })
            .tap((executed) => {
              if (!executed || (options.method === 'down')) {
                var fun    = (migration[options.method] || Bluebird.resolve);
                var params = self.options.migrations.params;

                if (typeof params === 'function') {
                  params = params();
                }

                if (options.method === 'up') {
                  self.log('== ' + name + ': migrating =======');
                  self.emit('migrating', name, migration);
                } else {
                  self.log('== ' + name + ': reverting =======');
                  self.emit('reverting', name, migration);
                }

                startTime = new Date();

                return fun.apply(migration, params);
              }
            })
            .then((executed) => {
              if (!executed && (options.method === 'up')) {
                return Bluebird.resolve(self.storage.logMigration(migration.file));
              } else if (options.method === 'down') {
                return Bluebird.resolve(self.storage.unlogMigration(migration.file));
              }
            })
            .tap(() => {
              var duration = ((new Date() - startTime) / 1000).toFixed(3);
              if (options.method === 'up') {
                self.log('== ' + name + ': migrated (' + duration +  's)\n');
                self.emit('migrated', name, migration);
              } else {
                self.log('== ' + name + ': reverted (' + duration +  's)\n');
                self.emit('reverted', name, migration);
              }
            });
        });
      });
  }

  /**
   * Lists executed migrations.
   *
   * @returns {Promise.<Migration>}
   */
  executed() {
    return Bluebird.resolve(this.storage.executed()).map((file) => {
      return new Migration(file);
    });
  }

  /**
   * Lists pending migrations.
   *
   * @returns {Promise.<Migration[]>}
   */
  pending() {
    return this
      ._findMigrations()
      .then((all) => {
        return Bluebird.join(all, this.executed());
      })
      .spread((all, executed) => {
        var executedFiles = executed.map((migration) => {
          return migration.file;
        });

        return all.filter((migration) => {
          return executedFiles.indexOf(migration.file) === -1;
        });
      });
  }

  /**
   * Execute migrations up.
   *
   * If options is a migration name (String), it will be executed.
   * If options is a list of migration names (String[]), them will be executed.
   * If options is Object:
   * - { from: 'migration-1', to: 'migration-n' } - execute migrations in range.
   * - { migrations: [] } - execute migrations in array.
   *
   * @param {String|String[]|Object} options
   * @param {String}     [options.from] - The first migration to execute (exc).
   * @param {String}     [options.to] - The last migration to execute (inc).
   * @param {String[]}   [options.migrations] - List of migrations to execute.
   * @returns {Promise}
   */
  up(options) {
    return this._run('up', options, this.pending.bind(this));
  }

  /**
   * Execute migrations down.
   *
   * If options is a migration name (String), it will be executed.
   * If options is a list of migration names (String[]), them will be executed.
   * If options is Object:
   * - { from: 'migration-n', to: 'migration-1' } - execute migrations in range.
   * - { migrations: [] } - execute migrations in array.
   *
   * @param {String|String[]|Object} options
   * @param {String}     [options.from] - The first migration to execute (exc).
   * @param {String}     [options.to] - The last migration to execute (inc).
   * @param {String[]}   [options.migrations] - List of migrations to execute.
   * @returns {Promise}
   */
  down(options) {
    var getExecuted = () => {
      return this.executed().then((migrations) => {
        return migrations.reverse();
      });
    };

    if (typeof options === 'undefined' || _.isEqual(options, {})) {
      return getExecuted().then((migrations) => {
        return migrations[0]
          ? this.down(migrations[0].file)
          : Bluebird.resolve([]);
      });
    } else {
      return this._run('down', options, getExecuted.bind(this));
    }
  }

  /**
   * Callback function to get migrations in right order.
   *
   * @callback Umzug~rest
   * @return {Promise.<Migration[]>}
   */

  /**
   * Execute migrations either down or up.
   *
   * If options is a migration name (String), it will be executed.
   * If options is a list of migration names (String[]), them will be executed.
   * If options is Object:
   * - { from: 'migration-1', to: 'migration-n' } - execute migrations in range.
   * - { migrations: [] } - execute migrations in array.
   *
   * @param {String} method - Method to run. Either 'up' or 'down'.
   * @param {String|String[]|Object} options
   * @param {String}     [options.from] - The first migration to execute (exc).
   * @param {String}     [options.to] - The last migration to execute (inc).
   * @param {String[]}   [options.migrations] - List of migrations to execute.
   * @param {Umzug~rest} [rest] - Function to get migrations in right order.
   * @returns {Promise}
   * @private
   */
  _run(method, options, rest) {
    if (typeof options === 'string') {
      return this._run(method, [ options ]);
    } else if (Array.isArray(options)) {
      return Bluebird.resolve(options)
        .map((migration) => {
          return this._findMigration(migration);
        })
        .then((migrations) => {
          return method === 'up' ?
            this._arePending(migrations) :
            this._wereExecuted(migrations);
        })
        .then(() => {
          return this._run(method, { migrations: options });
        });
    }

    options = _.assign({
      to:         null,
      from:       null,
      migrations: null
    }, options || {});

    if (options.migrations) {
      return this.execute({
        migrations: options.migrations,
        method: method
      });
    } else {
      return rest()
        .then((migrations) => {
          var result = Bluebird.resolve();

          if (options.to) {
            result = result
              .then(() => {
                // There must be a migration matching to options.to...
                return this._findMigration(options.to);
              })
              .then((migration) => {
                // ... and it must be pending/executed.
                return method === 'up' ?
                  this._isPending(migration) :
                  this._wasExecuted(migration);
              });
          }

          return result.then(() => {
            return Bluebird.resolve(migrations);
          });
        })
        .then((migrations) => {
          if (options.from) {
            return this._findMigrationsFromMatch(options.from, method);
          } else {
            return migrations;
          }
        })
        .then((migrations) => {
          return this._findMigrationsUntilMatch(options.to, migrations);
        })
        .then((migrationFiles) => {
          return this._run(method, { migrations: migrationFiles });
        });
    }
  }

  /**
   * Lists pending/executed migrations depending on method from a given
   * migration excluding it.
   *
   * @param {String} from - Migration name to be searched.
   * @param {String} method - Either 'up' or 'down'. If method is 'up', only
   * pending migrations will be accepted. Otherwise only executed migrations
   * will be accepted.
   * @returns {Promise.<Migration[]>}
   * @private
   */
  _findMigrationsFromMatch(from, method) {
    // We'll fetch all migrations and work our way from start to finish
    return this._findMigrations()
      .then((migrations) => {
        var found = false;
        return migrations.filter((migration) => {
          if (migration.testFileName(from)) {
            found = true;
            return false;
          }
          return found;
        });
      })
      .filter((fromMigration) => {
        // now check if they need to be run based on status and method
        return this._wasExecuted(fromMigration)
          .then(() => {
            if (method === 'up') {
              return false;
            } else {
              return true;
            }
          })
          .catch(() => {
            if (method === 'up') {
              return true;
            } else {
              return false;
            }
          });
      });
  }

  /**
   * Pass message to logger if logging is enabled.
   *
   * @param {*} message - Message to be logged.
   */
  log(message) {
    if (this.options.logging) {
      this.options.logging(message);
    }
  }

  /**
   * Try to require and initialize storage.
   *
   * @returns {*|SequelizeStorage|JSONStorage|NoneStorage}
   * @private
   */
  _initStorage() {
    var Storage;

    try {
      Storage = require(__dirname + '/storages/' + this.options.storage);
    } catch (e) {
      // We have not been able to find the storage locally.
      // Let's try to require a module instead.
    }

    try {
      Storage = Storage || require(this.options.storage);
    } catch (e) {
      throw new Error('Unable to resolve the storage: ' + this.options.storage + ', ' + e);
    }

    return new Storage(this.options);
  }

  /**
   * Loads all migrations in ascending order.
   *
   * @returns {Promise.<Migration[]>}
   * @private
   */
  _findMigrations() {
    return Bluebird
      .promisify(fs.readdir)(this.options.migrations.path)
      .filter((file) => {
        if(!this.options.migrations.pattern.test(file)) {
          this.log('File: ' + file + ' does not match pattern: ' + this.options.migrations.pattern);
          return false;
        }
        return true;
      })
      .map((file) => {
        return path.resolve(this.options.migrations.path, file);
      })
      .map((path) => {
        return new Migration(path, this.options);
      })
      .then((migrations) => {
        return migrations.sort((a, b) => {
          if (a.file > b.file) {
            return 1;
          } else if (a.file < b.file) {
            return -1;
          } else {
            return 0;
          }
        });
      });
  }

  /**
   * Gets a migration with a given name.
   *
   * @param {String} needle - Name of the migration.
   * @returns {Promise.<Migration>}
   * @private
   */
  _findMigration(needle) {
    return this
      ._findMigrations()
      .then((migrations) => {
        return migrations.filter((migration) => {
          return migration.testFileName(needle);
        })[0];
      })
      .then((migration) => {
        if (migration) {
          return migration;
        } else {
          return Bluebird.reject(new Error('Unable to find migration: ' + needle));
        }
      });
  }

  /**
   * Checks if migration is executed. It will success if and only if there is
   * an executed migration with a given name.
   *
   * @param {String} _migration - Name of migration to be checked.
   * @returns {Promise}
   * @private
   */
  _wasExecuted(_migration) {
    return this.executed().filter((migration) => {
      return migration.testFileName(_migration.file);
    }).then((migrations) => {
      if (migrations[0]) {
        return Bluebird.resolve();
      } else {
        return Bluebird.reject(new Error('Migration was not executed: ' + _migration.file));
      }
    });
  }

  /**
   * Checks if a list of migrations are all executed. It will success if and
   * only if there is an executed migration for each given name.
   *
   * @param {String[]} migrationNames - List of migration names to be checked.
   * @returns {Promise}
   * @private
   */
  _wereExecuted(migrationNames) {
    return Bluebird
      .resolve(migrationNames)
      .map((migration) => {
        return this._wasExecuted(migration);
      });
  }

  /**
   * Checks if migration is pending. It will success if and only if there is
   * a pending migration with a given name.
   *
   * @param {String} _migration - Name of migration to be checked.
   * @returns {Promise}
   * @private
   */
  _isPending(_migration) {
    return this.pending().filter((migration) => {
      return migration.testFileName(_migration.file);
    }).then((migrations) => {
      if (migrations[0]) {
        return Bluebird.resolve();
      } else {
        return Bluebird.reject(new Error('Migration is not pending: ' + _migration.file));
      }
    });
  }

  /**
   * Checks if a list of migrations are all pending. It will success if and only
   * if there is a pending migration for each given name.
   *
   * @param {String[]} migrationNames - List of migration names to be checked.
   * @returns {Promise}
   * @private
   */
  _arePending(migrationNames) {
    return Bluebird
      .resolve(migrationNames)
      .map((migration) => {
        return this._isPending(migration);
      });
  }

  /**
   * Skip migrations in a given migration list after `to` migration.
   *
   * @param {String} to - The last one migration to be accepted.
   * @param {Migration[]} migrations - Migration list to be filtered.
   * @returns {Promise.<String>} - List of migrations before `to`.
   * @private
   */
  _findMigrationsUntilMatch(to, migrations) {
    return Bluebird.resolve(migrations)
      .map((migration) => { return migration.file; })
      .reduce((acc, migration) => {
        if (acc.add) {
          acc.migrations.push(migration);

          if (to && (migration.indexOf(to) === 0)) {
            // Stop adding the migrations once the final migration
            // has been added.
            acc.add = false;
          }
        }

        return acc;
      }, { migrations: [], add: true })
      .get('migrations');
  }
}

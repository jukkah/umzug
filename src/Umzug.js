import EventEmitter from 'events';
import Storage from './Storage';

/** @external {events~EventEmitter} https://nodejs.org/api/events.html#events_class_eventemitter */

/**
 * Umzug public API.
 */
export default class Umzug extends EventEmitter {
    /**
     * Constructs built-in storages.
     *
     * @example
     * // create basic storage
     * Umzug.createBuiltInStorage('')
     *
     * // create JSON storage with default configuration
     * Umzug.createBuiltInStorage()
     * // or
     * Umzug.createBuitInStorage('json')
     *
     * // create JSON storage with custom filename
     * Umzug.createBuiltInStorage('json', { path: 'path/to/file.json' })
     * // or
     * Umzug.createBuiltInStorage({ path: 'path/to/file.json' })
     * // or even
     * Umzug.createBuiltInStorage('path/to/file.json')
     *
     * // create Sequelize storage (the same works with model)
     * let sequelize = ...
     * Umzug.createBuiltInStorage('sequelize', { sequelize: sequelize })
     * // or
     * Umzug.createBuitInStorage({ sequelize: sequelize })
     * // or even
     * Umzug.createBuitInStorage(sequelize)
     *
     * // create Sequelize storage from existing model with custom columns
     * let model = ...
     * Umzug.createBuiltInStorage('sequelize', {
     *     model: model,
     *     name: 'migration',
     *     timestamp: 'executed_at'
     * })
     *
     * // create Sequelize storage with full configuration
     * let Sequelize = ...
     * let sequelize = ...
     * Umzug.createBuitInStorage('sequelize', {
     *     sequelize: sequelize,
     *     modelName: 'ExecutedMigrations',
     *     tableName: 'executed_migrations'
     *     schema: 'core',
     *     name: {
     *         columnName: 'migration'
     *         // using default type
     *     },
     *     timestamp: {
     *         // using default name
     *         columnType: Sequelize.DATE
     *     }
     * })
     *
     * @param {string} [type='json'] Type of built-in storage. If omitted, it
     *     will try to guess type based on given options. Use '' (empty string)
     *     for {@link Storage}, 'json' for {@link JSONStorage}, and 'sequelize'
     *     for {@link SequelizeStorage}
     * @param {object} [options] Parameters passed to built-in storage
     *     constructor. See {@link Storage#constructor},
     *     {@link JSONStorage#constructor}, and
     *     {@link SequelizeStorage#constructor} for details.
     * @returns {Storage}
     *
     * @see Storage
     * @see JSONStorage
     * @see SequelizeStorage
     */
    static createBuiltInStorage(type, options) {
        return new Storage();
    }
    /**
     * Constructs Umzug instance.
     *
     * @example
     * let storage = ...
     *
     * // construct with minimal set of parameters (don't copy-paste next line
     * // as there's a zero width space in the glob.)
     * new Umzug({ storage: storage, migrations: '/migrations/**​/*.js' }) // \u200B
     *
     * // construct with full configuration
     * new Umzug({
     *     storage: storage,
     *     log: console.log,
     *     migrations: {
     *         modules: ['/migrations/**​/*.js', '!/migrations/**​/*.tmp.js'], // \u200B
     *         up: 'setUp',
     *         down: 'tearDown',
     *         wrap: fn => fn.apply(null, 1, 2, 3)
     *     }
     * })
     *
     * @param {object} options
     * @param {Storage} options.storage Storage instance to use.
     * @param {function(message: string)} [options.log] The logging function
     *     that gets executed every time migrations start and have ended.
     * @param {string|string[]|object|object[]|function(name: string) : object|function() : object[]|object} options.migrations
     *     Either `options.migrations.modules` or object containing that and
     *     other configuration.
     * @param {string|string[]|object|object[]|function(name: string) : object|function() : object[]} options.migrations.modules
     *     Glob or path to migration files or migration modules itself or
     *     resolver function.
     * @param {string|function(module: object) : string|function} [options.migrations.up='up']
     *     Up method resolver: either its name or function that return it.
     * @param {string|function(module: object) : string|function} [options.migrations.down='down']
     *     Down method resolver: either its name or function that return it.
     * @param {Array|function() : Array} [options.migrations.params=[]]
     *     The params that gets passed to the migrations. Either an array or
     *     a function that returns an array.
     * @param {function(fn: function) : function} [options.migrations.wrap]
     *     Wrapper function for migration module methods.
     */
    constructor(options) {
        super();
    }

    /**
     * Gets a list of executed migrations.
     *
     * @example
     * // get all executed migrations
     * umzug.executed().then(...)
     *
     * // get revertible migrations; executed and source code available
     * umzug.executed({ excludeNonExisting: true }).then(...)
     *
     * @param {object} [options]
     * @param {boolean} [options.excludeExisting=false] Exclude executed
     *     migrations with source code available.
     * @param {boolean} [options.excludeNonExisting=false] Exclude executed
     *     migrations with source code not available.
     * @returns {Promise<Migration[]>}
     */
    executed(options) {
        return Promise.resolve([]);
    }

    /**
     * Gets a list of pending migrations.
     *
     * @example
     * // get all pending migrations
     * umzug.pending().then(...)
     *
     * @returns {Promise<Migration[]>}
     */
    pending() {
        return Promise.resolve([]);
    }

    /**
     * Executes migrations up.
     *
     * 1. If options is a single migration, it will be executed. If it is not
     *    pending, nothing happens.
     * 2. If options is a list of migrations, all pending migrations in that
     *    list will be executed in a given order.
     * 3. If options is a range, all pending migrations in that range will be
     *    executed.
     *
     * If `options.failFast` is enabled, execution will terminate when first
     * migration fails (skipping is not failing).
     *
     * @example
     * // from any point X to any point Y
     * umzug.up({ from: X, to: Y })
     *
     * // from the beginning to the end
     * umzug.up()
     *
     * // from any point X to the end
     * umzug.up({ from: X })
     *
     * // from the beginning to any point Y
     * umzug.up({ to: Y })
     *
     * @param {string|string[]|Migration|Migration[]|object} migrations
     *     List or range of migrations to run.
     * @param {string|Migration} [migrations.from=0] The first migration to
     *     execute (exclusive).
     * @param {string|Migration} [migrations.to=∞] The last migration to
     *     execute (inclusive).
     * @param {object} [options]
     * @param {boolean} [options.failFast=true] Fail, when first migration fails.
     * @returns {Promise<Map<Migration, boolean>, Map<Migration, boolean|Error>>}
     *     If all migrations success, the result is `Map<Migration, boolean>`
     *     where boolean value indicates _executed_ (true) or _skipped_ (false).
     *     Otherwise, if some migrations failed, the result is
     *     `Map<Migration, boolean|Error>` where boolean value indicates
     *     _executed_ (true) or _skipped_ (false) and Error if there was
     *     an error. If _failFast_ was enabled, the result contains only
     *     executed/skipped migrations and failed migration as the end.
     */
    up(migrations, options) {
        return Promise.resolve(new Map());
    }

    /**
     * Executes migrations down.
     *
     * 1. If options is a single migration, it will be reverted. If it is not
     *    executed, nothing happens.
     * 2. If options is a list of migrations, all executed migrations in that
     *    list will be reverted in a given order.
     * 3. If options is a range, all executed migrations in that range will be
     *    reverted.
     *
     * If `options.failFast` is enabled, execution will terminate when first
     * migration fails (skipping is not failing).
     *
     * @example
     * // from any point X to any point Y
     * umzug.down({ from: X, to: Y })
     *
     * // from the end to the beginning
     * umzug.down()
     *
     * // from any point X to the beginning
     * umzug.down({ from: X })
     *
     * // from the end to any point Y
     * umzug.down({ to: Y })
     *
     * @param {string|string[]|Migration|Migration[]|object} migrations
     *     List or range of migrations to run.
     * @param {string|Migration} [migrations.from=∞] The first migration to
     *     execute (exclusive).
     * @param {string|Migration} [migrations.to=0] The last migration to
     *     execute (inclusive).
     * @param {object} [options]
     * @param {boolean} [options.failFast=true] Fail, when first migration fails.
     * @returns {Promise<Map<Migration, boolean>, Map<Migration, boolean|Error>>}
     *     If all migrations success, the result is `Map<Migration, boolean>`
     *     where boolean value indicates _executed_ (true) or _skipped_ (false).
     *     Otherwise, if some migrations failed, the result is
     *     `Map<Migration, boolean|Error>` where boolean value indicates
     *     _executed_ (true) or _skipped_ (false) and Error if there was
     *     an error. If failFast was enabled, the result contains only
     *     executed/skipped migrations and failed migration as the end.
     */
    down(migrations, options) {
        return Promise.resolve(new Map());
    }
}

import Storage from './Storage';

/** @external {Sequelize} http://docs.sequelizejs.com/en/latest/api/sequelize/ */
/** @external {Model} http://docs.sequelizejs.com/en/latest/api/model/ */

/**
 * A storage that saves executed migrations to database via Sequelize.
 */
export default class SequelizeStorage extends Storage {
    /**
     * Create Sequelize model based on options.
     *
     * It creates a model matching to `modelName` with timestamps and columns
     * _name_ and _timestamp_ for storing migrations. The model name, table
     * name, name column, and timestamp column are customizable with options.
     *
     * @example
     * let Sequelize = ...
     * let sequelize = ...
     *
     * // create model with defaults
     * storage.createModel({ sequelize: sequelize })
     *
     * // create model with custom name, schema, and columns
     * storage.createModel({
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
     * @param {!object} options
     * @param {!Sequelize} options.sequelize Configured Sequelize instance
     * @param {string} [options.modelName='SequelizeMeta'] Name of the model to
     *     create if `model` option is not supplied.
     * @param {string} [options.tableName='sequelize_meta'] Name of table to
     *     create if `model` option is not supplied.
     * @param {string} [options.schema] Name of the schema to create the table
     *     under, defaults to undefined.
     * @param {object} [options.name] Column holding migration name.
     * @param {string} [options.name.columnName='name'] Name of the column
     *     holding migration name.
     * @param {object} [options.name.columnType=Sequelize.STRING] Type of the
     *     column. For utf8mb4 charsets under InnoDB, you may need to set
     *     this <= 190.
     * @param {object} [options.timestamp] Column holding execution timestamp.
     * @param {string} [options.timestamp.columnName='timestamp'] Name of the
     *     column holding execution timestamp.
     * @param {object} [options.timestamp.columnType=Sequelize.STRING] Type of
     *     the column. For utf8mb4 charsets under InnoDB, you may need to set
     *     this <= 190.
     * @return {Model}
     */
    static createModel(options) {

    }

    /**
     * Constructs a new SequelizeStorage.
     *
     * If the table does not exist, it will be created automatically.
     *
     * @example
     * let model = ...
     *
     * // construct with default column names
     * new SequelizeStorage({ model: model })
     *
     * // construct with custom column names
     * new SequelizeStorage({
     *     model: model
     *     name: 'migration',
     *     timestamp: 'executed_at'
     * })
     *
     * @param {object} [options]
     * @param {!Model} [options.model] Sequelize model - must have column names
     *     matching to `options.name` and `options.timestamp`.
     * @param {string} [options.name='name'] Name of name column.
     * @param {string} [options.timestamp='timestamp'] Name of timestamp column.
     */
    constructor(options) {
        super();
    }

    /**
     * Mark migrations executed.
     *
     * @example
     * // log one migration
     * storage.log('20160911222845-task').then(...)
     *
     * // log multiple migrations at once
     * storage.log('20160911222845-task', '20160911223053-task').then(...)
     * storage.log(['20160911222845-task', '20160911223053-task']).then(...)
     *
     * @param {...string|string[]} migrations Migrations to log.
     * @returns {Promise}
     */
    log(...migrations) {
        return Promise.resolve();
    }

    /**
     * Mark migrations not executed.
     *
     * @example
     * // unlog one migration
     * storage.unlog('20160911222845-task').then(...)
     *
     * // unlog multiple migrations at once
     * storage.unlog('20160911222845-task', '20160911223053-task').then(...)
     * storage.unlog(['20160911222845-task', '20160911223053-task']).then(...)
     *
     * @param {...string|string[]} migrations Migrations to unlog.
     * @returns {Promise}
     */
    unlog(...migrations) {
        return Promise.resolve();
    }

    /**
     * Gets a list of executed migrations.
     *
     * If calling _without timestamps_, only migration name is returned for each
     * executed migration. Otherwise, _with timestamps_, migration name is
     * returned along with timestamps when migrations has been executed.
     *
     * @example
     * // get executed migrations without timestamps (NOTE: always empty in Storage)
     * storage.executed().then(console.log)
     * // -> ['20160911222845-task', '20160911223053-task']
     *
     * // get executed migrations with timestamps (NOTE: always empty in Storage)
     * storage.executed({ withTimestamps: true }).then(console.log)
     * // -> [{ name: '20160911222845-task', timestamp: '20160912120000' }, ...]
     *
     * @param {object} [options]
     * @param {boolean} [options.withTimestamps=false]
     * @returns {Promise<string[]>|Promise<Array<{name: string, timestamp: string}>>}
     *     If called _with timestamps_, the result is
     *     `Promise<Array<{name: string, timestamp: string}>>`.
     * Otherwise, _without timestamps_, it is `Promise<string[]>`.
     */
    executed(options) {
        return Promise.resolve([]);
    }
}

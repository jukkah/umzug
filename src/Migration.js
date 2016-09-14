/**
 * Wrapper class for migration modules.
 */
export default class Migration {
    /**
     * Constructs a new Migration.
     *
     * @param {string|object|function() : object} module Path to file, module
     *     object, or resolver function.
     * @param {object} [options]
     * @param {string|function(module: object) : string} [options.up='up']
     *     Up method resolver; either its name or function that return it.
     * @param {string|function(module: object) : string} [options.down='down']
     *     Down method resolver; either its name or function that return it.
     * @param {function(fn: Function) : Function} [options.wrapper]
     *     Wrapper function for migration methods.
     */
    constructor(module, options) {
        
    }

    /**
     * Executes migration's `up` function.
     *
     * @example
     * // execute migration up
     * migration.up().then(...)
     *
     * @returns {Promise}
     */
    up() {
        return Promise.resolve();
    }

    /**
     * Executes migration's `down` function.
     *
     * @example
     * // execute migration down
     * migration.down().then(...)
     *
     * @returns {Promise}
     */
    down() {
        return Promise.resolve();
    }

    /**
     * Checks if migration module exists.
     *
     * @example
     * // check if migration exists
     * migration.exists().then(...)
     *
     * // check if file based migration exists
     * (new Migration('./path/to/20160911222845-task.js')).exists().then(...)
     *
     * // module based migration exists always
     * (new Migration({ up() {}, ... })).exists().then(console.log)
     * // -> true
     *
     * // check if resolver based migration exists
     * (new Migration(resolver)).exists().then(...)
     *
     * @returns {Promise<boolean>}
     */
    exists() {
        return Promise.resolve(false);
    }

    /**
     * Checks if migration module matches to another by its name.
     *
     * @example
     * // check if migration name is starting with a string
     * migration.is('20160911222845').then(...)
     *
     * // check if two migrations are equal
     * migration.is(anotherMigration).then(...)
     *
     * @param {string|Migration} another Another migration which to compare.
     * @returns {boolean}
     */
    is(another) {
        return false;
    }

    /**
     * Gets a list of original migration names in this migration module. For
     * normal migration, it always contains exactly its own name. For squashed
     * migration, it usually contains names of multiple migrations but never its
     * own name as squashed migration is only a representation of other
     * migration(s) and not an original migration.
     *
     * @example
     * // get a name of normal migration
     * migration.migrations().then(console.log)
     * // -> ['20160911222845-task']
     *
     * // get a list of migrations in squashed migration
     * squashedMigration.migrations().then(console.log)
     * // -> ['20160911222845-task', '20160911223053-task']
     *
     * @returns {Promise<string[]>}
     */
    migrations() {
        return Promise.resolve([]);
    }
}

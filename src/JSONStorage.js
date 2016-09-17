import Storage from './Storage';

/**
 * A storage that saves executed migrations to JSON file.
 */
export default class JSONStorage extends Storage {
  /**
   * Constructs a new JSONStorage.
   *
   * @example
   * // construct with default parameters
   * new JSONStorage()
   *
   * // construct with custom file name
   * new JSONStorage({ path: 'path/to/file.json' })
   *
   * @param {object} [options]
   * @param {string} [options.path='./umzug.json']
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
   *     `Promise<Array<{name: string, timestamp: string}>>`. Otherwise,
   *     _without timestamps_, it is `Promise<string[]>`.
   */
  executed(options) {
    return Promise.resolve([]);
  }
}

/* eslint no-param-reassign: "off" */

import fs from 'fs';
import _ from 'lodash';

import helper from './Helper';
import Storage from './Storage';

/**
 * Read content from file.
 *
 * @param {string} file
 * @return {Promise<string>}
 * @private
 */
const readFile = helper.promisify(fs.readFile);

/**
 * Write content to file.
 *
 * @param {string} file
 * @param {string} data
 * @returns {Promise}
 * @private
 */
const writeFile = helper.promisify(fs.writeFile);

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
  constructor(options = {}) {
    super();

    this.file = options.path || './umzug.json';
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
    const timestamp = (new Date()).toJSON();
    migrations = _.flattenDeep(migrations || []);
    migrations = migrations.map(name => ({ name, timestamp }));
    if (migrations.length === 0) return Promise.resolve();
    if (_.uniq(migrations).length < migrations.length) {
      return Promise.reject(new Error('Duplicates are not allowed in param ...migrations'));
    }

    return this.executed({ withTimestamps: true })
      .then((all) => {
        if (_.intersectionBy(all, migrations, 'name').length > 0) {
          throw new Error('Some migrations were already executed');
        }
        return all;
      })
      .then(executed => [...executed, ...migrations])
      .then(all => writeFile(this.file, JSON.stringify(all)));
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
    migrations = _.flattenDeep(migrations || []);
    migrations = migrations.map(name => ({ name }));
    if (migrations.length === 0) return Promise.resolve();
    if (_.uniq(migrations).length < migrations.length) {
      return Promise.reject(new Error('Duplicates are not allowed in param ...migrations'));
    }

    return this.executed({ withTimestamps: true })
      .then((all) => {
        if (_.differenceBy(migrations, all, 'name').length > 0) {
          throw new Error('Some migrations were not already executed');
        }
        return all;
      })
      .then(all => _.differenceBy(all, migrations, 'name'))
      .then(rest => writeFile(this.file, JSON.stringify(rest)));
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
  executed(options = {}) {
    return readFile(this.file)
      .catch(() => '[]')
      .then(content => JSON.parse(content))
      .then(result => result.map(entry => (
        options.withTimestamps ? entry : entry.name
      )));
  }
}

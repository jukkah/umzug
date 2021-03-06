'use strict';

var Bluebird  = require('bluebird');

/**
 * @class NoneStorage
 */
module.exports = class NoneStorage {
  /**
   * Constructs none storage.
   *
   * @param {Object} [options]
   * @constructs NoneStorage
   */
  constructor(options) {}

  /**
   * Does nothing.
   *
   * @param {String} migrationName - Name of migration to be logged.
   * @returns {Promise}
   */
  logMigration(migrationName) {
    return Bluebird.resolve();
  }

  /**
   * Does nothing.
   *
   * @param {String} migrationName - Name of migration to unlog.
   * @returns {Promise}
   */
  unlogMigration(migrationName) {
    return Bluebird.resolve();
  }

  /**
   * Does nothing.
   *
   * @returns {Promise.<String[]>}
   */
  executed() {
    return Bluebird.resolve([]);
  }
}

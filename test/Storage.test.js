/* eslint arrow-body-style: 0, import/no-extraneous-dependencies: 0,
          import/imports-first: 0 */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

import Storage from '../src/Storage';

describe('Storage', () => {
  /** @test {Storage} */
  describe('constructor', () => {
    /** @test {Storage#constructor} */
    it('should not require any parameters', async () => {
      let storage;

      expect(() => {
        storage = new Storage();
      }).to.not.throw();

      expect(storage).to.be.an.instanceof(Storage);
    });
  });

  /** @test {Storage} */
  describe('executed', () => {
    let storage;

    beforeEach(() => {
      storage = new Storage();
    });

    /** @test {Storage#executed} */
    it('should not require any parameters', async () => {
      const result = storage.executed();

      await expect(result).to.eventually.be.fulfilled;
    });

    /** @test {Storage#executed} */
    it('should return an empty array', async () => {
      const result = storage.executed();

      await expect(result).to.eventually.be.an('array');
      await expect(result).to.eventually.be.empty;
    });

    /** @test {Storage#executed} */
    it('should accept withTimestamps = true as an option', async () => {
      const result = storage.executed({ withTimestamps: true });

      await expect(result).to.eventually.be.fulfilled;
    });
  });

  /** @test {Storage} */
  describe('log', () => {
    let storage;

    beforeEach(() => {
      storage = new Storage();
    });

    /** @test {Storage#log} */
    it('should not require any parameters', async () => {
      const result = storage.log();

      await expect(result).to.eventually.be.fulfilled;
    });

    /** @test {Storage#log} */
    it('should return undefined', async () => {
      const result = storage.log();

      await expect(result).to.eventually.be.undefined;
    });

    /** @test {Storage#log} */
    it('should accept multiple strings as parameter', async () => {
      const results = [
        storage.log('1-migration'),
        storage.log('2-migration', '3-migration'),
      ];

      await Promise.all(results.map(
        result => expect(result).to.be.eventually.fulfilled
      ));
    });

    /** @test {Storage#log} */
    it('should accept an string array as parameter', async () => {
      const results = [
        storage.log([]),
        storage.log('1-migration'),
        storage.log('2-migration', '3-migration'),
      ];

      await Promise.all(results.map(
        result => expect(result).to.be.eventually.fulfilled
      ));
    });

    /** @test {Storage#log} */
    it('should not remember what has been logged', async () => {
      await storage.log('1-migration');
      const result = storage.executed();

      await expect(result).to.eventually.be.fulfilled;
      await expect(result).to.eventually.be.an('array');
      await expect(result).to.eventually.be.empty;
    });
  });

  /** @test {Storage} */
  describe('unlog', () => {
    let storage;

    beforeEach(() => {
      storage = new Storage();
    });

    /** @test {Storage#unlog} */
    it('should not require any parameters', async () => {
      const result = storage.unlog();

      await expect(result).to.eventually.be.fulfilled;
    });

    /** @test {Storage#unlog} */
    it('should return undefined', async () => {
      const result = storage.unlog();

      await expect(result).to.eventually.be.undefined;
    });

    /** @test {Storage#unlog} */
    it('should accept multiple strings as parameter', async () => {
      const results = [
        storage.unlog('1-migration'),
        storage.unlog('2-migration', '3-migration'),
      ];

      await Promise.all(results.map(
        result => expect(result).to.be.eventually.fulfilled
      ));
    });

    /** @test {Storage#unlog} */
    it('should accept an string array as parameter', async () => {
      const results = [
        storage.unlog([]),
        storage.unlog('1-migration'),
        storage.unlog('2-migration', '3-migration'),
      ];

      await Promise.all(results.map(
        result => expect(result).to.be.eventually.fulfilled
      ));
    });

    /** @test {Storage#unlog} */
    it('should not remember what has been unlogged', async () => {
      await storage.unlog('1-migration');
      const result = storage.executed();

      await expect(result).to.eventually.be.fulfilled;
      await expect(result).to.eventually.be.an('array');
      await expect(result).to.eventually.be.empty;
    });
  });
});

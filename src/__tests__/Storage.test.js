/* eslint arrow-body-style: "off" */

import Storage from '../Storage';

/** @test {Storage} */
describe('Storage', () => {
  describe('constructor', () => {
    /** @test {Storage#constructor} */
    it('should not require any parameters', () => {
      let storage;

      expect(() => {
        storage = new Storage();
      }).not.toThrow();

      expect(storage).toEqual(jasmine.any(Storage));
    });
  });

  describe('executed', () => {
    let storage;

    beforeEach(() => {
      storage = new Storage();
    });

    /** @test {Storage#executed} */
    it('should not require any parameters', () => {
      return new Promise((resolve) => {
        expect(() => {
          resolve(
            storage.executed()
          );
        }).not.toThrow();
      });
    });

    /** @test {Storage#executed} */
    it('should return Promise that resolves to an empty array', () => {
      const result = storage.executed();

      expect(result).toEqual(jasmine.any(Promise));

      return result
        .then((value) => {
          expect(value).toEqual([]);
        });
    });

    /** @test {Storage#executed} */
    it('should accept withTimestamps = true as an option', () => {
      return new Promise((resolve) => {
        expect(() => {
          resolve(
              storage.executed({ withTimestamps: true })
          );
        }).not.toThrow();
      });
    });
  });

  describe('log', () => {
    let storage;

    beforeEach(() => {
      storage = new Storage();
    });

    /** @test {Storage#log} */
    it('should not require any parameters', () => {
      return new Promise((resolve) => {
        expect(() => {
          resolve(
            storage.log()
          );
        }).not.toThrow();
      });
    });

    /** @test {Storage#log} */
    it('should return Promise that resolves to undefined', () => {
      const result = storage.log();

      expect(result).toEqual(jasmine.any(Promise));

      return result
        .then((value) => {
          expect(value).toBeUndefined();
        });
    });

    /** @test {Storage#log} */
    it('should accept multiple strings as parameter', () => {
      return new Promise((resolve) => {
        expect(() => {
          Promise.resolve()
            .then(() => storage.log('1-migration'))
            .then(() => storage.log('2-migration', '3-migration'))
            .then(resolve);
        }).not.toThrow();
      });
    });

    /** @test {Storage#log} */
    it('should accept an string array as parameter', () => {
      return new Promise((resolve) => {
        expect(() => {
          Promise.resolve()
            .then(() => storage.log([]))
            .then(() => storage.log('1-migration'))
            .then(() => storage.log('2-migration', '3-migration'))
            .then(resolve);
        }).not.toThrow();
      });
    });

    /**
     * @test {Storage#log}
     */
    it('should not remember what has been logged', () => {
      return storage.log('1-migration')
        .then(() => storage.executed())
        .catch((error) => {
          expect(error).not.toEqual(jasmine.any(Error));
        })
        .then((value) => {
          expect(value).toEqual([]);
        });
    });
  });

  describe('unlog', () => {
    let storage;

    beforeEach(() => {
      storage = new Storage();
    });

    /** @test {Storage#unlog} */
    it('should not require any parameters', () => {
      return new Promise((resolve) => {
        expect(() => {
          resolve(
            storage.unlog()
          );
        }).not.toThrow();
      });
    });

    /** @test {Storage#unlog} */
    it('should return Promise that resolves to undefined', () => {
      const result = storage.unlog();

      expect(result).toEqual(jasmine.any(Promise));

      return result
        .then((value) => {
          expect(value).toBeUndefined();
        });
    });

    /** @test {Storage#unlog} */
    it('should accept multiple strings as parameter', () => {
      return new Promise((resolve) => {
        expect(() => {
          Promise.resolve()
            .then(() => storage.unlog('1-migration'))
            .then(() => storage.unlog('2-migration', '3-migration'))
            .then(resolve);
        }).not.toThrow();
      });
    });

    /** @test {Storage#unlog} */
    it('should accept an string array as parameter', () => {
      return new Promise((resolve) => {
        expect(() => {
          Promise.resolve()
            .then(() => storage.unlog([]))
            .then(() => storage.unlog('1-migration'))
            .then(() => storage.unlog('2-migration', '3-migration'))
            .then(resolve);
        }).not.toThrow();
      });
    });

    /**
     * @test {Storage#unlog}
     */
    it('should not remember what has been unlogged', () => {
      return storage.unlog('1-migration')
        .then(() => storage.executed())
        .catch((error) => {
          expect(error).not.toEqual(jasmine.any(Error));
        })
        .then((value) => {
          expect(value).toEqual([]);
        });
    });
  });
});

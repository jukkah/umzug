/* eslint import/imports-first: "off", arrow-body-style: "off" */

jest.mock('fs');

import fs from 'fs';

import JSONStorage from '../JSONStorage';

const CUSTOM_PATH = './file.json';

const FS_EMPTY = {};

const FS_2_MIGRATIONS = {
  [CUSTOM_PATH]: JSON.stringify([
    { name: '1-mock', timestamp: '1-timestamp' },
    { name: '2-mock', timestamp: '2-timestamp' },
  ]),
};

const FS_3_MIGRATIONS = {
  [CUSTOM_PATH]: JSON.stringify([
    { name: '1-mock', timestamp: '1-timestamp' },
    { name: '2-mock', timestamp: '2-timestamp' },
    { name: '3-mock', timestamp: '3-timestamp' },
  ]),
};

const ANY_ISO_DATE = jasmine.stringMatching(
  /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/
);

/** @test {JSONStorage} */
describe('constructor', () => {
  beforeEach(() => {
    fs.resetMock();
    fs.setMockFiles(FS_EMPTY);
  });

  /** @test {JSONStorage#constructor} */
  it('should not require any parameters', () => {
    let storage;

    expect(() => {
      storage = new JSONStorage();
    }).not.toThrow();

    expect(storage).toEqual(jasmine.any(JSONStorage));

    // expect nothing done with fs
    expect(fs.readFile).not.toBeCalled();
    expect(fs.writeFile).not.toBeCalled();
    expect(fs.getMockFiles()).toEqual(FS_EMPTY);
  });

  /** @test {JSONStorage#constructor} */
  it('should accept path as an option even if file doesn\'t exists', () => {
    let storage;

    expect(() => {
      storage = new JSONStorage({ path: CUSTOM_PATH });
    }).not.toThrow();

    expect(storage).toEqual(jasmine.any(JSONStorage));

    // expect nothing done with fs
    expect(fs.readFile).not.toBeCalled();
    expect(fs.writeFile).not.toBeCalled();
    expect(fs.getMockFiles()).toEqual(FS_EMPTY);
  });
});

/** @test {JSONStorage} */
describe('executed', () => {
  let storage;

  beforeEach(() => {
    fs.resetMock();
    fs.setMockFiles(FS_EMPTY);
    storage = new JSONStorage({ path: CUSTOM_PATH });
  });

  /** @test {JSONStorage#executed} */
  it('should not require any parameters', () => {
    return new Promise((resolve) => {
      expect(() => {
        resolve(
            storage.executed()
        );
      }).not.toThrow();
    }).then(() => {
      // expect there is only one read from CUSTOM_PATH
      expect(fs.readFile.mock.calls.length).toBe(1);
      expect(fs.readFile.mock.calls[0].length).toBeGreaterThan(0);
      expect(fs.readFile.mock.calls[0][0]).toBe(CUSTOM_PATH);
      expect(fs.writeFile).not.toBeCalled();
      expect(fs.getMockFiles()).toEqual(FS_EMPTY);
    });
  });

  /** @test {JSONStorage#executed} */
  it('should return Promise that resolves to an array', () => {
    const result = storage.executed();

    expect(result).toEqual(jasmine.any(Promise));

    return result
      .then((value) => {
        expect(value).toEqual(jasmine.any(Array));

        // expect there is only one read from CUSTOM_PATH
        expect(fs.readFile.mock.calls.length).toBe(1);
        expect(fs.readFile.mock.calls[0].length).toBeGreaterThan(0);
        expect(fs.readFile.mock.calls[0][0]).toBe(CUSTOM_PATH);
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_EMPTY);
      });
  });

  /** @test {JSONStorage#executed} */
  it('should resolve to an empty array if file doesn\'t exist', () => {
    return storage.executed()
      .then((value) => {
        expect(value).toEqual([]);

        // expect there is only one read from CUSTOM_PATH
        expect(fs.readFile.mock.calls.length).toBe(1);
        expect(fs.readFile.mock.calls[0].length).toBeGreaterThan(0);
        expect(fs.readFile.mock.calls[0][0]).toBe(CUSTOM_PATH);
      });
  });

  /** @test {JSONStorage#executed} */
  it('should not create file if it doesn\'t exist', () => {
    return storage.executed()
      .then((value) => {
        expect(value).toEqual([]);

        // expect fs not edited
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_EMPTY);
      });
  });

  /** @test {JSONStorage#executed} */
  it('should resolve to string array if called without parameters', () => {
    fs.setMockFiles(FS_2_MIGRATIONS);

    const expectedResult = ['1-mock', '2-mock'];

    return storage.executed()
      .then((value) => {
        expect(value).toEqual(expectedResult);

        // expect fs not edited
        expect(fs.readFile).toBeCalled();
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_2_MIGRATIONS);
      });
  });

  /** @test {JSONStorage#executed} */
  it('should resolve to (name, timestamp) array if called with withTimestamps = true as an option', () => {
    fs.setMockFiles(FS_2_MIGRATIONS);

    const expectedResult = JSON.parse(FS_2_MIGRATIONS[CUSTOM_PATH]);

    return storage.executed({ withTimestamps: true })
      .then((value) => {
        expect(value).toEqual(expectedResult);

        // expect fs not edited
        expect(fs.readFile).toBeCalled();
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_2_MIGRATIONS);
      });
  });

  /** @test {JSONStorage#executed} */
  it('should resolve to array of items in json file', () => {
    fs.setMockFiles(FS_2_MIGRATIONS);

    const expectedResult = JSON.parse(FS_2_MIGRATIONS[CUSTOM_PATH]);

    return storage.executed({ withTimestamps: true })
      .then((value) => {
        expect(value).toEqual(expectedResult);

        // expect there is only one read from CUSTOM_PATH
        expect(fs.readFile.mock.calls.length).toBe(1);
        expect(fs.readFile.mock.calls[0].length).toBeGreaterThan(0);
        expect(fs.readFile.mock.calls[0][0]).toBe(CUSTOM_PATH);
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_2_MIGRATIONS);
      });
  });
});

/** @test {JSONStorage} */
describe('log', () => {
  let storage;

  beforeEach(() => {
    fs.resetMock();
    fs.setMockFiles(FS_EMPTY);
    storage = new JSONStorage({ path: CUSTOM_PATH });
  });

  /** @test {JSONStorage#log} */
  it('should not require any parameters', () => {
    return new Promise((resolve) => {
      expect(() => {
        resolve(
          storage.log()
        );
      }).not.toThrow();
    }).then(() => {
      // expect fs untouched
      expect(fs.readFile).not.toBeCalled();
      expect(fs.writeFile).not.toBeCalled();
      expect(fs.getMockFiles()).toEqual(FS_EMPTY);
    });
  });

  /** @test {JSONStorage#log} */
  it('should return Promise that resolves to undefined', () => {
    const result = storage.log();

    expect(result).toEqual(jasmine.any(Promise));

    return result
      .then((value) => {
        expect(value).toBeUndefined();

        // expect fs untouched
        expect(fs.readFile).not.toBeCalled();
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_EMPTY);
      });
  });

  /** @test {JSONStorage#log} */
  it('should accept multiple strings as parameter', () => {
    return Promise.resolve()
      .then(() => storage.log('1-migration'))
      .then(() => storage.log('2-migration', '3-migration'))
      .catch(error => expect(error).toBeUndefined());
  });

  /** @test {JSONStorage#log} */
  it('should accept an string array as parameter', () => {
    return Promise.resolve()
      .then(() => storage.log([]))
      .then(() => storage.log(['1-migration']))
      .then(() => storage.log(['2-migration', '3-migration']))
      .catch(error => expect(error).toBeUndefined());
  });

  /** @test {JSONStorage#log} */
  it('should create the json file if it doesn\'t exist', () => {
    return storage.log('1-migration')
      .then(() => {
        // expect file is created
        expect(fs.readFile).toBeCalled();
        expect(fs.writeFile).toBeCalled();
        expect(fs.getMockFiles()).toEqual({ [CUSTOM_PATH]: jasmine.any(String) });
        expect(JSON.parse(fs.getMockFiles()[CUSTOM_PATH])).toEqual([
          { name: '1-migration', timestamp: ANY_ISO_DATE },
        ]);
      });
  });

  /** @test {JSONStorage#log} */
  it('should fail without affecting the json file if trying to log items that are already executed', () => {
    fs.setMockFiles(FS_2_MIGRATIONS);

    return storage.log(['1-mock', '1-migration'])
      .then(() => expect(undefined).toBeDefined())
      .catch(error => expect(error).toBeDefined())
      .then(() => {
        // expect fs not edited
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_2_MIGRATIONS);
      });
  });

  /** @test {JSONStorage#log} */
  it('should not affect to existing items is the json file', () => {
    fs.setMockFiles(FS_2_MIGRATIONS);

    return storage.log(['1-migration', '2-migration'])
      .catch(error => expect(error).toBeUndefined())
      .then(() => {
        // expect old items still exists
        expect(fs.writeFile).toBeCalled();
        expect(fs.getMockFiles()).toEqual({ [CUSTOM_PATH]: jasmine.any(String) });
        expect(JSON.parse(fs.getMockFiles()[CUSTOM_PATH])).toEqual([
          { name: '1-mock', timestamp: '1-timestamp' },
          { name: '2-mock', timestamp: '2-timestamp' },
          { name: '1-migration', timestamp: ANY_ISO_DATE },
          { name: '2-migration', timestamp: ANY_ISO_DATE },
        ]);
      });
  });
});

/** @test {JSONStorage} */
describe('unlog', () => {
  let storage;

  beforeEach(() => {
    fs.resetMock();
    fs.setMockFiles(FS_3_MIGRATIONS);
    storage = new JSONStorage({ path: CUSTOM_PATH });
  });

  /** @test {JSONStorage#unlog} */
  it('it should not require any parameters', () => {
    return new Promise((resolve) => {
      expect(() => {
        resolve(
          storage.unlog()
        );
      }).not.toThrow();
    }).then(() => {
      // expect fs untouched
      expect(fs.readFile).not.toBeCalled();
      expect(fs.writeFile).not.toBeCalled();
      expect(fs.getMockFiles()).toEqual(FS_3_MIGRATIONS);
    });
  });

  /** @test {JSONStorage#unlog} */
  it('it should return Promise that resolves to undefined', () => {
    const result = storage.unlog();

    expect(result).toEqual(jasmine.any(Promise));

    return result
      .then((value) => {
        expect(value).toBeUndefined();

        // expect fs untouched
        expect(fs.readFile).not.toBeCalled();
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_3_MIGRATIONS);
      });
  });

  /** @test {JSONStorage#unlog} */
  it('it should accept multiple strings as parameter', () => {
    return Promise.resolve()
      .then(() => storage.unlog('1-mock'))
      .then(() => storage.unlog('2-mock', '3-mock'))
      .catch(error => expect(error).toBeUndefined());
  });

  /** @test {JSONStorage#unlog} */
  it('it should accept an string array as parameter', () => {
    return Promise.resolve()
      .then(() => storage.unlog([]))
      .then(() => storage.unlog('1-mock'))
      .then(() => storage.unlog('2-mock', '3-mock'))
      .catch(error => expect(error).toBeUndefined());
  });

  /** @test {JSONStorage#unlog} */
  it('it should not create the json file if it doesn\'t exist', () => {
    fs.setMockFiles(FS_EMPTY);

    return storage.unlog('1-migration')
      .then(() => expect(undefined).toBeDefined())
      .catch(error => expect(error).toBeDefined())
      .then(() => {
        // expect fs not edited
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_EMPTY);
      });
  });

  /** @test {JSONStorage#unlog} */
  it('it should fail without affecting the json file if trying to unlog items that are not executed yet', () => {
    return storage.unlog(['1-mock', '1-migration'])
      .then(() => expect(undefined).toBeDefined())
      .catch(error => expect(error).toBeDefined())
      .then(() => {
        // expect fs not edited
        expect(fs.writeFile).not.toBeCalled();
        expect(fs.getMockFiles()).toEqual(FS_3_MIGRATIONS);
      });
  });

  /** @test {JSONStorage#unlog} */
  it('it should not add any items to the json file', () => {
    fs.setMockFiles(FS_3_MIGRATIONS);

    return storage.unlog(['1-mock', '2-mock'])
      .catch(error => expect(error).toBeUndefined())
      .then(() => {
        // expect new items is not added
        expect(fs.writeFile).toBeCalled();
        expect(fs.getMockFiles()).toEqual({ [CUSTOM_PATH]: jasmine.any(String) });
        expect(JSON.parse(fs.getMockFiles()[CUSTOM_PATH])).toEqual([
          { name: '3-mock', timestamp: '3-timestamp' },
        ]);
      });
  });
});

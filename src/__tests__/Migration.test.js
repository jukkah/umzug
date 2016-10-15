/* eslint arrow-body-style: "off" */

import Migration from '../Migration';

/** @test {Migration} */
describe('constructor', () => {
  /** @test {Migration#constructor} */
  it('should require a valid module', () => {
    let migration;

    expect(() => {
      migration = new Migration();
    }).toThrow();
    expect(migration).toBeUndefined();

    // Filename is valid
    expect(() => {
      migration = new Migration('./1-mock.js');
    }).not.toThrow();
    expect(migration).toBeDefined();

    // Module object is valid
    expect(() => {
      migration = new Migration({});
    }).not.toThrow();
    expect(migration).toBeDefined();

    // Resolver function is valid
    expect(() => {
      migration = new Migration(() => {});
    }).not.toThrow();
    expect(migration).toBeDefined();
  });

  /** @test {Migration#constructor} */
  it('should use default options if not specified', () => {
    const migration = new Migration('./1-mock.js');

    expect(migration.options).toEqual({
      up: 'up',
      down: 'down',
      wrapper: jasmine.any(Function),
    });
  });

  /** @test {Migration#constructor} */
  it('should allow custom up option', () => {
    const up = () => {};

    return Promise.resolve()
      .then(() => new Migration('./1-mock.js', { up }))
      .catch(error => expect(error).toBeUndefined())
      .then((migration) => {
        expect(migration).toEqual(jasmine.any(Migration));
        expect(migration.options).toEqual(jasmine.objectContaining({ up }));
      });
  });

  /** @test {Migration#constructor} */
  it('should allow custom down option', () => {
    const down = () => {};

    return Promise.resolve()
      .then(() => new Migration('./1-mock.js', { down }))
      .catch(error => expect(error).toBeUndefined())
      .then((migration) => {
        expect(migration).toEqual(jasmine.any(Migration));
        expect(migration.options).toEqual(jasmine.objectContaining({ down }));
      });
  });

  /** @test {Migration#constructor} */
  it('should allow custom wrapper option', () => {
    const wrapper = () => {};

    return Promise.resolve()
      .then(() => new Migration('./1-mock.js', { wrapper }))
      .catch(error => expect(error).toBeUndefined())
      .then((migration) => {
        expect(migration).toEqual(jasmine.any(Migration));
        expect(migration.options).toEqual(jasmine.objectContaining({ wrapper }));
      });
  });

  /** @test {Migration#constructor} */
  it('should not try to resolve module', () => {
    const wrapper = jest.fn();

    return Promise.resolve()
      .then(() => new Migration('./1-mock.js', { wrapper }))
      .catch(error => expect(error).toBeUndefined())
      .then((migration) => {
        expect(migration).toEqual(jasmine.any(Migration));
        expect(wrapper).not.toBeCalled();
      });
  });
});

/** @test {Migration} */
describe('exists', () => {
  let migration;

  beforeEach(() => {
    migration = new Migration({
      up() {},
      down() {},
      migrations: ['1-migration', '2-migration'],
    });
  });

  /** @test {Migration#exists} */
  it('should not require any parameters', () => {
    return Promise.resolve()
      .then(() => migration.exists())
      .catch(error => expect(error).toBeUndefined());
  });

  /** @test {Migration#exists} */
  it('should return a Promise that resolves to boolean', () => {
    const result = migration.exists();

    expect(result).toEqual(jasmine.any(Promise));

    return result
      .then((value) => {
        expect(value).toEqual(jasmine.any(Boolean));
      });
  });

  /** @test {Migration#exists} */
  it('should resolve to true if migration file exists', () => {
    migration = new Migration('./__tests__/Migration.test.js');

    return Promise.resolve()
      .then(() => migration.exists())
      .catch(error => expect(error).toBeUndefined())
      .then(result => expect(result).toBe(true));
  });

  /** @test {Migration#exists} */
  it('should resolve to false if migration file doesn\'t exist', () => {
    migration = new Migration('./nonexisting-file.js');

    return Promise.resolve()
      .then(() => migration.exists())
      .catch(error => expect(error).toBeUndefined())
      .then(result => expect(result).toBe(false));
  });

  /** @test {Migration#exists} */
  it('should resolve to true if module is an object', () => {
    return Promise.resolve()
      .then(() => migration.exists())
      .catch(error => expect(error).toBeUndefined())
      .then(result => expect(result).toBe(true));
  });

  /** @test {Migration#exists} */
  it('should resolve to true if module resolver returns an object', () => {
    const FN = jest.fn(() => ({
      up() {},
      down() {},
      migrations: ['1-migration', '2-migration'],
    }));
    migration = new Migration(FN);

    return Promise.resolve()
      .then(() => migration.exists())
      .catch(error => expect(error).toBeUndefined())
      .then((result) => {
        expect(result).toBe(true);
        expect(FN).toBeCalled();
      });
  });

  /** @test {Migration#exists} */
  it('should resolve to false if module resolver doesn\'t return an object', () => {
    const FN = jest.fn(() => undefined);
    migration = new Migration(FN);

    return Promise.resolve()
      .then(() => migration.exists())
      .catch(error => expect(error).toBeUndefined())
      .then((result) => {
        expect(result).toBe(false);
        expect(FN).toBeCalled();
      });
  });

  /** @test {Migration#exists} */
  it('should resolve to false if module resolver fails', () => {
    const FN = jest.fn(() => { throw new Error(); });
    migration = new Migration(FN);

    return Promise.resolve()
      .then(() => migration.exists())
      .catch(error => expect(error).toBeUndefined())
      .then((result) => {
        expect(result).toBe(false);
        expect(FN).toBeCalled();
      });
  });
});

/** @test {Migration} */
describe('migrations', () => {
  let migration;

  beforeEach(() => {
    migration = new Migration({
      up() {},
      down() {},
      migrations: ['1-migration', '2-migration'],
    });
  });

  /** @test {Migration#migrations} */
  it('should not require any parameters', () => {
    return Promise.resolve()
      .then(migration.migrations())
      .catch(error => expect(error).toBeUndefined());
  });

  /** @test {Migration#migrations} */
  it('should return Promise that resolves to string list', () => {
    const result = migration.migrations();

    expect(result).toEqual(jasmine.any(Promise));

    return result
      .then((value) => {
        expect(value).toEqual(jasmine.any(Array));
        value.forEach(item => expect(item).toEqual(jasmine.any(String)));
      });
  });

  /** @test {Migration#migrations} */
  it('should resolve to string list specified in migrations', () => {
    return migration.migrations()
      .catch(error => expect(error).toBeUndefined())
      .then((value) => {
        expect(value).toEqual(['1-migration', '2-migration']);
      });
  });

  /** @test {Migration#migrations} */
  it('should resolve to result of resolver function', () => {
    const MIGRATIONS = [];
    const FN = jest.fn(() => MIGRATIONS);
    migration = new Migration({
      migrations: FN,
    });

    return migration.migrations()
      .catch(error => expect(error).toBeUndefined())
      .then((value) => {
        expect(FN).toBeCalled();
        expect(value).toBe(MIGRATIONS);
      });
  });

  /** @test {Migration#migrations} */
  it('should resolve to filename if migrations is not specified', () => {
    migration = new Migration('./__tests__/Migration.test.js');

    return migration.migrations()
      .catch(error => expect(error).toBeUndefined())
      .then((value) => {
        expect(value).toEqual(['Migration.test.js']);
      });
  });

  /** @test {Migration#migrations} */
  it('should fail if module file can\'t be found', () => {
    migration = new Migration('./nonexisting-file.js');

    return migration.migrations()
      .then(() => expect(undefined).toBeDefined())
      .catch(error => expect(error).toBeDefined());
  });

  /** @test {Migration#migrations} */
  it('should fail if module can\'t be resolved', () => {
    migration = new Migration(() => undefined);

    return migration.migrations()
      .then(() => expect(undefined).toBeDefined())
      .catch(error => expect(error).toBeDefined());
  });

  /** @test {Migration#migrations} */
  it('should fail if migrations can\'t be resolved', () => {
    migration = new Migration({
      migrations: jest.fn(() => { throw new Error(); }),
    });

    return migration.migrations()
      .then(() => expect(undefined).toBeDefined())
      .catch(error => expect(error).toBeDefined());
  });
});

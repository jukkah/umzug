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

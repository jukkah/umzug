/**
 * Make function with callback as its last parameter to return promise.
 *
 * @param {function(..., function(resolve, reject)) } fn callback function
 * @returns {function() : Promise}
 */
export function promisify(fn) {
  return (...params) => new Promise((resolve, reject) => {
    fn(...params, (error, data) => {
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
}

/**
 * If given parameter is a function, resolve it. Otherwise return it as is.
 *
 * @param {Function|*} fn function to resolve or anything else.
 * @returns {*}
 */
export function call(fn) {
  return typeof fn === 'function' ? fn() : fn;
}

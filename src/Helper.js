export default {
  /**
   * Make function with callback as its last parameter to return promise.
   *
   * @param {function(..., function(resolve, reject)) } fn callback function
   * @returns {function() : Promise}
   */
  promisify(fn) {
    return (...params) => new Promise((resolve, reject) => {
      fn(...params, (error, data) => {
        if (error) {
          reject(error);
        }

        resolve(data);
      });
    });
  },
};

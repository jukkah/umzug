const fs = jest.genMockFromModule('fs');

/**
 * Internal memory.
 *
 * @type {object}
 */
let mockFiles = {};

/**
 * Override memory with new files.
 *
 * @param {object} newMockFiles new files
 */
fs.setMockFiles = (newMockFiles) => {
  mockFiles = newMockFiles || {};
};

/**
 * Get whole internal memory.
 *
 * @returns {object}
 */
fs.getMockFiles = () => mockFiles;

/**
 * Mocked version of fs.writeFile.
 *
 * @see {fs.writeFile} https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_writefile_file_data_options_callback
 */
fs.writeFile = jest.fn((file, data, callback) => {
  mockFiles[file] = data;
  callback(null);
});

/**
 * Mocked version of fs.readFile.
 *
 * @see {fs.readFile} https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_readfile_file_options_callback
 */
fs.readFile = jest.fn((file, callback) => {
  if (mockFiles[file]) {
    callback(null, mockFiles[file]);
  } else {
    callback(new Error(`Mocked file for '${file}' not found`));
  }
});

export default fs;

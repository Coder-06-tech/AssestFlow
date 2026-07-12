const bcrypt = require('bcryptjs');

/**
 * Hashes a plain text password using bcryptjs.
 * @param {string} password 
 * @returns {Promise<string>}
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compares a plain text password with a hash.
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
exports.comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

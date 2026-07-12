const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforassetflowprojectdevelopment';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET + '_refresh');

/**
 * Generates an Access Token (15m validity).
 * @param {object} user 
 * @returns {string}
 */
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generates a Refresh Token (7d validity).
 * @param {object} user 
 * @returns {string}
 */
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verifies an Access Token.
 * @param {string} token 
 * @returns {object} payload
 */
exports.verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verifies a Refresh Token.
 * @param {string} token 
 * @returns {object} payload
 */
exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

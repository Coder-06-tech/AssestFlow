/**
 * Formats a successful API response.
 * @param {any} data 
 * @param {string} message 
 * @returns {object}
 */
exports.successResponse = (data = null, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Formats an error API response.
 * @param {string} error 
 * @param {number} statusCode 
 * @returns {object}
 */
exports.errorResponse = (error = 'An error occurred', statusCode = 500) => {
  return {
    success: false,
    error
  };
};

// Common helper functions
exports.formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data
  };
};

/**
 * Centralized error handling middleware.
 */
module.exports = (err, req, res, next) => {
  console.error('Error occurred:', err.stack || err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware to authenticate requests using JWT access tokens.
 */
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed. Token missing or invalid format.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = decoded; // Attach user to request (id, email, role)
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Token is invalid or has expired.'
    });
  }
};

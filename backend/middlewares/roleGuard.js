/**
 * Middleware to restrict route access based on User Role.
 * @param {...string} allowedRoles 
 */
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Authenticated user required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    next();
  };
};

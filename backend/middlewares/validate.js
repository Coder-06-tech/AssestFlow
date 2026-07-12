/**
 * Express middleware to validate request bodies against Zod schemas.
 * @param {import('zod').ZodSchema} schema 
 */
module.exports = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors || result.error.issues || [];
      const errorMsg = errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      return res.status(400).json({
        success: false,
        error: errorMsg
      });
    }

    // Assign parsed data back (stripping undefined or unrecognized fields)
    req.body = result.data;
    next();
  };
};

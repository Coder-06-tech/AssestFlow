/**
 * Express middleware to validate request bodies against Zod schemas.
 * @param {import('zod').ZodSchema} schema 
 */
module.exports = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMsg = result.error.errors
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

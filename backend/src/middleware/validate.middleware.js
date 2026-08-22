function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      result.error.name = 'ZodError';
      return next(result.error);
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;

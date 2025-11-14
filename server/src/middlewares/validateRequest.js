const validateRequest = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });

  if (error) {
    return next({
      statusCode: 400,
      message: 'Validation error',
      errors: error.details.map((detail) => detail.message)
    });
  }

  req[property] = value;
  return next();
};

export default validateRequest;


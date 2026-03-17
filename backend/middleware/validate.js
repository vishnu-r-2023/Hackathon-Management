const AppError = require("../utils/AppError");

function validate(schema) {
  return (req, res, next) => {
    try {
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          return next(new AppError(error.details.map((d) => d.message).join(", "), 400));
        }
        req.body = value;
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          return next(new AppError(error.details.map((d) => d.message).join(", "), 400));
        }
        req.params = value;
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          return next(new AppError(error.details.map((d) => d.message).join(", "), 400));
        }
        req.query = value;
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = validate;


const AppError = require("../utils/AppError");

function authorizeRoles(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return next(new AppError("Unauthorized", 401));
    if (!roles.includes(role)) return next(new AppError("Forbidden", 403));
    return next();
  };
}

module.exports = authorizeRoles;


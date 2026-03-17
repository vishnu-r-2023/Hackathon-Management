const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return next(new AppError("Missing Authorization Bearer token", 401));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError("JWT_SECRET is not set", 500));
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}

module.exports = authMiddleware;


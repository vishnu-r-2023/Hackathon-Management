const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

function getTokenFromAuthorizationHeader(req) {
  const header = req.get("authorization") || req.get("Authorization");
  if (!header) return null;
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

function getTokenFromCookieHeader(req) {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const tokenCookie = cookies.find((c) => c.startsWith("token="));
  if (!tokenCookie) return null;

  const raw = tokenCookie.slice("token=".length);
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function authMiddleware(req, res, next) {
  let token = getTokenFromAuthorizationHeader(req) || getTokenFromCookieHeader(req);

  if (token?.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return next(new AppError("Missing authentication token", 401));
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


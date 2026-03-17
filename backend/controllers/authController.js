const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");

const ROLES = ["admin", "participant", "judge"];

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const role = req.body.role || "participant";
  const bootstrapSecret = req.body.bootstrapSecret;
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!ROLES.includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  if (role !== "participant") {
    const expected = process.env.ROLE_BOOTSTRAP_SECRET;
    if (!expected || bootstrapSecret !== expected) {
      throw new AppError("Not allowed to register this role", 403);
    }
  }

  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({ name, email: normalizedEmail, password, role });
  const token = signToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const token = signToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

module.exports = { register, login };


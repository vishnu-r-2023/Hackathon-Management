const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");

const ROLES = ["admin", "participant", "judge"];

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const role = req.body.role || "participant";
  const bootstrapSecret = req.body.bootstrapSecret;

  if (!ROLES.includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  if (role !== "participant") {
    const expected = process.env.ROLE_BOOTSTRAP_SECRET;
    if (!expected || bootstrapSecret !== expected) {
      throw new AppError("Not allowed to register this role", 403);
    }
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({ name, email, password, role });
  const token = signToken(user);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const token = signToken(user);

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = { register, login };


const User = require("../models/User");
const Team = require("../models/Team");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { recalculateHackathonCounts } = require("../utils/hackathonCounts");

const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({ page, limit, total, users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new AppError("User not found", 404);

  const affectedTeams = await Team.find({ members: userId }).select(
    "_id hackathonId"
  );
  const affectedHackathonIds = [
    ...new Set(affectedTeams.map((t) => t.hackathonId.toString())),
  ];

  await Team.updateMany({ members: userId }, { $pull: { members: userId } });
  await Team.deleteMany({
    hackathonId: { $in: affectedHackathonIds },
    members: { $size: 0 },
  });

  await Promise.all(
    affectedHackathonIds.map((hackathonId) =>
      recalculateHackathonCounts(hackathonId)
    )
  );

  res.json({ message: "User deleted" });
});

module.exports = { getUsers, deleteUser };


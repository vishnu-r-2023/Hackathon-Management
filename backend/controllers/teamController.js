const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const computeHackathonStatus = require("../utils/computeHackathonStatus");
const { recalculateHackathonCounts } = require("../utils/hackathonCounts");

const createTeam = asyncHandler(async (req, res) => {
  const { name, hackathonId } = req.body;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const status = computeHackathonStatus(hackathon.startDate, hackathon.endDate);
  if (status === "completed") throw new AppError("Hackathon is completed", 400);

  const alreadyInTeam = await Team.findOne({
    hackathonId,
    members: req.user.id,
  }).lean();
  if (alreadyInTeam) {
    throw new AppError("User already in a team for this hackathon", 400);
  }

  const team = await Team.create({
    name,
    hackathonId,
    members: [req.user.id],
    createdBy: req.user.id,
  });

  await recalculateHackathonCounts(hackathonId);

  res.status(201).json(team);
});

const joinTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) throw new AppError("Team not found", 404);

  const hackathon = await Hackathon.findById(team.hackathonId);
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const status = computeHackathonStatus(hackathon.startDate, hackathon.endDate);
  if (status === "completed") throw new AppError("Hackathon is completed", 400);

  if (team.members.some((m) => m.toString() === req.user.id)) {
    return res.json(team);
  }

  const alreadyInTeam = await Team.findOne({
    hackathonId: team.hackathonId,
    members: req.user.id,
  }).lean();
  if (alreadyInTeam) {
    throw new AppError("User already in a team for this hackathon", 400);
  }

  team.members.push(req.user.id);
  await team.save();

  await recalculateHackathonCounts(team.hackathonId);

  res.json(team);
});

const getTeamsByHackathon = asyncHandler(async (req, res) => {
  const hackathonId = req.params.hackathonId;
  const teams = await Team.find({ hackathonId })
    .sort({ createdAt: -1 })
    .populate("members", "name email role");
  res.json({ teams });
});

module.exports = { createTeam, joinTeam, getTeamsByHackathon };


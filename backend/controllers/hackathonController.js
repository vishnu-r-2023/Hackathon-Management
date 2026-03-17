const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");
const Result = require("../models/Result");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const computeHackathonStatus = require("../utils/computeHackathonStatus");

const createHackathon = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    throw new AppError("Invalid dates", 400);
  }
  if (end <= start) throw new AppError("endDate must be after startDate", 400);

  const hackathon = await Hackathon.create({
    title,
    description,
    startDate: start,
    endDate: end,
    createdBy: req.user.id,
    status: computeHackathonStatus(start, end),
  });

  res.status(201).json(hackathon);
});

const getHackathons = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [total, hackathons] = await Promise.all([
    Hackathon.countDocuments(filter),
    Hackathon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  const now = new Date();
  const data = hackathons.map((h) => {
    const json = h.toJSON();
    json.status = computeHackathonStatus(h.startDate, h.endDate, now);
    return json;
  });

  res.json({ page, limit, total, hackathons: data });
});

const getHackathonById = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id).populate(
    "createdBy",
    "name email role"
  );
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const json = hackathon.toJSON();
  json.status = computeHackathonStatus(hackathon.startDate, hackathon.endDate);
  res.json(json);
});

const updateHackathon = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const { title, description, startDate, endDate } = req.body;
  if (typeof title === "string") hackathon.title = title;
  if (typeof description === "string") hackathon.description = description;
  if (startDate) hackathon.startDate = new Date(startDate);
  if (endDate) hackathon.endDate = new Date(endDate);

  if (hackathon.endDate <= hackathon.startDate) {
    throw new AppError("endDate must be after startDate", 400);
  }

  hackathon.status = computeHackathonStatus(hackathon.startDate, hackathon.endDate);
  await hackathon.save();

  res.json(hackathon);
});

const deleteHackathon = asyncHandler(async (req, res) => {
  const hackathonId = req.params.id;

  const hackathon = await Hackathon.findByIdAndDelete(hackathonId);
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const submissions = await Submission.find({ hackathonId }).select("_id");
  const submissionIds = submissions.map((s) => s._id);

  await Promise.all([
    Evaluation.deleteMany({ submissionId: { $in: submissionIds } }),
    Submission.deleteMany({ hackathonId }),
    Team.deleteMany({ hackathonId }),
    Result.deleteOne({ hackathonId }),
  ]);

  res.json({ message: "Hackathon deleted" });
});

const getHackathonAnalytics = asyncHandler(async (req, res) => {
  const hackathonId = req.params.hackathonId;

  const hackathon = await Hackathon.findById(hackathonId).select("_id");
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const [totalTeams, totalSubmissions, perSubmission] = await Promise.all([
    Team.countDocuments({ hackathonId }),
    Submission.countDocuments({ hackathonId }),
    Submission.aggregate([
      { $match: { hackathonId: hackathon._id } },
      {
        $lookup: {
          from: "evaluations",
          localField: "_id",
          foreignField: "submissionId",
          as: "evaluations",
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "teamId",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: "$team" },
      {
        $addFields: {
          avgScore: { $ifNull: [{ $avg: "$evaluations.score" }, 0] },
          teamName: "$team.name",
        },
      },
      {
        $project: {
          _id: 0,
          submissionId: "$_id",
          teamId: "$teamId",
          projectTitle: 1,
          teamName: 1,
          avgScore: 1,
        },
      },
      { $sort: { avgScore: -1 } },
    ]),
  ]);

  res.json({
    hackathonId,
    totalTeams,
    totalSubmissions,
    averageScoresPerSubmission: perSubmission,
  });
});

module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  getHackathonAnalytics,
};


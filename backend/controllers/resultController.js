const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");
const Submission = require("../models/Submission");
const Result = require("../models/Result");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const publishResults = asyncHandler(async (req, res) => {
  const hackathonId = req.params.hackathonId;

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const now = new Date();
  if (now < hackathon.endDate) {
    throw new AppError("Hackathon has not ended yet", 400);
  }

  const leaderboard = await Submission.aggregate([
    { $match: { hackathonId: new mongoose.Types.ObjectId(hackathonId) } },
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
  ]);

  const result = await Result.findOneAndUpdate(
    { hackathonId },
    {
      hackathonId,
      publishedBy: req.user.id,
      publishedAt: now,
      leaderboard,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Hackathon.findByIdAndUpdate(hackathonId, {
    resultsPublished: true,
    status: "completed",
  });

  res.json(result);
});

const getResults = asyncHandler(async (req, res) => {
  const hackathonId = req.params.hackathonId;
  const result = await Result.findOne({ hackathonId }).lean();
  if (!result) throw new AppError("Results not published", 404);
  res.json(result);
});

module.exports = { publishResults, getResults };


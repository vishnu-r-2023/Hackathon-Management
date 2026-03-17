const Submission = require("../models/Submission");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const Evaluation = require("../models/Evaluation");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createSubmission = asyncHandler(async (req, res) => {
  const { teamId, hackathonId, projectTitle, description, githubLink, demoLink } =
    req.body;

  const team = await Team.findById(teamId);
  if (!team) throw new AppError("Team not found", 404);

  if (!team.members.some((m) => m.toString() === req.user.id)) {
    throw new AppError("You are not a member of this team", 403);
  }

  const resolvedHackathonId = team.hackathonId.toString();
  if (hackathonId && hackathonId !== resolvedHackathonId) {
    throw new AppError("hackathonId does not match the team", 400);
  }

  const hackathon = await Hackathon.findById(resolvedHackathonId);
  if (!hackathon) throw new AppError("Hackathon not found", 404);

  const now = new Date();
  if (now < hackathon.startDate) {
    throw new AppError("Hackathon has not started yet", 400);
  }
  if (now > hackathon.endDate) {
    throw new AppError("Submission deadline has passed", 400);
  }

  const existing = await Submission.findOne({
    teamId,
    hackathonId: resolvedHackathonId,
  }).lean();
  if (existing) {
    throw new AppError("Team has already submitted for this hackathon", 409);
  }

  const submission = await Submission.create({
    teamId,
    hackathonId: resolvedHackathonId,
    projectTitle,
    description,
    githubLink,
    demoLink,
    submittedAt: now,
  });

  res.status(201).json(submission);
});

const getSubmissions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.hackathonId) filter.hackathonId = req.query.hackathonId;
  if (req.query.teamId) filter.teamId = req.query.teamId;

  const [total, submissions] = await Promise.all([
    Submission.countDocuments(filter),
    Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("teamId", "name")
      .populate("hackathonId", "title"),
  ]);

  res.json({ page, limit, total, submissions });
});

const getAssignedSubmissions = asyncHandler(async (req, res) => {
  const evaluations = await Evaluation.find({ judgeId: req.user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: "submissionId",
      populate: [
        { path: "teamId", select: "name" },
        { path: "hackathonId", select: "title" },
      ],
    });

  const assigned = evaluations
    .filter((e) => e.submissionId)
    .map((e) => ({
      evaluationId: e._id,
      submission: e.submissionId,
      score: e.score,
      feedback: e.feedback,
    }));

  res.json({ assigned });
});

const assignJudgeToSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { judgeId } = req.body;

  const judge = await User.findById(judgeId).select("role name email");
  if (!judge) throw new AppError("Judge not found", 404);
  if (judge.role !== "judge") throw new AppError("User is not a judge", 400);

  const submission = await Submission.findById(submissionId);
  if (!submission) throw new AppError("Submission not found", 404);

  const existing = await Evaluation.findOne({ submissionId, judgeId }).lean();
  if (existing) {
    return res.json({ message: "Already assigned" });
  }

  const evaluation = await Evaluation.create({
    submissionId,
    judgeId,
    score: null,
    feedback: "",
  });

  res.status(201).json(evaluation);
});

module.exports = {
  createSubmission,
  getSubmissions,
  getAssignedSubmissions,
  assignJudgeToSubmission,
};


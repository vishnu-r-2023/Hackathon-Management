const Evaluation = require("../models/Evaluation");
const Submission = require("../models/Submission");
const Team = require("../models/Team");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const submitEvaluation = asyncHandler(async (req, res) => {
  const { submissionId, score, feedback } = req.body;

  const evaluation = await Evaluation.findOne({
    submissionId,
    judgeId: req.user.id,
  });

  if (!evaluation) {
    throw new AppError("You are not assigned to this submission", 403);
  }

  evaluation.score = score;
  evaluation.feedback = feedback || "";
  await evaluation.save();

  res.json(evaluation);
});

const getEvaluationsBySubmission = asyncHandler(async (req, res) => {
  const submissionId = req.params.submissionId;

  const submission = await Submission.findById(submissionId).select("teamId");
  if (!submission) throw new AppError("Submission not found", 404);

  if (req.user.role === "admin") {
    const evaluations = await Evaluation.find({ submissionId })
      .sort({ createdAt: -1 })
      .populate("judgeId", "name email role");
    return res.json({ evaluations });
  }

  if (req.user.role === "judge") {
    const evaluation = await Evaluation.findOne({
      submissionId,
      judgeId: req.user.id,
    }).populate("judgeId", "name email role");

    if (!evaluation) throw new AppError("Forbidden", 403);
    return res.json({ evaluations: [evaluation] });
  }

  const team = await Team.findById(submission.teamId).select("members");
  if (!team) throw new AppError("Team not found", 404);
  if (!team.members.some((m) => m.toString() === req.user.id)) {
    throw new AppError("Forbidden", 403);
  }

  const evaluations = await Evaluation.find({ submissionId })
    .sort({ createdAt: -1 })
    .populate("judgeId", "name role");
  return res.json({ evaluations });
});

module.exports = { submitEvaluation, getEvaluationsBySubmission };


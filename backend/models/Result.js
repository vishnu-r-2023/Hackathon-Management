const mongoose = require("mongoose");

const leaderboardItemSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    projectTitle: { type: String, required: true },
    teamName: { type: String, required: true },
    avgScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
      unique: true,
      index: true,
    },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, required: true },
    leaderboard: { type: [leaderboardItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);


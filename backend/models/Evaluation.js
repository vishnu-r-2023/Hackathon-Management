const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
      index: true,
    },
    judgeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

evaluationSchema.index({ submissionId: 1, judgeId: 1 }, { unique: true });

module.exports = mongoose.model("Evaluation", evaluationSchema);


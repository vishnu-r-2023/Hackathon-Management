const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
      index: true,
    },
    projectTitle: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    githubLink: { type: String, default: "" },
    demoLink: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ teamId: 1, hackathonId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);


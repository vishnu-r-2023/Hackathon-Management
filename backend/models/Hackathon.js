const mongoose = require("mongoose");

const HACKATHON_STATUSES = ["upcoming", "ongoing", "completed"];

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    registrationCount: { type: Number, default: 0 },
    participantCount: { type: Number, default: 0 },
    status: { type: String, enum: HACKATHON_STATUSES, default: "upcoming" },
    resultsPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);


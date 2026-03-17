const mongoose = require("mongoose");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");

async function recalculateHackathonCounts(hackathonId) {
  const id = new mongoose.Types.ObjectId(hackathonId);
  const [summary] = await Team.aggregate([
    { $match: { hackathonId: id } },
    {
      $group: {
        _id: "$hackathonId",
        registrationCount: { $sum: 1 },
        participantCount: { $sum: { $size: "$members" } },
      },
    },
  ]);

  const registrationCount = summary?.registrationCount || 0;
  const participantCount = summary?.participantCount || 0;

  await Hackathon.findByIdAndUpdate(
    id,
    { registrationCount, participantCount },
    { new: false }
  );

  return { registrationCount, participantCount };
}

module.exports = { recalculateHackathonCounts };

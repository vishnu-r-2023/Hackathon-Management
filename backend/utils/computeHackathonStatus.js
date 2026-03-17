function computeHackathonStatus(startDate, endDate, now = new Date()) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (!start || !end) return "upcoming";
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

module.exports = computeHackathonStatus;


const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");
const teamRoutes = require("./routes/teamRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const resultRoutes = require("./routes/resultRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/results", resultRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

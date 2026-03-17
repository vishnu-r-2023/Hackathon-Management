function notFound(req, res, next) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  if (err?.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ message: "Duplicate key error" });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };

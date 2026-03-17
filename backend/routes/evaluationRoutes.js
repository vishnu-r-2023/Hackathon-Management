const express = require("express");
const Joi = require("joi");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");
const evaluationController = require("../controllers/evaluationController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("judge"),
  validate({
    body: Joi.object({
      submissionId: Joi.string().hex().length(24).required(),
      score: Joi.number().min(0).max(100).required(),
      feedback: Joi.string().allow("").max(10000).optional(),
    }),
  }),
  evaluationController.submitEvaluation
);

router.get(
  "/:submissionId",
  authMiddleware,
  validate({
    params: Joi.object({
      submissionId: Joi.string().hex().length(24).required(),
    }),
  }),
  evaluationController.getEvaluationsBySubmission
);

module.exports = router;


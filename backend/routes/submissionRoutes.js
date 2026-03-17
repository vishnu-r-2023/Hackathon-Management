const express = require("express");
const Joi = require("joi");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");
const submissionController = require("../controllers/submissionController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("participant"),
  validate({
    body: Joi.object({
      teamId: Joi.string().hex().length(24).required(),
      hackathonId: Joi.string().hex().length(24).optional(),
      projectTitle: Joi.string().trim().min(2).max(200).required(),
      description: Joi.string().allow("").max(10000).optional(),
      githubLink: Joi.string().uri().allow("").optional(),
      demoLink: Joi.string().uri().allow("").optional(),
    }),
  }),
  submissionController.createSubmission
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      hackathonId: Joi.string().hex().length(24).optional(),
      teamId: Joi.string().hex().length(24).optional(),
    }),
  }),
  submissionController.getSubmissions
);

router.get(
  "/assigned",
  authMiddleware,
  authorizeRoles("judge"),
  submissionController.getAssignedSubmissions
);

router.post(
  "/:submissionId/assign-judge",
  authMiddleware,
  authorizeRoles("admin"),
  validate({
    params: Joi.object({
      submissionId: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
      judgeId: Joi.string().hex().length(24).required(),
    }),
  }),
  submissionController.assignJudgeToSubmission
);

module.exports = router;


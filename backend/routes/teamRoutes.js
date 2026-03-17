const express = require("express");
const Joi = require("joi");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");
const teamController = require("../controllers/teamController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("participant"),
  validate({
    body: Joi.object({
      name: Joi.string().trim().min(2).max(120).required(),
      hackathonId: Joi.string().hex().length(24).required(),
    }),
  }),
  teamController.createTeam
);

router.post(
  "/join/:teamId",
  authMiddleware,
  authorizeRoles("participant"),
  validate({
    params: Joi.object({ teamId: Joi.string().hex().length(24).required() }),
  }),
  teamController.joinTeam
);

router.get(
  "/:hackathonId",
  authMiddleware,
  validate({
    params: Joi.object({
      hackathonId: Joi.string().hex().length(24).required(),
    }),
  }),
  teamController.getTeamsByHackathon
);

module.exports = router;


const express = require("express");
const Joi = require("joi");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");
const hackathonController = require("../controllers/hackathonController");

const router = express.Router();

router.get(
  "/",
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      status: Joi.string().valid("upcoming", "ongoing", "completed").optional(),
    }),
  }),
  hackathonController.getHackathons
);

router.get(
  "/:id",
  validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }),
  hackathonController.getHackathonById
);

router.get(
  "/:hackathonId/analytics",
  authMiddleware,
  authorizeRoles("admin"),
  validate({
    params: Joi.object({
      hackathonId: Joi.string().hex().length(24).required(),
    }),
  }),
  hackathonController.getHackathonAnalytics
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  validate({
    body: Joi.object({
      title: Joi.string().trim().min(2).max(200).required(),
      description: Joi.string().allow("").max(5000).optional(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      judgeIds: Joi.array()
        .items(Joi.string().hex().length(24))
        .unique()
        .optional(),
    }),
  }),
  hackathonController.createHackathon
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
    body: Joi.object({
      title: Joi.string().trim().min(2).max(200).optional(),
      description: Joi.string().allow("").max(5000).optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      judgeIds: Joi.array()
        .items(Joi.string().hex().length(24))
        .unique()
        .optional(),
    }),
  }),
  hackathonController.updateHackathon
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  validate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) }),
  hackathonController.deleteHackathon
);

module.exports = router;

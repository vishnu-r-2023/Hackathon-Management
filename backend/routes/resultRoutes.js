const express = require("express");
const Joi = require("joi");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");
const resultController = require("../controllers/resultController");

const router = express.Router();

router.post(
  "/publish/:hackathonId",
  authMiddleware,
  authorizeRoles("admin"),
  validate({
    params: Joi.object({
      hackathonId: Joi.string().hex().length(24).required(),
    }),
  }),
  resultController.publishResults
);

router.get(
  "/:hackathonId",
  validate({
    params: Joi.object({
      hackathonId: Joi.string().hex().length(24).required(),
    }),
  }),
  resultController.getResults
);

module.exports = router;


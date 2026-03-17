const express = require("express");
const Joi = require("joi");

const validate = require("../middleware/validate");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  validate({
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required(),
      role: Joi.string().valid("admin", "participant", "judge").optional(),
      bootstrapSecret: Joi.string().optional(),
    }),
  }),
  authController.register
);

router.post(
  "/login",
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  authController.login
);

module.exports = router;


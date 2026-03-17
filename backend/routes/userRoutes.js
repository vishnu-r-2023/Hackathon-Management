const express = require("express");
const Joi = require("joi");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const validate = require("../middleware/validate");
const userController = require("../controllers/userController");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("admin"));

router.get(
  "/",
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      role: Joi.string().valid("admin", "participant", "judge").optional(),
    }),
  }),
  userController.getUsers
);

router.delete(
  "/:id",
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  userController.deleteUser
);

module.exports = router;


const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { signup, login } = require("../controllers/authController");

router.post(
    "/signup",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({ min: 6 }).withMessage("Password too short"),
        body("role").isIn(["student", "teacher"]).withMessage("Invalid role")
    ],
    signup
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").notEmpty().withMessage("Password is required")
    ],
    login
);

module.exports = router;

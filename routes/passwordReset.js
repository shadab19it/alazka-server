const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { passwordResetLink, passwordReset } = require("../controlers/passwordReset");

router.post("/link", [check("email").isEmail().withMessage("email is required")], passwordResetLink);
router.post("/update/:token", passwordReset);

module.exports = router;

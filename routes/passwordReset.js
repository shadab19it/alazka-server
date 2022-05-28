const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { passwordResetLink, passwordReset, resetPasswordByAdmin } = require("../controlers/passwordReset");

router.post("/:userId", resetPasswordByAdmin);
router.post("/link", [check("email").isEmail().withMessage("email is required")], passwordResetLink);
router.post("/update/:token", passwordReset);

module.exports = router;

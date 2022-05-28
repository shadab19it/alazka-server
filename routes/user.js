const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middlewares/auth");
const {
  userRegister,
  getUserById,
  userLogout,
  signin,
  getAllUsers,
  adminUpdateUser,
  getCreditById,
  getUserAvatar,
  verifyEmailRegister,
  addNewUser,
} = require("../controlers/user");

// SignUp Routes
router.post(
  "/register",
  [
    check("username").isLength({ min: 5 }).withMessage("username must be at least 5 chars long"),
    check("email").isEmail().withMessage("email is required"),
    check("password", "Password must be at least 6 chars long").isLength({ min: 6 }),
  ],
  userRegister
);

router.post(
  "/add",
  [
    check("username").isLength({ min: 5 }).withMessage("username must be at least 5 chars long"),
    check("email").isEmail().withMessage("email is required"),
    check("password", "Password must be at least 6 chars long").isLength({ min: 6 }),
  ],
  addNewUser
);

// auth Routes
router.post(
  "/signin",
  [check("email").isEmail().withMessage("email is required"), check("password", "password must be required").isLength({ min: 5 })],
  signin
);
router.get("/signout", userLogout);
router.get("/verify/email/:token", verifyEmailRegister);

router.get("/info", auth, getUserById);
router.get("/credit", auth, getCreditById);
router.get("/avatar", auth, getUserAvatar);
router.get("/get-all-users", auth, getAllUsers);
router.post("/admin-update-user", auth, adminUpdateUser);

module.exports = router;

const { User } = require("../modals/User");
const jwt = require("jsonwebtoken");
const { config } = require("../config/config");
const sendEmail = require("./sendEmail");

const { validationResult } = require("express-validator");

// password rest controler
exports.passwordResetLink = (req, res) => {
  const { email } = req.body;
  // validation check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ msg: errors.array()[0].msg, input: errors.array()[0].param });
  }

  // find user by Email address
  User.findOne({ email }, async (err, user) => {
    if (err || !user) {
      return res.status(200).json({ msg: `${email} is not registered email!`, type: "email" });
    }
    const token = jwt.sign({ email, user_id: user._id }, config.JWT_FORGOT_EMAIL_KEY, { expiresIn: "5m" });
    const CLIENT_URL = req.headers.referer;

    const bodyText = `
    <h2>Please click on below link to reset your password</h2>
    <p>${CLIENT_URL}password/reset/${token}</p>
    <a href='${CLIENT_URL}password/reset/${token}'>Clicl here<a>
    <p><b>NOTE: </b> The above reset link expire in 5 minutes.</p>`;
    try {
      await sendEmail(email, "Arabic OCR password rest link", bodyText);
      return res.status(200).json({ msg: `Link sent! please chaeck your mail.`, type: "email", isSent: true });
    } catch (err) {
      return res.status(200).json({ msg: `email not sent Something  wents wrong`, type: "email", isSent: false });
    }
  });
};

exports.passwordReset = (req, res) => {
  const token = req.params["token"];
  const { password } = req.body;

  jwt.verify(token, config.JWT_FORGOT_EMAIL_KEY, async (err, decodeToken) => {
    if (decodeToken === undefined) {
      return res.status(200).json({ msg: "Your Password reset link now expire, Please try again ", success: false });
    }
    const { user_id } = decodeToken;

    if (password) {
      User.findOneAndUpdate(
        { _id: user_id },
        { password: password },
        { new: true },

        (err, user) => {
          if (err) {
            res.status(200).json({ msg: "failed to reset your password! Please try again", success: false });
          }
          res.status(200).json({ msg: "Password reset successfully back to Login!", success: true });
        }
      );
    } else {
      res.status(200).json({ msg: "Please enter you password", success: false });
    }
  });
};

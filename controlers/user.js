const { User } = require("../modals/User");
const expressJwt = require("express-jwt");
const { validationResult } = require("express-validator");
const { smpt_config, config } = require("../config/config");
const sendEmail = require("./sendEmail");
const jwt = require("jsonwebtoken");

exports.userRegister = async (req, res) => {
  const exErrors = validationResult(req);
  if (!exErrors.isEmpty()) {
    return res.status(200).json({ error: exErrors.array()[0].msg, input: exErrors.array()[0].param });
  }

  const { username, email, password } = req.body;

  try {
    const alreadyUser = await User.findOne({ email: email });
    if (alreadyUser) return res.status(200).json({ mailSent: false, msg: `This ${email} is already exist.` });

    const token = jwt.sign({ username, password, email }, config.JWT_CONFIRM_EMAIL_KEY, { expiresIn: "30m" });
    const CLIENT_URL = req.headers.referer;

    const emailVerifyTemplate = `
    <h2>Please click on below link to confirm your email</h2>
    <p>${CLIENT_URL}/email/verify/${token}</p>
    <a href='${CLIENT_URL}/email/verify/${token}'>Click here to Confirm your email<a>
    <p><b>NOTE: </b> The above confirm link expires in 30 minutes.</p>`;

    await sendEmail(email, "Verify Email", emailVerifyTemplate);
    console.log("mail sent");
    return res
      .status(200)
      .json({ mailSent: true, msg: `Verification link sent to email ID " ${email} ". Please verify for SignIn.`, email: email });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ mailSent: false, error: "Server error please try again later" });
  }
};

// Signin Controller
exports.signin = (req, res) => {
  const { email, password, isSocialLogin, username } = req.body;

  // validation check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ msg: errors.array()[0].msg, input: errors.array()[0].param });
  }

  // find user by Email address
  User.findOne({ email }, async (err, user) => {
    if (err || !user) {
      if (isSocialLogin && !user) {
        // console.log(req.body);
        let newuser = new User({ email: email, password: "alazkaocr@12#", username: username });
        newuser = await newuser.save();
        newuser.generateToken(async (token) => {
          const bodyText = `
          <h2>New User Register in Alazka</h2>
          <p>Email : ${email}</p>
          <p>Created At : ${new Date()}</p>
          `;
          try {
            await sendEmail(smpt_config.auth.user, "New User Created", bodyText);
          } catch (err) {
            console.log("New User created mail not sent");
          }
          return res.status(200).json({
            loginSuccess: true,
            msg: "Thank you for Register in Arabic.OCR. We will Shortly Acitve your Account.",
            type: "password",
            isActive: false,
          });
        });
        return;
      } else {
        return res.status(200).json({ msg: `${email} is not a registered email!`, type: "email" });
      }
    }

    if (isSocialLogin) {
      if (!user.isActive) {
        return res
          .status(200)
          .json({ loginSuccess: true, msg: "Sorry, Your Account is In-Active. Please Contact Us", type: "password", isActive: false });
      }
      user.generateToken((token) => {
        // put token in cookie
        res.cookie("token", token.token, { expire: new Date() + 9999 });
        return res.status(200).json({
          loginSuccess: true,
          token: token.token,
          isActive: true,
        });
      });
    } else {
      user.comparePassword(password, (_, isMatch) => {
        if (!isMatch)
          return res.status(200).json({ loginSuccess: false, msg: "Look like you entered the wrong password.", type: "password" });
        if (!user.isActive) {
          return res
            .status(200)
            .json({ loginSuccess: true, msg: "Sorry, Your Account is In-Active. Please Contact Us.", type: "password", isActive: false });
        }

        user.generateToken((token) => {
          // put token in cookie
          res.cookie("token", token.token, { expire: new Date() + 9999 });
          return res.status(200).json({
            loginSuccess: true,
            token: token.token,
            isActive: true,
          });
        });
      });
    }
  });
};

exports.getUserById = (req, res) => {
  const id = req.loggedUser._id;
  User.findOne({ _id: id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        msg: "No found user in database",
      });
    }
    return res.status(200).json({
      name: user.username,
      email: user.email,
      plan: user.plan,
      totalCredit: user.role === "user" ? user.totalCredit : "Unlimited",
      leftCredit: user.role === "user" ? user.leftCredit : "Unlimited",
      user_id: user._id,
      phone: user.phone ?? "",
      role: user.role,
    });
  });
};

exports.getCreditById = (req, res) => {
  const id = req.loggedUser._id;
  User.findOne({ _id: id }, (err, user) => {
    if (err || !user) {
      return res.status(404).json({
        error: "User not found!",
      });
    }
    return res.status(200).json({
      totalCredit: user.role === "user" ? user.totalCredit : "Unlimited",
      leftCredit: user.role === "user" ? user.leftCredit : "Unlimited",
    });
  });
};

exports.getUserAvatar = (req, res) => {
  const userId = req.loggedUser._id;
  User.findOne({ _id: userId }, (err, user) => {
    if (err || !user) {
      return res.status(404).json({
        error: "User Pic not found!",
      });
    }
    return res.status(200).json(user.pic);
  });
};

exports.getAllUsers = (req, res) => {
  if (req?.loggedUser.role === "admin") {
    User.find({}, (err, users) => {
      if (err) {
        return res.status(200).json({ msg: "No User found" });
      }
      return res.status(200).json({ users: users, success: true });
    }).sort({ inserted_by_date: -1 });
  } else {
    return res.status(404).json({ msg: "Sorry you are not an admin" });
  }
};

exports.adminUpdateUser = (req, res) => {
  const { leftCredit, totalCredit, isActive, role, user_id } = req.body;
  let updateUserObj = {};
  if (leftCredit) updateUserObj["leftCredit"] = leftCredit;
  if (totalCredit) updateUserObj["totalCredit"] = totalCredit;
  if (role) updateUserObj["role"] = role;
  updateUserObj["isActive"] = isActive;

  User.findByIdAndUpdate(
    { _id: user_id },
    { $set: updateUserObj },
    { new: true, useFindAndModify: false },

    (err, user) => {
      if (err) {
        return res.status(404).json({ msg: "Server Error! Please try again later", success: false });
      }

      return res.status(200).json({ msg: "User Updated", success: true });
    }
  );
};

// SignOut Controller
exports.userLogout = (req, res) => {
  req.user = null;
  res.clearCookie("token");
  res.status(200).json({
    msg: "your are Logout",
  });
};

exports.verifyEmailRegister = async (req, res) => {
  const token = req.params.token;
  jwt.verify(token, config.JWT_CONFIRM_EMAIL_KEY, async (err, decodeToken) => {
    console.log("decode ", decodeToken);
    if (decodeToken === undefined) {
      return res.status(400).json({ loginSuccess: false, error: "Your Email Confirm Link Now Expire, Please Register Again " });
    }
    const { username, email, password } = decodeToken;
    try {
      let newuser = new User({ username, email, password });
      newuser = await newuser.save();
      newuser.generateToken(async (token) => {
        // put token in cookie
        const bodyText = `
        <h2>New User Register in Arabic OCR</h2>
        <p>Name : ${newuser.username}</p>
        <p>Email : ${newuser.email}</p>
        <p>Created At : ${new Date()}</p>
        `;
        try {
          await sendEmail(smpt_config.auth.user, "New User Created", bodyText);
          return res.status(200).json({
            loginSuccess: true,
            msg: "Thank you for Register in Arabic OCR, We will Shortly active your Account.",
            isActive: false,
          });
        } catch (err) {
          console.log("New User created but mail not sent");
        }
      });
    } catch (error) {
      return res.status(400).json({ loginSuccess: false, error: "Server Error! Please try again later" });
    }
  });
};

// protected routes if user logoin or not then we show which routes
exports.isSignedIn = expressJwt({
  secret: config.JWT_SECRET_KEY,
  userProperty: "auth",
  algorithms: ["HS256"],
});

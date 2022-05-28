const router = require("express").Router();
const { User } = require("../modals/User");
const formidable = require("formidable");

// Update User through user Id

router.post("/:userId", (req, res, next) => {
  const userId = req.loggedUser._id;
  let form = new formidable.IncomingForm();

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({ error: "Input Data is not correct form" });
    }
    const { username, email, phone, avatar } = fields;

    let updateUserObj = {};
    if (username) updateUserObj["username"] = username;
    if (email) updateUserObj["email"] = email;
    updateUserObj["phone"] = phone;
    if (avatar) {
      const userPic = Buffer.from(avatar.split(",")[1], "base64");
      updateUserObj["pic"] = userPic;
    }
    User.findByIdAndUpdate(
      { _id: userId },
      { $set: updateUserObj },
      { new: true, useFindAndModify: false },

      (err, user) => {
        if (err) {
          return res.status(400).json({ error: "Server Error" });
        }
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }
        return res.status(200).json(user);
      }
    );
  });
});

module.exports = router;

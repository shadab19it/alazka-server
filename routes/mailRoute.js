const express = require("express");
const { smpt_config } = require("../config/config");
const router = express.Router();
const sendEmail = require("../controlers/sendEmail");

router.post("/query-mail", async (req, res) => {
  const { name, email, queries } = req.body;
  const bodyText = `
      <h3>User Info</h3>
      <p>Name : ${name}</p>
      <p>Email : ${email}</p>
      <h3>User Queries</h3>
      <p>${queries}</p>
      `;
  try {
    await sendEmail(smpt_config.auth.user, "Mail for Querie", bodyText);
    return res.status(200).json({ success: true, msg: "Your Queries send successfully" });
  } catch (err) {
    console.log(err);
    return res.status(402).json({ success: false, error: "Something wents wrong please try again later" });
  }
});

router.post("/contact-us/mail", async (req, res) => {
  const { name, email, requirement_desc } = req.body;
  const bodyText = `
      <h3>User Info</h3>
      <p>Name : ${name}</p>
      <p>Email : ${email}</p>
  
      <h3>User Requirement</h3>
      <p>${requirement_desc}</p>
      `;

  try {
    await sendEmail(smpt_config.auth.user, "Mail for Credit requirment", bodyText);
  } catch (err) {
    return res.status(402).json({ success: false, error: "Something wents wrong please try again later" });
  }
});

module.exports = router;

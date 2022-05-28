const nodemailer = require("nodemailer");
const { smpt_config } = require("../config/config");

const EMAIL_HOST = smpt_config.host;
const EMAIL_PORT = smpt_config.port;
const EMAIL_USERNAME = smpt_config.auth.user;
const EMAIL_PASSWORD = smpt_config.auth.pass;

// Create the transporter with the required configuration for Outlook
// change the user and pass !
let transporter = nodemailer.createTransport({
  host: EMAIL_HOST, // hostname
  port: EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "" + EMAIL_USERNAME + "", // your domain email address
    pass: "" + EMAIL_PASSWORD + "", // your password
  },
});

module.exports = transporter;

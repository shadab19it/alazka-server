const { smpt_config } = require("../config/config");
const transporter = require("../config/Email");

const sendEmail = async (email, subject, bodyHtml) => {
  await transporter.sendMail({
    from: smpt_config.from,
    to: email,
    subject: subject,
    html: bodyHtml,
  });
};

module.exports = sendEmail;

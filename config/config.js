require("dotenv").config();

const prodmongoconfig = {
  mongoURI: "mongodb+srv://shadab19it:shadab19it@cluster0.nl5hr.mongodb.net/alazka-db?retryWrites=true&w=majority",
};

const devmongoconfig = {
  mongoURI: "mongodb+srv://alazka-dev:alazkadev123@cluster0.6l1u8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
};

const localMongoDbConfig = {
  mongoURI: "mongodb://localhost:27017/mydb",
};

const mongoDBDockerImg = {
  mongoURI: process.env.MONGO_URI || "mongodb://159.69.210.83:27017/",
};

let config = {
  JWT_SECRET_KEY: "alazla@12#token",
  JWT_FORGOT_EMAIL_KEY: "alazka-email-token",
  JWT_CONFIRM_EMAIL_KEY: "alazka-email-verify",
  PORT: 3001,
  NODE_ENV: "production",
};
let mongo_config = {};

const auth_email = "alazkaroot361@gmail.com";

if (config.NODE_ENV === "production") {
  mongo_config = mongoDBDockerImg;
} else {
  mongo_config = localMongoDbConfig;
}
// console.log(config.env.NODE_ENV);

const smpt_config = {
  port: 587,
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: auth_email,
    pass: "alazka@123",
  },
  from: `Arabic OCR <${auth_email}>`,
};

console.log(mongo_config);

module.exports = { mongo_config, config, smpt_config };

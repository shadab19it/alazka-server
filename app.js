const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const auth = require("./middlewares/auth");
const connect = require("./config/mongodb");
const { config } = require("./config/config");

const app = express();
const connection = connect;

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

//Middlewares global
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false, parameterLimit: 500000 }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(cors(corsOptions));
app.use(cookieParser());

// initial test route
app.get("/", (req, res) => res.status(200).send("Hello, welcome to alazka.ai"));

// client api route
app.use("/user", require("./routes/user"));
app.use("/user/update", auth, require("./controlers/updateUser"));
app.use("/process/file", require("./routes/processfile"));
app.use("/api/password-reset", require("./routes/passwordReset"));
app.use("/send", require("./routes/mailRoute"));
app.use("/api/apikey", require("./routes/apikey"));

//  Listening Server
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server Started at ${config.PORT}`);
});

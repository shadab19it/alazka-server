const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

const verifyToken = async (req, res, next) => {
  // console.log(req.originalUrl);
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase
  // console.log("info", `access _ token , ${token}`);

  try {
    if (token !== undefined) {
      let payload = await jwt.verify(token, config.JWT_SECRET_KEY);
      if (payload !== undefined && payload) {
        // console.log("info", `this is decoded token, ${JSON.stringify(payload)}`);
        req.loggedUser = payload;
        next();
      } else {
        res.status(401).json({
          loginSuccess: false,
          status_code: 401,
          error: "Session expired Please login again",
        });
      }
    }
  } catch (e) {
    console.log("error", `Error executing on auth token decode , ${JSON.stringify(e)}`);
    if (e.name === "TokenExpiredError") {
      res.status(401).json({
        loginSuccess: false,
        status_code: 401,
        error: "Session expired Please login again",
      });
    } else if (e.name === "JsonWebTokenError") {
      res.status(401).json({
        loginSuccess: false,
        status_code: 401,
        error: "Invalid Signature! Please login again",
      });
    } else {
      console.log("error in  ", e);
      res.status(500).json({
        loginSuccess: false,
        status_code: 500,
        error: "Invalid Signature! Please login again",
      });
    }
  }
};

module.exports = verifyToken;

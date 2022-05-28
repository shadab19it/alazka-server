const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { config } = require("../config/config");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
var ObjectId = require("mongodb").ObjectID;
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);
const TOKEN_EXPIRY = "365d";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, maxlength: 50, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, required: false, default: "user" },
    totalCredit: { type: Number, required: false, default: 200 },
    leftCredit: { type: Number, required: false, default: 200 },
    plan: { type: String, required: false, default: "free" },
    apiKey: { type: String, required: false, default: "", trim: true },
    pic: { type: Buffer, required: false, default: "" },
    phone: { type: String, required: false, minglength: 10, maxlength: 12, default: "" },
    isActive: { type: Boolean, required: true, default: false },
    inserted_by_date: { type: String, required: true, trim: true, default: Date.now },
  },
  { timestamps: true }
);
userSchema.plugin(autoIncrement.plugin, { model: "User", field: "serial_id", startAt: 1, incrementBy: 1 });

userSchema.pre("save", function (next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.pre("findOneAndUpdate", function (next) {
  var user = this;
  if (user._update.password) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user._update.password, salt, function (err, hash) {
        if (err) return next(err);
        user._update.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    config.JWT_SECRET_KEY,
    { expiresIn: TOKEN_EXPIRY }
  );

  jwt.verify(token, config.JWT_SECRET_KEY, function (err, decoded) {
    if (err) console.log(err);
  });

  const userWithToken = { ...user._doc, token: token };
  cb(userWithToken);
};

userSchema.statics.findById = function (_id) {
  var user = this;
  user.findOne({ _id: ObjectId(_id) }, function (err, userdata) {
    return userdata;
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User, userSchema };

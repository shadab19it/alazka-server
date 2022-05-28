const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, trim: true },
    success: { type: Boolean, required: true },
    noOf_pages: { type: Number, required: false },
    inserted_by_date: { type: String, required: true, trim: true, default: Date.now },
  },
  { timestamps: true }
);
userSchema.plugin(autoIncrement.plugin, { model: "apiProcessFile", field: "serial_id", startAt: 1, incrementBy: 1 });

const APIProcessFile = mongoose.model("apiProcessFile", userSchema);

module.exports = { APIProcessFile, userSchema };

const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);

const userSchema = new mongoose.Schema(
  {
    file_uid: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    size: { type: Number, required: true, default: 0 },
    type: { type: String, required: true, trim: true },
    user_id: { type: String, required: true, trim: true },
    success: { type: Boolean, required: true },
    extractionResult: { type: Array, required: true },

    detected_img: { type: Buffer, required: false },
    box_text: { type: Array, required: false },
    connected_text: { type: String, required: false },
    linear_text: { type: String, required: false },
    text: { type: String, required: false },

    pdf_text: { type: Array, required: false },
    pdf_img_text: { type: Array, required: false },

    upload_img: { type: String, required: false },
    upload_pdf: { type: String, required: false },
    noOf_pages: { type: Number, required: false },

    inserted_by_date: { type: String, required: true, trim: true, default: Date.now },
  },
  { timestamps: true }
);
userSchema.plugin(autoIncrement.plugin, { model: "processFile", field: "serial_id", startAt: 1, incrementBy: 1 });

const ProcessFile = mongoose.model("processFile", userSchema);

module.exports = { ProcessFile, userSchema };

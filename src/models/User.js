const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: String, required: true, unique: true, trim: true },
    fingerprintId: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };

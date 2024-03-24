const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);

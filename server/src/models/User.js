const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: { type: String, enum: ["student", "teacher"], required: true },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

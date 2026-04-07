const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // What the patient visited the doctor for (reason).
    visitedFor: { type: String, default: "" },
    // Frontend expects `recommend` boolean to render stars.
    recommend: { type: Boolean, default: false },
    // Story text.
    story: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Story", storySchema);


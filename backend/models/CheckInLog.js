const mongoose = require("mongoose");

const checkInLogSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    gatekeeper: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    result: {
      type: String,
      enum: ["VALID", "ALREADY_USED", "INVALID"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckInLog", checkInLogSchema);

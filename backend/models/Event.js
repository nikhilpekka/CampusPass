const mongoose = require("mongoose");

const tierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Early Bird", "General", "VIP"
    price: { type: Number, required: true, default: 0 },
    quota: { type: Number, required: true, default: 0 }, // total seats for this tier
    booked: { type: Number, required: true, default: 0 }, // seats already booked
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["TECH", "CULTURAL", "SPORTS", "WORKSHOP"],
      default: "TECH",
    },
    description: { type: String, default: "" },
    venue: { type: String, required: true },
    startsAt: { type: Date, required: true },
    bannerUrl: { type: String, default: "" },
    tiers: { type: [tierSchema], default: [] },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Convenience virtual: total capacity across tiers
// Guarded because populated Event subdocuments can come back without
// `tiers` (e.g. .populate("event", "title venue")) — without this guard,
// serializing such a doc with { virtuals: true } throws
// "Cannot read properties of undefined (reading 'reduce')".
eventSchema.virtual("capacity").get(function getCapacity() {
  return (this.tiers || []).reduce((sum, t) => sum + t.quota, 0);
});

eventSchema.virtual("totalBooked").get(function getTotalBooked() {
  return (this.tiers || []).reduce((sum, t) => sum + t.booked, 0);
});

eventSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);

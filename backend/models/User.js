const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["ATTENDEE", "ORGANIZER", "GATEKEEPER"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ROLES, default: "ATTENDEE" },
    rollNumber: { type: String, trim: true }, // optional, shown to gatekeepers on scan
  },
  { timestamps: true }
);

// Hash password before saving, only if it changed
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never send the password hash back in API responses
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model("User", userSchema);

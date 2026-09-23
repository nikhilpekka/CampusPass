// Run with: npm run seed
// Creates demo accounts and one demo event so the app is testable immediately.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Event = require("../models/Event");

const DEMO_PASSWORD = "Password123!";

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Event.deleteMany({})]);

  const organizer = await User.create({
    name: "Asha Organizer",
    email: "organizer@campus.edu",
    password: DEMO_PASSWORD,
    role: "ORGANIZER",
  });

  await User.create({
    name: "Rahul Gatekeeper",
    email: "gatekeeper@campus.edu",
    password: DEMO_PASSWORD,
    role: "GATEKEEPER",
  });

  await User.create({
    name: "Meera Attendee",
    email: "attendee@campus.edu",
    password: DEMO_PASSWORD,
    role: "ATTENDEE",
    rollNumber: "CE-2027-014",
  });

  await Event.create({
    title: "TechFest '26 — Opening Night",
    category: "TECH",
    description: "Kickoff night for the annual college tech fest: talks, demos and a robotics showcase.",
    venue: "Main Auditorium",
    startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tiers: [
      { name: "General", price: 0, quota: 200, booked: 0 },
      { name: "VIP", price: 199, quota: 30, booked: 0 },
    ],
    organizer: organizer._id,
  });

  console.log("Seed complete. Demo accounts (password for all: Password123!):");
  console.log("  organizer@campus.edu");
  console.log("  gatekeeper@campus.edu");
  console.log("  attendee@campus.edu");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

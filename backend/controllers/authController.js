const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

function issueToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Access codes gate the two elevated roles. Anyone can sign up as an
// ATTENDEE; ORGANIZER/GATEKEEPER require the matching code from the
// environment. The client-supplied `role` is never trusted on its own -
// resolving it here means a request that forges `role: "ORGANIZER"`
// without the code is silently downgraded to ATTENDEE.
const ACCESS_CODE_BY_ROLE = {
  ORGANIZER: process.env.ORGANIZER_ACCESS_CODE,
  GATEKEEPER: process.env.GATEKEEPER_ACCESS_CODE,
};

function resolveRole(requestedRole, accessCode) {
  if (!User.ROLES.includes(requestedRole) || requestedRole === "ATTENDEE") {
    return "ATTENDEE";
  }
  const expectedCode = ACCESS_CODE_BY_ROLE[requestedRole];
  const codeIsValid = expectedCode && accessCode && accessCode === expectedCode;
  return codeIsValid ? requestedRole : "ATTENDEE";
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNumber, accessCode } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required.");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const resolvedRole = resolveRole(role, accessCode);
  if (role && role !== "ATTENDEE" && resolvedRole === "ATTENDEE") {
    res.status(403);
    throw new Error("That access code is invalid for the selected role.");
  }

  const user = await User.create({
    name,
    email,
    password,
    rollNumber,
    role: resolvedRole,
  });

  res.status(201).json({ user, token: issueToken(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: (email || "").toLowerCase() });
  const passwordMatches = user && (await user.comparePassword(password || ""));

  if (!passwordMatches) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.json({ user, token: issueToken(user) });
});

// GET /api/auth/me
const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getProfile };

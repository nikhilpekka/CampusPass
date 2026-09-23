const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the Bearer token and attaches the user document to req.user.
 */
async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated. Missing token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // .lean() skips Mongoose document hydration (getters/virtuals/change
    // tracking) since nothing in the app calls instance methods on
    // req.user - it's only ever read for plain fields. This runs on
    // every authenticated request, so it's worth the saved overhead.
    // .select("-password") is required here because lean() bypasses the
    // schema's toJSON transform that normally strips the password hash.
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      return res.status(401).json({ message: "User for this token no longer exists." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

/**
 * Restricts a route to one or more roles.
 * Usage: authorize("ORGANIZER", "GATEKEEPER")
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this action." });
    }
    next();
  };
}

module.exports = { protect, authorize };

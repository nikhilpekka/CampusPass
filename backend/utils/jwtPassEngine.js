const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Every pass is a short-lived-looking but actually long-lived JWT signed
 * with PASS_SECRET (kept separate from the auth JWT_SECRET). The payload
 * is deliberately minimal - just enough to look the ticket up and confirm
 * it hasn't been tampered with.
 */
function signPass({ ticketId, eventId, userId }) {
  const nonce = crypto.randomBytes(8).toString("hex");

  const token = jwt.sign(
    { ticketId, eventId, userId, nonce, issuedAt: Date.now() },
    process.env.PASS_SECRET,
    { algorithm: "HS256" }
  );

  return { token, nonce };
}

/**
 * Returns { valid: true, payload } on a good signature,
 * or { valid: false, reason } on a forged/corrupted code.
 */
function verifyPass(token) {
  try {
    const payload = jwt.verify(token, process.env.PASS_SECRET);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

module.exports = { signPass, verifyPass };

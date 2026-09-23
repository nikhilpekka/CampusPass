const Ticket = require("../models/Ticket");
const CheckInLog = require("../models/CheckInLog");
const { verifyPass } = require("../utils/jwtPassEngine");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/gate/validate  (gatekeeper only)  body: { token }
// token = the raw string read from the QR code
const validatePass = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("No QR payload provided.");
  }

  const verification = verifyPass(token);

  if (!verification.valid) {
    return res.json({ result: "INVALID", message: "Signature mismatch — this pass was not issued by CampusPass." });
  }

  const { ticketId } = verification.payload;
  const ticket = await Ticket.findById(ticketId).populate("event", "title").populate("user", "name rollNumber");

  if (!ticket) {
    return res.json({ result: "INVALID", message: "No ticket matches this pass." });
  }

  if (ticket.paymentStatus !== "PAID") {
    return res.json({ result: "INVALID", message: "This ticket's payment was never completed." });
  }

  if (ticket.status === "CANCELLED") {
    return res.json({
      result: "CANCELLED",
      attendee: { name: ticket.user.name, tier: ticket.tierName },
      message: "This ticket was cancelled and is no longer valid for entry.",
    });
  }

  // Atomic update: only flips VALID -> CHECKED_IN once, closing the
  // race window between two gatekeepers scanning the same pass at once.
  if (ticket.status === "VALID") {
    const updated = await Ticket.findOneAndUpdate(
      { _id: ticket._id, status: "VALID" },
      { status: "CHECKED_IN", checkedInAt: new Date(), checkedInBy: req.user._id },
      { new: true }
    );

    if (updated) {
      await CheckInLog.create({ ticket: ticket._id, event: ticket.event._id, gatekeeper: req.user._id, result: "VALID" });
      return res.json({
        result: "VALID",
        attendee: { name: ticket.user.name, rollNumber: ticket.user.rollNumber, tier: ticket.tierName },
        event: ticket.event.title,
      });
    }
    // Someone else's request won the race between our read and write — fall through to ALREADY_USED.
  }

  await CheckInLog.create({ ticket: ticket._id, event: ticket.event._id, gatekeeper: req.user._id, result: "ALREADY_USED" });
  res.json({
    result: "ALREADY_USED",
    attendee: { name: ticket.user.name, tier: ticket.tierName },
    checkedInAt: ticket.checkedInAt,
  });
});

// GET /api/gate/logs/:eventId  (gatekeeper/organizer - recent activity feed)
const recentLogs = asyncHandler(async (req, res) => {
  const logs = await CheckInLog.find({ event: req.params.eventId })
    .populate("gatekeeper", "name")
    .populate({ path: "ticket", populate: { path: "user", select: "name" } })
    .sort({ createdAt: -1 })
    .limit(25);
  res.json({ logs });
});

module.exports = { validatePass, recentLogs };

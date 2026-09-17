const QRCode = require("qrcode");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const asyncHandler = require("../utils/asyncHandler");
const { signPass } = require("../utils/jwtPassEngine");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------------------------------------------
// POST /api/passes/book
// Attendee only
// Body: { eventId, tierName }
// ---------------------------------------------------------
const bookTicket = asyncHandler(async (req, res) => {
  const { eventId, tierName } = req.body;

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error("Event not found.");
  }

  const tier = event.tiers.find((t) => t.name === tierName);

  if (!tier) {
    res.status(400);
    throw new Error("That ticket tier does not exist for this event.");
  }

  if (tier.booked >= tier.quota) {
    res.status(409);
    throw new Error("This ticket tier is sold out.");
  }

  // One ticket per person per event. CANCELLED tickets don't count, so a
  // cancelled booking can be re-booked; VALID/CHECKED_IN do, so someone
  // can't hold two active tickets to the same event (across any tier).
  const existingActiveTicket = await Ticket.findOne({
    event: event._id,
    user: req.user._id,
    status: { $ne: "CANCELLED" },
  });
  if (existingActiveTicket) {
    res.status(409);
    throw new Error("You already have a ticket for this event.");
  }

  const amount = Number(tier.price || 0);

  // -------------------------------------------------------
  // FREE TICKET
  // -------------------------------------------------------
  if (amount === 0) {
    const ticket = await Ticket.create({
      event: event._id,
      user: req.user._id,
      tierName: tier.name,
      amount: 0,
      paymentStatus: "PAID",
      razorpayOrderId: null,
      razorpayPaymentId: null,
      nonce: "pending",
    });

    const { token, nonce } = signPass({
      ticketId: ticket._id.toString(),
      eventId: event._id.toString(),
      userId: req.user._id.toString(),
    });

    ticket.nonce = nonce;
    await ticket.save();

    tier.booked += 1;
    await event.save();

    const qrDataUrl = await QRCode.toDataURL(token);

    return res.status(201).json({
      paymentRequired: false,
      ticket,
      qrDataUrl,
    });
  }

  // -------------------------------------------------------
  // PAID TICKET
  // Create Razorpay order.
  // Ticket is NOT created yet.
  // -------------------------------------------------------

  const options = {
    amount: Math.round(amount * 100), // Razorpay uses paise
    currency: "INR",
    receipt: `cp_${Date.now()}`,
    notes: {
      eventId: event._id.toString(),
      tierName: tier.name,
      userId: req.user._id.toString(),
    },
  };

  const order = await razorpay.orders.create(options);

  res.status(201).json({
    paymentRequired: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// ---------------------------------------------------------
// POST /api/passes/verify-payment
// Attendee only
//
// Body:
// {
//   razorpay_order_id,
//   razorpay_payment_id,
//   razorpay_signature,
//   eventId,
//   tierName
// }
// ---------------------------------------------------------
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    eventId,
    tierName,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !eventId ||
    !tierName
  ) {
    res.status(400);
    throw new Error("Missing payment verification details.");
  }

  // -------------------------------------------------------
  // Verify Razorpay signature
  // -------------------------------------------------------

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed.");
  }

  // -------------------------------------------------------
  // Get event + tier again from database
  // NEVER trust the frontend price
  // -------------------------------------------------------

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error("Event not found.");
  }

  const tier = event.tiers.find((t) => t.name === tierName);

  if (!tier) {
    res.status(400);
    throw new Error("That ticket tier does not exist.");
  }

  if (tier.booked >= tier.quota) {
    res.status(409);
    throw new Error("This ticket tier is now sold out.");
  }

  // -------------------------------------------------------
  // Prevent duplicate payment verification
  // -------------------------------------------------------

  const existingTicket = await Ticket.findOne({
    razorpayPaymentId: razorpay_payment_id,
  });

  if (existingTicket) {
    const { token } = signPass({
      ticketId: existingTicket._id.toString(),
      eventId: existingTicket.event.toString(),
      userId: existingTicket.user.toString(),
    });

    const qrDataUrl = await QRCode.toDataURL(token);

    return res.status(200).json({
      message: "Payment already processed.",
      ticket: existingTicket,
      qrDataUrl,
    });
  }

  // One ticket per person per event - re-checked here too, since this is
  // the point where the ticket actually gets created. Without this, two
  // browser tabs paying for the same event at once could both succeed.
  const existingActiveTicket = await Ticket.findOne({
    event: event._id,
    user: req.user._id,
    status: { $ne: "CANCELLED" },
  });
  if (existingActiveTicket) {
    res.status(409);
    throw new Error(
      "You already have a ticket for this event. Contact support with your payment ID for a refund."
    );
  }

  // -------------------------------------------------------
  // Create ticket AFTER successful payment verification
  // -------------------------------------------------------

  const ticket = await Ticket.create({
    event: event._id,
    user: req.user._id,
    tierName: tier.name,
    amount: Number(tier.price),
    paymentStatus: "PAID",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    nonce: "pending",
  });

  // -------------------------------------------------------
  // Generate signed QR
  // -------------------------------------------------------

  const { token, nonce } = signPass({
    ticketId: ticket._id.toString(),
    eventId: event._id.toString(),
    userId: req.user._id.toString(),
  });

  ticket.nonce = nonce;
  await ticket.save();

  // -------------------------------------------------------
  // Increase booked count
  // -------------------------------------------------------

  tier.booked += 1;
  await event.save();

  // -------------------------------------------------------
  // Generate QR image
  // -------------------------------------------------------

  const qrDataUrl = await QRCode.toDataURL(token);

  res.status(201).json({
    message: "Payment successful. Ticket created.",
    ticket,
    qrDataUrl,
  });
});

// ---------------------------------------------------------
// GET /api/passes/mine
// Attendee only
// ---------------------------------------------------------
const myTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate("event", "title venue startsAt bannerUrl")
    .sort({ createdAt: -1 });

  res.json({ tickets });
});

// ---------------------------------------------------------
// GET /api/passes/:id/qr
// Attendee only
// Regenerate QR for an existing ticket
// ---------------------------------------------------------
const getTicketQr = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket || String(ticket.user) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Ticket not found.");
  }

  const { token } = signPass({
    ticketId: ticket._id.toString(),
    eventId: ticket.event.toString(),
    userId: ticket.user.toString(),
  });

  const qrDataUrl = await QRCode.toDataURL(token);

  res.json({ qrDataUrl });
});

module.exports = {
  bookTicket,
  verifyPayment,
  myTickets,
  getTicketQr,
};
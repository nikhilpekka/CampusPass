const express = require("express");

const {
    bookTicket,
    verifyPayment,
    myTickets,
    getTicketQr,
} = require("../controllers/passController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create free ticket OR create Razorpay order for paid ticket
router.post(
    "/book",
    protect,
    authorize("ATTENDEE"),
    bookTicket
);

// Verify Razorpay payment and create the ticket
router.post(
    "/verify-payment",
    protect,
    authorize("ATTENDEE"),
    verifyPayment
);

// Get attendee's tickets
router.get(
    "/mine",
    protect,
    authorize("ATTENDEE"),
    myTickets
);

// Regenerate QR for an existing ticket
router.get(
    "/:id/qr",
    protect,
    authorize("ATTENDEE"),
    getTicketQr
);

module.exports = router;
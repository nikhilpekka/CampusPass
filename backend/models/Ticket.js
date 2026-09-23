const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tierName: {
      type: String,
      required: true,
    },

    // Ticket price in rupees
    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PAID",
    },

    // Razorpay payment details
    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["VALID", "CHECKED_IN", "CANCELLED"],
      default: "VALID",
    },

    // Random per-ticket value embedded in the signed QR payload
    nonce: {
      type: String,
      required: true,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },

    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
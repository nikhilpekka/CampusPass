const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/events  (public - attendees browse events)
const listEvents = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const events = await Event.find(filter).sort({ startsAt: 1 });
  res.json({ events });
});

// GET /api/events/:id
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate("organizer", "name email");
  if (!event) {
    res.status(404);
    throw new Error("Event not found.");
  }
  res.json({ event });
});

// POST /api/events  (organizer only)
const createEvent = asyncHandler(async (req, res) => {
  const { title, category, description, venue, startsAt, bannerUrl, tiers } = req.body;

  if (!title || !venue || !startsAt || !Array.isArray(tiers) || tiers.length === 0) {
    res.status(400);
    throw new Error("Title, venue, start date and at least one ticket tier are required.");
  }

  const event = await Event.create({
    title,
    category,
    description,
    venue,
    startsAt,
    bannerUrl,
    tiers: tiers.map((t) => ({ name: t.name, price: t.price || 0, quota: t.quota || 0, booked: 0 })),
    organizer: req.user._id,
  });

  res.status(201).json({ event });
});

// GET /api/events/organizer/mine  (organizer only)
const myEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort({ startsAt: 1 });
  res.json({ events });
});

// GET /api/events/:id/stats  (organizer only - powers the analytics dashboard)
const eventStats = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found.");
  }
  if (String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only view stats for your own events.");
  }

  const tickets = await Ticket.find({ event: event._id });
  const totalRegistered = tickets.filter((t) => t.status !== "CANCELLED").length;
  const checkedIn = tickets.filter((t) => t.status === "CHECKED_IN").length;
  const revenue = tickets
    .filter((t) => t.paymentStatus === "PAID")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Per-tier sales, straight from the event doc's own quota/booked counters
  const tierSales = event.tiers.map((t) => ({
    name: t.name,
    price: t.price,
    quota: t.quota,
    booked: t.booked,
  }));

  // Check-ins bucketed into 15-minute intervals, for the velocity chart
  const buckets = {};
  tickets
    .filter((t) => t.checkedInAt)
    .forEach((t) => {
      const d = new Date(t.checkedInAt);
      d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0);
      const key = d.toISOString();
      buckets[key] = (buckets[key] || 0) + 1;
    });

  const velocity = Object.entries(buckets)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  res.json({
    totalRegistered,
    checkedIn,
    checkInRate: totalRegistered ? Math.round((checkedIn / totalRegistered) * 100) : 0,
    revenue,
    tierSales,
    velocity,
  });
});

module.exports = { listEvents, getEvent, createEvent, myEvents, eventStats };

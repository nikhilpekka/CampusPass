const express = require("express");
const {
  listEvents,
  getEvent,
  createEvent,
  myEvents,
  eventStats,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listEvents);
router.get("/organizer/mine", protect, authorize("ORGANIZER"), myEvents);
router.get("/:id", getEvent);
router.get("/:id/stats", protect, authorize("ORGANIZER"), eventStats);
router.post("/", protect, authorize("ORGANIZER"), createEvent);

module.exports = router;

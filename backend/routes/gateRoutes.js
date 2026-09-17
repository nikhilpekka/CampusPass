const express = require("express");
const { validatePass, recentLogs } = require("../controllers/gateController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/validate", protect, authorize("GATEKEEPER"), validatePass);
router.get("/logs/:eventId", protect, authorize("GATEKEEPER", "ORGANIZER"), recentLogs);

module.exports = router;

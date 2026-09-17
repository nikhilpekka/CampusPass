require("dotenv").config({
  path: require("path").join(__dirname, ".env")
});
console.log("Mongo URI loaded:", !!process.env.MONGODB_URI); //temporary
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const passRoutes = require("./routes/passRoutes");
const gateRoutes = require("./routes/gateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "CampusPass API",
    status: "online",
    healthCheck: "/api/health",
    frontendUrl: "http://localhost:5173"
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/gate", gateRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`CampusPass API running on http://localhost:${PORT}`));
});

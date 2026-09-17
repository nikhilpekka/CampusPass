# CampusPass

**Event Ticketing & Gate Validation Engine**

CampusPass is a campus event ticketing system built for real-world gate operations, not just checkout flows. Organizers publish events, attendees book cryptographically signed QR passes, and gatekeepers scan them at the door with an atomic, race-proof single-use check-in — so two scanners at two gates can never both admit the same pass.

---

## Highlights

- 🎟️ **Signed QR passes** — every ticket is a JWT embedding the ticket, event, and user IDs plus a random nonce, rendered as a scannable QR code
- 🚪 **Race-safe check-in** — gate validation uses an atomic database update that flips a pass from `VALID` to `CHECKED_IN` exactly once, closing the window where simultaneous scans could double-admit someone
- 📊 **Live check-in analytics** — organizer dashboard buckets check-ins into 15-minute windows to visualize entry velocity in real time
- 🔐 **Gated role registration** — public sign-up only creates Attendee accounts; Organizer and Gatekeeper roles require a server-validated access code, never a client-trusted role field
- 📷 **Camera or manual scanning** — gatekeepers can scan with a live camera feed or paste pass text manually

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 (Vite), React Router, hand-written CSS design system (glassmorphism), `html5-qrcode` |
| Backend    | Node.js, Express, JWT, `qrcode` |
| Database   | MongoDB (Mongoose) |

---

## Project Structure

```
CampusPass/
├── backend/   # API + database models
└── frontend/  # React app (Vite)
```

---

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set MONGODB_URI to your local or Atlas connection string,
# and change JWT_SECRET / PASS_SECRET to your own random strings
npm run seed   # creates demo accounts + one demo event
npm run dev    # starts the API on http://localhost:5000
```

Also set `ORGANIZER_ACCESS_CODE` and `GATEKEEPER_ACCESS_CODE` in `.env` — these gate who can register as those roles (see [Roles & Access](#roles--access)).

**Demo accounts** created by `npm run seed` (password for all: `Password123!`):

| Role       | Email                   |
|------------|--------------------------|
| Organizer  | organizer@campus.edu    |
| Gatekeeper | gatekeeper@campus.edu   |
| Attendee   | attendee@campus.edu     |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so run both `npm run dev` commands side by side.

> **Note:** MongoDB is required — there's no in-memory fallback. Point `MONGODB_URI` at a local `mongod` instance or a free MongoDB Atlas cluster.

---

## How It Works

**Booking**
`POST /api/passes/book` creates a ticket, signs a JWT (`utils/jwtPassEngine.js`) containing the ticket/event/user IDs plus a random nonce, and returns it as a QR code data URL.

**Scanning**
The gatekeeper's camera (or manual paste) reads the QR text and sends it to `POST /api/gate/validate`. The server verifies the signature, then performs an atomic `findOneAndUpdate` that only flips `VALID → CHECKED_IN` once — closing the race window if two gatekeepers scan the same pass at the same moment.

**Analytics**
`GET /api/events/:id/stats` buckets check-in timestamps into 15-minute windows for the organizer dashboard's velocity chart.

---

## Roles & Access

Public sign-up only ever creates **Attendee** accounts. To register as an Organizer or Gatekeeper, use the "Have an organizer or gatekeeper access code?" link on the register page and enter the matching code from the backend's `.env`. The server re-validates the code itself and silently falls back to Attendee if it's missing or wrong — the role in the request body is never trusted on its own.

---

## Roadmap

- ✉️ Email dispatch with PDF ticket attachments (Nodemailer)
- 🔴 Live push updates via Socket.io

These were left out to keep this a focused, manageable project — the wallet page already polls the API for ticket state, and the core booking/QR flow is fully wired up. Both are natural next additions.

---
## License

This project was developed as an academic project.

# CampusPass — Event Ticketing & Gate Validation Engine

A MERN mini project for campus event ticketing: organizers publish events,
attendees book cryptographically signed QR passes, and gatekeepers scan them
at the door with an atomic single-use check-in.

## Stack

- **Frontend:** React 18 (Vite), React Router, hand-written CSS design system
  (glassmorphism, no UI framework), `html5-qrcode` for the camera scanner
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, `qrcode`

## Project structure

```
CampusPass/
├── backend/   # Express API + MongoDB models
└── frontend/  # React app (Vite)
```

## Setup

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

Demo accounts created by `npm run seed` (password for all: `Password123!`):

| Role       | Email                  |
|------------|-------------------------|
| Organizer  | organizer@campus.edu   |
| Gatekeeper | gatekeeper@campus.edu  |
| Attendee   | attendee@campus.edu    |

Also set `ORGANIZER_ACCESS_CODE` and `GATEKEEPER_ACCESS_CODE` in `.env` —
these gate who can register as those roles (see "Roles & access" below).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so
just run both `npm run dev` commands side by side.

## How the pieces fit together

- **Booking:** `POST /api/passes/book` creates a `Ticket`, signs a JWT
  (`utils/jwtPassEngine.js`) containing the ticket/event/user IDs plus a
  random nonce, and returns it as a QR code data URL.
- **Scanning:** the gatekeeper's camera (or manual paste) reads the QR text
  and sends it to `POST /api/gate/validate`. The server verifies the
  signature, then does an atomic `findOneAndUpdate` that only flips
  `VALID -> CHECKED_IN` once — closing the race window if two gatekeepers
  scan the same pass at the same moment.
- **Analytics:** `GET /api/events/:id/stats` buckets check-in timestamps
  into 15-minute windows for the organizer dashboard's velocity chart.

## Roles & access

Public sign-up only ever creates **Attendee** accounts. To register as an
Organizer or Gatekeeper, use the "Have an organizer or gatekeeper access
code?" link on the register page and enter the matching code from the
backend's `.env`. The server re-validates the code itself and silently
falls back to Attendee if it's missing or wrong — the role in the request
body is never trusted on its own.

## Notes

- MongoDB is required — there's no in-memory fallback. Point `MONGODB_URI`
  at a local `mongod` or a free MongoDB Atlas cluster.
- Email dispatch (Nodemailer/PDF tickets) and Socket.io live push were left
  out of this pass to keep the project a manageable "mini project" scope —
  the wallet page already polls the API for ticket state, and the QR/booking
  core is fully wired up. Both are natural next additions if you want to
  extend it.

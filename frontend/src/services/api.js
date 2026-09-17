// Small fetch wrapper — no axios dependency needed for this project's scope.
// Every function returns parsed JSON and throws an Error with the server's
// message on failure, so callers can just try/catch.

const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://campuspass-backend-lg62.onrender.com/api" : "/api")
).replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("campuspass_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  // auth
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  me: () => request("/auth/me"),

  // events
  listEvents: (category) =>
    request(
      `/events${category ? `?category=${category}` : ""}`,
      { auth: false }
    ),

  getEvent: (id) =>
    request(`/events/${id}`, { auth: false }),

  myEvents: () =>
    request("/events/organizer/mine"),

  createEvent: (payload) =>
    request("/events", {
      method: "POST",
      body: payload,
    }),

  eventStats: (id) =>
    request(`/events/${id}/stats`),

  // passes
  bookTicket: (payload) =>
    request("/passes/book", {
      method: "POST",
      body: payload,
    }),

  // NEW: Razorpay payment verification
  verifyPayment: (payload) =>
    request("/passes/verify-payment", {
      method: "POST",
      body: payload,
    }),

  myTickets: () =>
    request("/passes/mine"),

  getTicketQr: (id) =>
    request(`/passes/${id}/qr`),

  // gate
  validatePass: (token) =>
    request("/gate/validate", {
      method: "POST",
      body: { token },
    }),

  recentLogs: (eventId) =>
    request(`/gate/logs/${eventId}`),
};
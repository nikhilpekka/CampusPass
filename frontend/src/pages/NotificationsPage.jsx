import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Loader from "../components/common/Loader";

const STATUS_COPY = {
  VALID: (t) => `Ticket confirmed for ${t.event?.title} (${t.tierName}).`,
  CHECKED_IN: (t) => `Checked in at ${t.event?.title}.`,
  CANCELLED: (t) => `Ticket for ${t.event?.title} was cancelled.`,
};

const PAYMENT_COPY = {
  PENDING: (t) => `Payment pending for ${t.event?.title} — this ticket isn't confirmed yet.`,
  FAILED: (t) => `Payment failed for ${t.event?.title}. Try booking again, or contact support.`,
};

// There's no persisted notifications backend yet, so for Attendees this
// derives a simple activity feed from their own tickets (booking,
// check-in, payment issues). Organizers/Gatekeepers don't have a
// per-user data source to build this from without a real notifications
// API, so they get a lightweight pointer to where their activity lives.
export default function NotificationsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "ATTENDEE") return;
    api.myTickets().then((data) => setTickets(data.tickets)).catch((err) => setError(err.message));
  }, [user]);

  if (user?.role !== "ATTENDEE") {
    return (
      <div className="content-max">
        <div className="page-header">
          <h1>Notifications</h1>
        </div>
        <div className="glass-card empty-state">
          {user?.role === "ORGANIZER"
            ? "Check-in and booking activity for your events shows up live on your Dashboard."
            : "Scan results appear on the Gate scanner page as they happen."}
        </div>
      </div>
    );
  }

  const items = (tickets || [])
    .map((t) => {
      const paymentNote = PAYMENT_COPY[t.paymentStatus]?.(t);
      const statusNote = STATUS_COPY[t.status]?.(t);
      return {
        id: t._id,
        text: paymentNote || statusNote,
        time: t.updatedAt || t.createdAt,
      };
    })
    .filter((n) => n.text)
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="content-max">
      <div className="page-header">
        <h1>Notifications</h1>
      </div>

      {error && <div className="form-error">{error}</div>}
      {!tickets && !error && <Loader label="Loading notifications…" />}
      {tickets && items.length === 0 && <div className="empty-state">Nothing yet — book an event to get started.</div>}

      <div className="stack">
        {items.map((n) => (
          <div key={n.id} className="glass-card row-between">
            <span>{n.text}</span>
            <span className="text-sm text-muted">{new Date(n.time).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

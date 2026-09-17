import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AnalyticsPanel from "../components/organizer/AnalyticsPanel";
import Loader from "../components/common/Loader";

function EventListItem({ event, isSelected, onSelect }) {
  const date = new Date(event.startsAt);
  const capacity = event.tiers.reduce((sum, t) => sum + t.quota, 0);
  const booked = event.tiers.reduce((sum, t) => sum + t.booked, 0);

  return (
    <button
      className="glass-card glass-card--interactive"
      style={{
        textAlign: "left",
        width: "100%",
        borderColor: isSelected ? "var(--accent)" : undefined,
        cursor: "pointer",
      }}
      onClick={onSelect}
    >
      <div className="row-between" style={{ marginBottom: 6 }}>
        <strong>{event.title}</strong>
        <span className="badge badge-neutral">{event.category}</span>
      </div>
      <p className="text-sm">
        {event.venue} · {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
      </p>
      <p className="text-sm text-muted" style={{ marginTop: 4 }}>
        {booked}/{capacity} seats booked
      </p>
    </button>
  );
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myEvents()
      .then((data) => {
        setEvents(data.events);
        if (data.events[0]) setSelectedId(data.events[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setStats(null);
    api.eventStats(selectedId).then(setStats).catch((err) => setError(err.message));
  }, [selectedId]);

  const selectedEvent = events?.find((e) => e._id === selectedId);

  if (!events && !error) return <Loader label="Loading your events…" />;

  return (
    <div className="content-max">
      <div className="page-header">
        <h1>Organizer dashboard</h1>
        <Link to="/organizer/new" className="btn btn-primary">+ Create event</Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {events && events.length === 0 && (
        <div className="empty-state">You haven't created any events yet — click "Create event" to publish your first one.</div>
      )}

      {events && events.length > 0 && (
        <div className="organizer-layout">
          <div className="stack">
            <h4 className="text-sm text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Your events
            </h4>
            {events.map((e) => (
              <EventListItem key={e._id} event={e} isSelected={selectedId === e._id} onSelect={() => setSelectedId(e._id)} />
            ))}
          </div>

          <div>
            {selectedEvent && <h3 style={{ marginBottom: 16 }}>{selectedEvent.title}</h3>}
            {stats ? <AnalyticsPanel stats={stats} /> : <Loader label="Loading stats…" />}
          </div>
        </div>
      )}
    </div>
  );
}

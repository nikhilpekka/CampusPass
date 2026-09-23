import { Link } from "react-router-dom";

const CATEGORY_LABEL = {
  TECH: "Tech",
  CULTURAL: "Cultural",
  SPORTS: "Sports",
  WORKSHOP: "Workshop",
};

export default function EventCard({ event }) {
  const date = new Date(event.startsAt);
  const capacity = event.tiers.reduce((sum, t) => sum + t.quota, 0);
  const booked = event.tiers.reduce((sum, t) => sum + t.booked, 0);

  return (
    <Link to={`/events/${event._id}`} className="glass-card glass-card--interactive stack">
      <div className="row-between">
        <span className="badge badge-neutral">{CATEGORY_LABEL[event.category] || event.category}</span>
        <span className="text-sm text-muted">
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
      <h3 style={{ fontSize: 18 }}>{event.title}</h3>
      <p className="text-sm">{event.venue}</p>
      <div className="text-sm text-muted">
        {booked}/{capacity} seats booked
      </div>
    </Link>
  );
}

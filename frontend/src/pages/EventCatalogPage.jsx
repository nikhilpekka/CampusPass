import { useEffect, useState } from "react";
import { api } from "../services/api";
import EventCard from "../components/event/EventCard";
import Loader from "../components/common/Loader";

const CATEGORIES = ["ALL", "TECH", "CULTURAL", "SPORTS", "WORKSHOP"];

export default function EventCatalogPage() {
  const [events, setEvents] = useState(null);
  const [category, setCategory] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    setEvents(null);
    api
      .listEvents(category === "ALL" ? undefined : category)
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message));
  }, [category]);

  return (
    <div className="content-max">
      <div className="page-header">
        <h1>Browse events</h1>
        <div className="row" style={{ flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="btn btn-ghost"
              style={{
                padding: "7px 14px",
                fontSize: 13,
                borderColor: category === c ? "var(--accent)" : undefined,
              }}
            >
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {!events && !error && <Loader label="Loading events…" />}
      {events && events.length === 0 && <div className="empty-state">No events in this category yet.</div>}

      <div className="grid grid-cards">
        {events?.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}

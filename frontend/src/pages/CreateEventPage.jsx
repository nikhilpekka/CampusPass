import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const EMPTY_TIER = { name: "", price: 0, quota: 0 };

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "TECH",
    venue: "",
    startsAt: "",
    description: "",
  });
  const [tiers, setTiers] = useState([{ ...EMPTY_TIER, name: "General" }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function updateTier(index, field, value) {
    setTiers(tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTier() {
    setTiers([...tiers, { ...EMPTY_TIER }]);
  }

  function removeTier(index) {
    setTiers(tiers.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tiers: tiers.map((t) => ({ name: t.name, price: Number(t.price) || 0, quota: Number(t.quota) || 0 })),
      };
      const { event } = await api.createEvent(payload);
      navigate(`/events/${event._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-max" style={{ maxWidth: 620 }}>
      <div className="page-header">
        <h1>Create event</h1>
      </div>

      <form className="form glass-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" required value={form.title} onChange={update("title")} />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={update("category")}>
              <option value="TECH">Tech</option>
              <option value="CULTURAL">Cultural</option>
              <option value="SPORTS">Sports</option>
              <option value="WORKSHOP">Workshop</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="startsAt">Starts at</label>
            <input id="startsAt" type="datetime-local" required value={form.startsAt} onChange={update("startsAt")} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="venue">Venue</label>
          <input id="venue" required value={form.venue} onChange={update("venue")} />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} value={form.description} onChange={update("description")} />
        </div>

        <div className="field">
          <label>Ticket tiers</label>
          <div className="tier-list">
            {tiers.map((tier, i) => (
              <div key={i} className="tier-card">
                <div className="row-between" style={{ marginBottom: 12 }}>
                  <span className="text-sm text-muted">Tier {i + 1}</span>
                  {tiers.length > 1 && (
                    <button type="button" className="tier-remove" onClick={() => removeTier(i)} aria-label={`Remove tier ${i + 1}`}>
                      Remove
                    </button>
                  )}
                </div>
                <div className="field">
                  <label>Name</label>
                  <input required placeholder="e.g. General" value={tier.name} onChange={(e) => updateTier(i, "name", e.target.value)} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Price (₹)</label>
                    <input type="number" min={0} value={tier.price} onChange={(e) => updateTier(i, "price", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Quota</label>
                    <input type="number" min={1} required value={tier.quota} onChange={(e) => updateTier(i, "quota", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addTier}>
              + Add tier
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Publishing…" : "Publish event"}
        </button>
      </form>
    </div>
  );
}

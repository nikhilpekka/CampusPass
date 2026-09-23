import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HOME_BY_ROLE = { ATTENDEE: "/events", ORGANIZER: "/organizer", GATEKEEPER: "/scan" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  // Everyone signs up as an Attendee by default. Organizer/Gatekeeper are
  // not publicly selectable - they only appear once someone opts into the
  // access-code panel below, and the server re-checks the code regardless.
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "" });
  const [wantsElevatedRole, setWantsElevatedRole] = useState(false);
  const [elevatedRole, setElevatedRole] = useState("ORGANIZER");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = wantsElevatedRole
        ? { ...form, role: elevatedRole, accessCode }
        : { ...form, role: "ATTENDEE" };
      const user = await register(payload);
      navigate(HOME_BY_ROLE[user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-max" style={{ maxWidth: 460, padding: "64px 24px" }}>
      <div className="glass-card">
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Create your account</h1>
        <p className="text-sm" style={{ marginBottom: 24 }}>Sign up to browse and book campus events.</p>

        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={update("name")} />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={update("email")} />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" minLength={6} required value={form.password} onChange={update("password")} />
          </div>

          <div className="field">
            <label htmlFor="rollNumber">Roll number (optional)</label>
            <input id="rollNumber" value={form.rollNumber} onChange={update("rollNumber")} />
          </div>

          {!wantsElevatedRole ? (
            <button
              type="button"
              className="text-sm"
              style={{ background: "none", border: "none", color: "var(--verify)", cursor: "pointer", padding: 0, textAlign: "left" }}
              onClick={() => setWantsElevatedRole(true)}
            >
              Have an organizer or gatekeeper access code?
            </button>
          ) : (

            <div className="elevated-access"><div className="row-between" style={{ marginBottom: 12 }}>
              <strong className="text-sm">Organizer / gatekeeper access</strong>
              <button
                type="button"
                className="text-sm"
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                onClick={() => setWantsElevatedRole(false)}
              >
                Cancel
              </button>
            </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="role">Role</label>
                  <select id="role" value={elevatedRole} onChange={(e) => setElevatedRole(e.target.value)}>
                    <option value="ORGANIZER">Organizer</option>
                    <option value="GATEKEEPER">Gatekeeper</option>
                  </select>
                </div>
                <div className="field access-code-field">
                  <label htmlFor="accessCode">Access code</label>
                  <input
                    id="accessCode"
                    name="campuspass-access-code"
                    type="text"
                    autoComplete="off"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter access code"
                  />
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm mt-24" style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login" className="link-highlight">Log in</Link>
        </p>
      </div>
    </div>
  );
}

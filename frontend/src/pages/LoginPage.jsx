import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HOME_BY_ROLE = { ATTENDEE: "/events", ORGANIZER: "/organizer", GATEKEEPER: "/scan" };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(HOME_BY_ROLE[user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-max" style={{ maxWidth: 420, padding: "64px 24px" }}>
      <div className="glass-card">
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Welcome back</h1>
        <p className="text-sm" style={{ marginBottom: 24 }}>Log in to manage your passes.</p>

        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm mt-24" style={{ marginTop: 20 }}>
          No account? <Link to="/register" className="link-highlight">Register</Link>
        </p>
      </div>
    </div>
  );
}

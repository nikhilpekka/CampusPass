import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="content-max" style={{ padding: "48px 24px" }}>
      <div className="hero">
        <div className="hero-gate" />
        <div className="hero-content">
          <div className="hero-eyebrow">Campus event ticketing</div>
          <h1>One pass, from booking to the gate.</h1>
          <p>
            CampusPass replaces paper tickets and Google Forms with signed, single-use QR passes —
            issued instantly, scanned in under a second, impossible to clone.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to={user.role === "ATTENDEE" ? "/events" : user.role === "ORGANIZER" ? "/organizer" : "/scan"} className="btn btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get started
                </Link>
                <Link to="/events" className="btn btn-ghost">
                  Browse events
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cards mt-24" style={{ marginTop: 40 }}>
        <div className="glass-card">
          <h3 style={{ fontSize: 17, marginBottom: 8 }}>Signed QR passes</h3>
          <p className="text-sm">Every pass is cryptographically signed, so a screenshot can't be forged or duplicated.</p>
        </div>
        <div className="glass-card">
          <h3 style={{ fontSize: 17, marginBottom: 8 }}>One scan, no re-entry</h3>
          <p className="text-sm">An atomic check-in lock stops the same pass being used twice, even at two gates at once.</p>
        </div>
        <div className="glass-card">
          <h3 style={{ fontSize: 17, marginBottom: 8 }}>Live gate analytics</h3>
          <p className="text-sm">Organizers watch check-ins land in real time, bucketed by 15-minute interval.</p>
        </div>
      </div>
    </div>
  );
}

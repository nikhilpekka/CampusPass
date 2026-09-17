import { useAuth } from "../context/AuthContext";

const ROLE_LABEL = { ATTENDEE: "Attendee", ORGANIZER: "Organizer", GATEKEEPER: "Gatekeeper" };

// Read-only for now — editing name/email would need a PATCH /api/auth/me
// endpoint that doesn't exist yet on the backend. Kept intentionally
// simple rather than wiring up a form that silently does nothing.
export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="content-max" style={{ maxWidth: 520 }}>
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="glass-card stack">
        <div className="row-between">
          <span className="text-sm text-muted">Name</span>
          <strong>{user.name}</strong>
        </div>
        <div className="row-between">
          <span className="text-sm text-muted">Email</span>
          <span>{user.email}</span>
        </div>
        <div className="row-between">
          <span className="text-sm text-muted">Role</span>
          <span className="badge badge-neutral">{ROLE_LABEL[user.role] || user.role}</span>
        </div>
        {user.rollNumber && (
          <div className="row-between">
            <span className="text-sm text-muted">Roll number</span>
            <span>{user.rollNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}

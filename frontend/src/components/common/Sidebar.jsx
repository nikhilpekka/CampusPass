import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Each role sees a different set of primary links — kept as a simple
// lookup rather than scattering role checks through JSX. Notifications,
// Support and Profile are common to every signed-in role, so they're
// appended separately below instead of being repeated per role.
const LINKS_BY_ROLE = {
  ATTENDEE: [
    { to: "/events", label: "Browse events" },
    { to: "/wallet", label: "My tickets" },
  ],
  ORGANIZER: [
    { to: "/organizer", label: "Dashboard" },
    { to: "/organizer/new", label: "Create event" },
  ],
  GATEKEEPER: [{ to: "/scan", label: "Gate scanner" }],
};

const COMMON_LINKS = [
  { to: "/notifications", label: "Notifications" },
  { to: "/support", label: "Support" },
  { to: "/profile", label: "Profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // No sidebar at all for logged-out visitors (Landing/Login/Register) -
  // there's nothing role-specific to navigate to yet, and it was showing
  // as an empty bordered panel with nothing but the logo in it.
  if (!user) return null;

  // Normalize casing defensively - a role stored/edited outside the app's
  // own registration flow (direct DB edit, older data) could differ in
  // case from the "GATEKEEPER"/"ORGANIZER"/"ATTENDEE" keys below, which
  // would otherwise make the nav links silently disappear.
  const role = (user.role || "").toUpperCase();
  const links = [...(LINKS_BY_ROLE[role] || []), ...COMMON_LINKS];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        <span className="sidebar-brand-name">CampusPass</span>
      </Link>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer stack">
        <div className="sidebar-user-info">
          <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{user.name}</div>
          <div>{role.charAt(0) + role.slice(1).toLowerCase()}</div>
        </div>
        <button className="btn btn-ghost sidebar-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

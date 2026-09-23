import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Wrap a page element: redirects to /login if nobody is signed in,
 * or to "/" if the signed-in user's role isn't in `roles`.
 * <RoleGuard roles={["ORGANIZER"]}><CreateEventPage /></RoleGuard>
 */
export default function RoleGuard({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes((user.role || "").toUpperCase())) return <Navigate to="/" replace />;

  return children;
}

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "campuspass_token";
const USER_CACHE_KEY = "campuspass_user_cache";

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Seed state synchronously from whatever was cached last session, so
  // a page refresh renders the signed-in view immediately instead of
  // blocking on a network round trip first. This is what "login feels
  // slow" was actually about in practice - the login request itself is
  // a single fast call; it was every subsequent page load that stalled
  // on GET /api/auth/me before anything could render.
  const [user, setUser] = useState(() => readCachedUser());
  const [loading, setLoading] = useState(false);

  // Re-validate against the server in the background. If the cached
  // user is still correct, this is invisible. If not (role changed,
  // account gone, token expired), it corrects the UI shortly after -
  // still far better than blocking every load on this round trip.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      // No token but a stray cached user (e.g. localStorage edited by
      // hand) shouldn't render a signed-in view.
      localStorage.removeItem(USER_CACHE_KEY);
      setUser(null);
      setLoading(false);
      return;
    }
    // Only show a loading state if we had no cached user to render yet
    // (first-ever login on this device, or cache was cleared).
    if (!readCachedUser()) setLoading(true);

    api
      .me()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_CACHE_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleAuthResponse({ user, token }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    handleAuthResponse(data);
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    handleAuthResponse(data);
    return data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

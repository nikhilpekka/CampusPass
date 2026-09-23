import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import RoleGuard from "./components/common/RoleGuard";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventCatalogPage from "./pages/EventCatalogPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import WalletPage from "./pages/WalletPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import GatekeeperScannerPage from "./pages/GatekeeperScannerPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import SupportPage from "./pages/SupportPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/events" element={<EventCatalogPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />

          <Route
            path="/wallet"
            element={
              <RoleGuard roles={["ATTENDEE"]}>
                <WalletPage />
              </RoleGuard>
            }
          />

          <Route
            path="/organizer"
            element={
              <RoleGuard roles={["ORGANIZER"]}>
                <OrganizerDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/organizer/new"
            element={
              <RoleGuard roles={["ORGANIZER"]}>
                <CreateEventPage />
              </RoleGuard>
            }
          />

          <Route
            path="/scan"
            element={
              <RoleGuard roles={["GATEKEEPER"]}>
                <GatekeeperScannerPage />
              </RoleGuard>
            }
          />

          {/* Common to every signed-in role - RoleGuard with no `roles` just requires auth */}
          <Route path="/profile" element={<RoleGuard><ProfilePage /></RoleGuard>} />
          <Route path="/notifications" element={<RoleGuard><NotificationsPage /></RoleGuard>} />
          <Route path="/support" element={<RoleGuard><SupportPage /></RoleGuard>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

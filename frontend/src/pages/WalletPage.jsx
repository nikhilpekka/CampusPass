import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import PassCard from "../components/pass/PassCard";
import Loader from "../components/common/Loader";

export default function WalletPage() {
  const [tickets, setTickets] = useState(null);
  const [qrByTicket, setQrByTicket] = useState({});
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { tickets } = await api.myTickets();
      setTickets(tickets);
      // Only VALID tickets need a QR - once a ticket is checked in or
      // cancelled it no longer functions as an entry pass, so no QR is
      // fetched or shown for it.
      const entries = await Promise.all(
        tickets
          .filter((t) => t.status === "VALID")
          .map(async (t) => [t._id, (await api.getTicketQr(t._id)).qrDataUrl])
      );
      setQrByTicket(Object.fromEntries(entries));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <div className="content-max">
      <div className="page-header">
        <h1>My wallet</h1>
        <button className="btn btn-ghost" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {!tickets && !error && <Loader label="Loading your passes…" />}
      {tickets && tickets.length === 0 && (
        <div className="empty-state">No passes yet — book an event to see it here.</div>
      )}

      <div className="grid grid-cards">
        {tickets?.map((ticket) => (
          <PassCard key={ticket._id} ticket={ticket} qrDataUrl={qrByTicket[ticket._id]} />
        ))}
      </div>
    </div>
  );
}

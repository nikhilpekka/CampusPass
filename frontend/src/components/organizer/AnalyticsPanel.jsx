function StatTile({ label, value }) {
  return (
    <div className="glass-card">
      <div className="text-sm text-muted">{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 6 }}>{value}</div>
    </div>
  );
}

// Lightweight bar chart built from divs — keeps the project dependency-free
// for something this simple, and it's easy to restyle.
function VelocityChart({ velocity }) {
  if (!velocity.length) {
    return <div className="empty-state">No check-ins yet — scans will appear here in real time.</div>;
  }
  const max = Math.max(...velocity.map((v) => v.count));

  return (
    <div className="row" style={{ alignItems: "flex-end", gap: 8, height: 140 }}>
      {velocity.map((v) => (
        <div key={v.time} style={{ flex: 1, textAlign: "center" }}>
          <div
            title={`${v.count} check-ins`}
            style={{
              height: `${Math.max((v.count / max) * 100, 6)}%`,
              background: "linear-gradient(180deg, var(--verify), var(--accent))",
              borderRadius: "6px 6px 2px 2px",
            }}
          />
          <div className="text-sm text-muted" style={{ marginTop: 6, fontSize: 11 }}>
            {new Date(v.time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TierSalesTable({ tierSales }) {
  return (
    <div className="glass-card">
      <h4 style={{ marginBottom: 14 }}>Tier sales</h4>
      <div className="stack">
        {tierSales.map((t) => (
          <div key={t.name} className="row-between text-sm" style={{ padding: "6px 0", borderBottom: "1px solid var(--card-border)" }}>
            <span>{t.name}</span>
            <span className="text-muted">{t.price > 0 ? `₹${t.price}` : "Free"}</span>
            <span>{t.booked}/{t.quota} sold</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPanel({ stats }) {
  return (
    <div className="stack">
      <div className="grid grid-cards">
        <StatTile label="Registered" value={stats.totalRegistered} />
        <StatTile label="Checked in" value={stats.checkedIn} />
        <StatTile label="Check-in rate" value={`${stats.checkInRate}%`} />
        <StatTile label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} />
      </div>
      {stats.tierSales?.length > 0 && <TierSalesTable tierSales={stats.tierSales} />}
      <div className="glass-card">
        <h4 style={{ marginBottom: 16 }}>Check-in velocity (15-min intervals)</h4>
        <VelocityChart velocity={stats.velocity} />
      </div>
    </div>
  );
}

const RESULT_COPY = {
  VALID: { variant: "valid", title: "Pass valid — entry granted" },
  ALREADY_USED: { variant: "used", title: "Already checked in" },
  CANCELLED: { variant: "invalid", title: "Ticket cancelled" },
  INVALID: { variant: "invalid", title: "Invalid pass" },
};

export default function ScanResultCard({ result }) {
  if (!result) {
    return (
      <div className="glass-card empty-state">Scan a pass to see the result here.</div>
    );
  }

  const copy = RESULT_COPY[result.result] || RESULT_COPY.INVALID;

  return (
    <div className={`scan-result scan-result--${copy.variant}`}>
      <h3 style={{ fontSize: 20, marginBottom: 10 }}>{copy.title}</h3>
      {result.attendee && (
        <p style={{ color: "var(--text-primary)" }}>
          {result.attendee.name}
          {result.attendee.rollNumber ? ` · ${result.attendee.rollNumber}` : ""}
          {result.attendee.tier ? ` · ${result.attendee.tier}` : ""}
        </p>
      )}
      {result.event && <p className="text-sm">{result.event}</p>}
      {result.checkedInAt && (
        <p className="text-sm">Originally scanned at {new Date(result.checkedInAt).toLocaleTimeString()}</p>
      )}
      {result.message && <p className="text-sm">{result.message}</p>}
    </div>
  );
}

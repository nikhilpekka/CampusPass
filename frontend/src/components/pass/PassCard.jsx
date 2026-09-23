import { useState } from "react";

const STATUS_BADGE = {
  VALID: { className: "badge-success", label: "Active" },
  CHECKED_IN: { className: "badge-neutral", label: "Checked in" },
  CANCELLED: { className: "badge-danger", label: "Cancelled" },
};

const PAYMENT_BADGE = {
  PENDING: { className: "badge-neutral", label: "Payment pending" },
  FAILED: { className: "badge-danger", label: "Payment failed" },
  // PAID is the normal case and isn't called out separately - the
  // ticket status badge above already covers "this pass is good".
};

export default function PassCard({ ticket, qrDataUrl }) {
  const [fullScreen, setFullScreen] = useState(false);
  const status = STATUS_BADGE[ticket.status] || STATUS_BADGE.VALID;
  const paymentBadge = PAYMENT_BADGE[ticket.paymentStatus];

  return (
    <>
      <div className="glass-card pass-card">
        {qrDataUrl && (
          <button
            type="button"
            onClick={() => setFullScreen(true)}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            aria-label="View QR full screen"
          >
            <img src={qrDataUrl} alt="Ticket QR code" />
          </button>
        )}
        <div className="pass-card-meta">
          <strong>{ticket.event?.title}</strong>
          <span className="text-sm text-muted">{ticket.event?.venue}</span>
          <span className="text-sm text-muted">
            {ticket.tierName} tier{ticket.amount > 0 ? ` · ₹${ticket.amount}` : " · Free"}
          </span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className={`badge ${status.className}`}>{status.label}</span>
          {paymentBadge && <span className={`badge ${paymentBadge.className}`}>{paymentBadge.label}</span>}
        </div>
      </div>

      {fullScreen && qrDataUrl && (
        <div className="qr-overlay" onClick={() => setFullScreen(false)}>
          <img src={qrDataUrl} alt="Ticket QR code, full screen" />
          <span className="qr-overlay-hint">Tap anywhere to close</span>
        </div>
      )}
    </>
  );
}

const FAQS = [
  {
    q: "My payment failed or was cancelled — was I charged?",
    a: "No. A ticket is only created after Razorpay confirms the payment and our backend verifies its signature. If the payment failed or you closed the checkout window, no ticket was created and any amount deducted is auto-reversed by Razorpay within a few business days.",
  },
  {
    q: "I paid, but I don't see my ticket.",
    a: "Refresh My Tickets first — it can take a few seconds after checkout. If it's still missing, contact support below with your payment ID from the Razorpay confirmation email or SMS.",
  },
  {
    q: "My QR pass won't scan at the gate.",
    a: "Try full-screen mode on the ticket (tap the QR in My Tickets) and raise your screen brightness. If it still fails, the gatekeeper can check you in manually with the pass ID.",
  },
  {
    q: "Can I get a refund or transfer my ticket?",
    a: "Reach out to the event's organizer directly, or use the contact option below and we'll route it to them.",
  },
];

export default function SupportPage() {
  return (
    <div className="content-max" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <h1>Help & support</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Need to reach us?</h3>
        <p className="text-sm" style={{ marginBottom: 14 }}>
          For payment issues, ticket problems, or anything else — email us and include your registered
          email and, if it's a payment issue, the payment ID from Razorpay.
        </p>
        <a href="mailto:support@campuspass.app" className="btn btn-primary">
          Email support@campuspass.app
        </a>
      </div>

      <div className="stack">
        {FAQS.map((item) => (
          <div key={item.q} className="glass-card">
            <strong>{item.q}</strong>
            <p className="text-sm" style={{ marginTop: 8 }}>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

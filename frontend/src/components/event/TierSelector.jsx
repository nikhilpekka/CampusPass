export default function TierSelector({ tiers, selected, onSelect }) {
  return (
    <div className="stack">
      {tiers.map((tier) => {
        const soldOut = tier.booked >= tier.quota;
        const isSelected = selected === tier.name;
        return (
          <button
            key={tier.name}
            disabled={soldOut}
            onClick={() => onSelect(tier.name)}
            className="glass-card"
            style={{
              textAlign: "left",
              cursor: soldOut ? "not-allowed" : "pointer",
              borderColor: isSelected ? "var(--accent)" : undefined,
              opacity: soldOut ? 0.5 : 1,
              padding: 16,
            }}
          >
            <div className="row-between">
              <strong>{tier.name}</strong>
              <span>{tier.price > 0 ? `₹${tier.price}` : "Free"}</span>
            </div>
            <div className="text-sm text-muted mt-24" style={{ marginTop: 6 }}>
              {soldOut ? "Sold out" : `${tier.quota - tier.booked} seats left`}
            </div>
          </button>
        );
      })}
    </div>
  );
}

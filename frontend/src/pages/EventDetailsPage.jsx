import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TierSelector from "../components/event/TierSelector";
import PassCard from "../components/pass/PassCard";
import Loader from "../components/common/Loader";

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tier, setTier] = useState(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    api
      .getEvent(id)
      .then((data) => setEvent(data.event))
      .catch((err) => setError(err.message));
  }, [id]);

  // Load Razorpay Checkout script
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      // Already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function handleBook() {
    if (!user) {
      return navigate("/login");
    }

    if (!tier) {
      return;
    }

    setBooking(true);
    setError("");

    try {
      // ---------------------------------------------------
      // Step 1:
      // Ask backend to book the ticket / create Razorpay order
      // ---------------------------------------------------

      const data = await api.bookTicket({
        eventId: id,
        tierName: tier,
      });

      // ---------------------------------------------------
      // FREE TICKET
      // Backend has already created the ticket + QR
      // ---------------------------------------------------

      if (!data.paymentRequired) {
        setBooked(data);
        return;
      }

      // ---------------------------------------------------
      // PAID TICKET
      // Load Razorpay Checkout
      // ---------------------------------------------------

      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Check your internet connection."
        );
      }

      // ---------------------------------------------------
      // Razorpay Checkout configuration
      // ---------------------------------------------------

      const options = {
        key: data.keyId,

        amount: data.amount,
        currency: data.currency,

        name: "CampusPass",
        description: `${event.title} - ${tier}`,

        order_id: data.orderId,

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        theme: {
          color: "#3399cc",
        },

        // -------------------------------------------------
        // Payment successful
        // -------------------------------------------------

        handler: async function (response) {
          try {
            setError("");

            // Verify payment on our backend
            const verified = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: id,
              tierName: tier,
            });

            // Payment verified + ticket created + QR generated
            setBooked(verified);
          } catch (err) {
            setError(
              err.message || "Payment was successful, but ticket verification failed."
            );
          } finally {
            setBooking(false);
          }
        },

        // -------------------------------------------------
        // User closes Razorpay without paying
        // -------------------------------------------------

        modal: {
          ondismiss: function () {
            setBooking(false);
            setError("Payment was cancelled.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      // Handle Razorpay checkout errors
      razorpay.on("payment.failed", function (response) {
        setBooking(false);

        setError(
          response.error?.description ||
          "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (err) {
      setError(err.message);
      setBooking(false);
    }
  }

  if (!event && !error) {
    return <Loader label="Loading event…" />;
  }

  if (error && !event) {
    return <div className="form-error">{error}</div>;
  }

  // -------------------------------------------------------
  // Ticket successfully created
  // -------------------------------------------------------

  if (booked) {
    return (
      <div className="content-max" style={{ maxWidth: 420 }}>
        <h1 style={{ marginBottom: 20 }}>
          You're in — ticket confirmed
        </h1>

        <PassCard
          ticket={{ ...booked.ticket, event }}
          qrDataUrl={booked.qrDataUrl}
        />

        <p
          className="text-sm mt-24"
          style={{ marginTop: 16 }}
        >
          This QR is your entry pass. It's also saved to your wallet.
        </p>
      </div>
    );
  }

  const date = new Date(event.startsAt);

  return (
    <div className="content-max" style={{ maxWidth: 720 }}>
      <div className="glass-card">
        <span className="badge badge-neutral">
          {event.category}
        </span>

        <h1
          style={{
            fontSize: 28,
            marginTop: 12,
            marginBottom: 6,
          }}
        >
          {event.title}
        </h1>

        <p className="text-sm">
          {event.venue} ·{" "}
          {date.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>

        {event.description && (
          <p
            className="mt-24"
            style={{ marginTop: 16 }}
          >
            {event.description}
          </p>
        )}
      </div>

      <div
        className="glass-card mt-24"
        style={{ marginTop: 20 }}
      >
        <h3 style={{ marginBottom: 14 }}>
          Choose your tier
        </h3>

        <TierSelector
          tiers={event.tiers}
          selected={tier}
          onSelect={setTier}
        />

        {error && (
          <div
            className="form-error mt-24"
            style={{ marginTop: 16 }}
          >
            {error}{" "}
            <Link to="/support" style={{ color: "inherit", textDecoration: "underline" }}>
              Need help?
            </Link>
          </div>
        )}

        <button
          className="btn btn-primary btn-block mt-24"
          style={{ marginTop: 18 }}
          disabled={!tier || booking}
          onClick={handleBook}
        >
          {booking
            ? "Processing…"
            : user
              ? "Book ticket"
              : "Log in to book"}
        </button>
      </div>
    </div>
  );
}
// File: src/pages/CustomerHelp.jsx
// Purpose: Customer help page with FAQs and complaint form

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../auth/api";

const FAQS = [
  {
    q: "Can I book without KYC approval?",
    a: "You can book after KYC is submitted. Admin approval finalizes verification."
  },
  {
    q: "What if the vehicle condition is different?",
    a: "Raise a complaint with booking details and photos if possible."
  },
  {
    q: "Owner asked for extra payment?",
    a: "Report it immediately. We investigate and take action."
  },
  {
    q: "How do I cancel a booking?",
    a: "Cancellation depends on owner policies and booking status."
  }
];

const CUSTOMER_REASONS = [
  "Wrong vehicle condition",
  "Wrong make or model",
  "Owner demanded extra charge",
  "Owner misbehavior",
  "Vehicle pickup issues",
  "Other"
];

export default function CustomerHelp() {
  const { user } = useAuth();
  const [openIndex, setOpenIndex] = useState(0);
  const [bookings, setBookings] = useState([]);

  const [bookingId, setBookingId] = useState("");
  const [reason, setReason] = useState(CUSTOMER_REASONS[0]);
  const [details, setDetails] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      if (!user?.id) return;
      try {
        const data = await apiFetch(`/api/customers/${user.id}/bookings?limit=50`);
        const list = data?.bookings || data || [];
        setBookings(Array.isArray(list) ? list : []);
      } catch {
        setBookings([]);
      }
    }
    loadBookings();
  }, [user?.id]);

  function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    if (!bookingId) {
      setError("Please select or enter a booking id.");
      return;
    }
    if (!details.trim()) {
      setError("Please add complaint details.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border shadow-soft p-6 md:p-10">
        <div className="text-sm text-gray-500">Customer Help</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-rr-black">
          FAQs and Complaints
        </h1>
        <p className="mt-2 text-gray-600">
          Get quick answers or raise a complaint for your booking.
        </p>
      </section>

      {/* FAQs */}
      <section className="bg-white rounded-2xl border shadow-soft p-6">
        <div className="text-lg font-semibold text-rr-black">FAQs</div>
        <div className="mt-4 space-y-3">
          {FAQS.map((f, i) => (
            <button
              key={f.q}
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-rr-black">{f.q}</div>
                <div className="text-sm text-gray-500">
                  {openIndex === i ? "Hide" : "Show"}
                </div>
              </div>
              {openIndex === i && (
                <div className="mt-2 text-sm text-gray-600">{f.a}</div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Complaint box */}
      <section className="bg-white rounded-2xl border shadow-soft p-6">
        <div className="text-lg font-semibold text-rr-black">Complaint box</div>
        <p className="text-sm text-gray-600 mt-1">
          Report issues like wrong vehicle condition, wrong make/model, extra charges, or misbehavior.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Booking</label>
              {bookings.length > 0 ? (
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
                >
                  <option value="">Select booking</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.id} · {b.vehicle?.make} {b.vehicle?.model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter booking id"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              >
                {CUSTOMER_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              placeholder="Explain what happened..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Photo URL (optional)</label>
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {sent && <div className="text-sm text-green-600">Complaint submitted.</div>}

          <button type="submit" className="btn-rr">
            Submit complaint
          </button>
        </form>
      </section>
    </div>
  );
}

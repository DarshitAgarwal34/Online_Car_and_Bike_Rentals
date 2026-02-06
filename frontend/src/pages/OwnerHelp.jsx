// File: src/pages/OwnerHelp.jsx
// Purpose: Owner help page with FAQs and complaint form

import React, { useState } from "react";

const FAQS = [
  {
    q: "How do I list a vehicle?",
    a: "Go to List Vehicle, fill all required fields and upload a photo."
  },
  {
    q: "Can I pause bookings?",
    a: "Yes. Toggle availability in My Vehicles."
  },
  {
    q: "How do I see my bookings?",
    a: "Open the Bookings page from your owner dashboard."
  },
  {
    q: "When do I receive payment?",
    a: "Payments depend on pickup confirmation and booking completion."
  }
];

const OWNER_REASONS = [
  "Customer returned vehicle late",
  "Vehicle damaged by customer",
  "Customer misbehavior",
  "Non-payment or payment dispute",
  "Unauthorized usage",
  "Other"
];

export default function OwnerHelp() {
  const [openIndex, setOpenIndex] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [reason, setReason] = useState(OWNER_REASONS[0]);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    if (!bookingId) {
      setError("Please enter a booking id.");
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
        <div className="text-sm text-gray-500">Owner Help</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-rr-black">
          FAQs and Complaints
        </h1>
        <p className="mt-2 text-gray-600">
          Get quick answers or raise a complaint about a booking.
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
          Report issues like late return, damages, misbehavior, or payment disputes.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Booking id</label>
              <input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter booking id"
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              >
                {OWNER_REASONS.map((r) => (
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
              placeholder="Explain the issue..."
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

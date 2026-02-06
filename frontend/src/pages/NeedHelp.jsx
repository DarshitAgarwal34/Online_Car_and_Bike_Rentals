// File: src/pages/NeedHelp.jsx
// Purpose: Need Help page with FAQs, contact, and feedback form

import React, { useState } from "react";

const FAQS = [
  {
    q: "How do I book a vehicle?",
    a: "Login as a customer, open your dashboard, and click 'Book Now' on any vehicle."
  },
  {
    q: "Is KYC required before booking?",
    a: "Yes. Customers must complete KYC to enable bookings."
  },
  {
    q: "What payment options are available?",
    a: "You can choose pay on pickup or card/UPI during booking."
  },
  {
    q: "Can I cancel a booking?",
    a: "Cancellation rules depend on the owner and booking status. Contact support for help."
  }
];

export default function NeedHelp() {
  const [openIndex, setOpenIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e?.preventDefault();
    setSent(true);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="bg-white rounded-2xl border shadow-soft p-6 md:p-10">
        <div className="text-sm text-gray-500">Need Help</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-rr-black">
          We are here to help
        </h1>
        <p className="mt-2 text-gray-600">
          Find quick answers, contact support, or send us feedback.
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

      {/* Feedback */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">Feedback</div>
            <div className="text-lg font-semibold text-rr-black">
              Send us your feedback
            </div>
            <p className="text-sm text-gray-600 mt-1">
              We read every message to improve the experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              placeholder="Tell us how we can help..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-rr">
              {sent ? "Thanks for your feedback" : "Submit feedback"}
            </button>
            {sent && <div className="text-sm text-green-600">Message sent.</div>}
          </div>
        </form>
      </section>
    </div>
  );
}

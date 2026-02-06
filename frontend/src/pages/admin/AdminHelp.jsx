// File: src/pages/admin/AdminHelp.jsx
// Purpose: Admin help page with FAQs

import React, { useState } from "react";

const FAQS = [
  {
    q: "How do I review KYC requests?",
    a: "Open KYC requests from the admin dashboard and approve or reject."
  },
  {
    q: "Where can I see complaints?",
    a: "Use the Complaints page to review and act on reports."
  },
  {
    q: "How do I manage users?",
    a: "Use Customers and Owners pages to review profiles."
  }
];

export default function AdminHelp() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500">Admin</div>
        <h1 className="text-2xl font-bold text-rr-black">Help</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
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
      </div>
    </div>
  );
}

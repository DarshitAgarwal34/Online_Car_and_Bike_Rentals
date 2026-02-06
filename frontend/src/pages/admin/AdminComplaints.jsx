// File: src/pages/admin/AdminComplaints.jsx
// Purpose: Admin complaints inbox (placeholder until backend is implemented)

import React from "react";

export default function AdminComplaints() {
  const complaints = [];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500">Admin</div>
        <h1 className="text-2xl font-bold text-rr-black">Complaints</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        {complaints.length === 0 ? (
          <div className="text-gray-600">No complaints received yet.</div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="border rounded-lg p-4">
                <div className="font-semibold text-rr-black">
                  {c.type} · #{c.id}
                </div>
                <div className="text-sm text-gray-500">{c.details}</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 rounded border text-sm">Resolve</button>
                  <button className="px-3 py-1 rounded border text-sm">Warn</button>
                  <button className="px-3 py-1 rounded border text-sm">Suspend</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

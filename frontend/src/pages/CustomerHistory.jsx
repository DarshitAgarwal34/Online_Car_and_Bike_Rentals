// File: src/pages/CustomerHistory.jsx
// Purpose: Customer booking history page

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../auth/api";

function BookingRow({ b }) {
  return (
    <div className="p-3 bg-white rounded-lg border shadow-sm flex items-center gap-3">
      <img
        src={b.vehicle?.primary_photo || b.vehicle?.photo_url || "https://via.placeholder.com/120x80?text=Vehicle"}
        alt="vehicle"
        className="w-20 h-12 object-cover rounded"
      />
      <div className="flex-1">
        <div className="font-semibold text-sm">
          {b.vehicle?.make} {b.vehicle?.model}
        </div>
        <div className="text-xs text-gray-500">
          From: {b.start_date ? new Date(b.start_date).toLocaleString() : "-"}
        </div>
        <div className="text-xs text-gray-500">
          To: {b.end_date ? new Date(b.end_date).toLocaleString() : "-"}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">₹{b.total_price ?? "-"}</div>
        <div className="text-xs text-gray-500">{b.status || "pending"}</div>
      </div>
    </div>
  );
}

export default function CustomerHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/api/customers/${user.id}/bookings?limit=50`);
        const list = data?.bookings || data || [];
        setBookings(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500">Customer</div>
        <h1 className="text-2xl font-bold text-rr-black">Booking history</h1>
      </div>

      {loading && <div className="text-gray-500">Loading bookings...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg border p-6 text-center text-gray-600">
              No bookings yet.
            </div>
          ) : (
            bookings.map((b) => <BookingRow key={b.id} b={b} />)
          )}
        </div>
      )}
    </div>
  );
}

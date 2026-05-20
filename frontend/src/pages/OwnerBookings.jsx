// File: src/pages/OwnerBookings.jsx
// Purpose: Owner bookings list (placeholder until backend bookings are implemented)

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../auth/api";
import { getLocalBookings, mergeBookings } from "../utils/bookingStore";

export default function OwnerBookings() {
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
        const res = await apiFetch(`/api/owners/${user.id}/bookings`);
        const list = res?.bookings || res || [];
        const localBookings = getLocalBookings().filter(
          (booking) => String(booking.owner_id) === String(user.id)
        );
        setBookings(mergeBookings(Array.isArray(list) ? list : [], localBookings));
      } catch (err) {
        const localBookings = getLocalBookings().filter(
          (booking) => String(booking.owner_id) === String(user.id)
        );
        setBookings(localBookings);
        setError(localBookings.length ? "" : err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  useEffect(() => {
    function syncBookings() {
      if (!user?.id) return;
      const localBookings = getLocalBookings().filter(
        (booking) => String(booking.owner_id) === String(user.id)
      );
      setBookings((prev) => mergeBookings(prev, localBookings));
    }

    window.addEventListener("rentroam:bookings-changed", syncBookings);
    return () => window.removeEventListener("rentroam:bookings-changed", syncBookings);
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500">Owner</div>
        <h1 className="text-2xl font-bold text-rr-black">Bookings</h1>
      </div>

      {loading && <div className="text-gray-500">Loading bookings...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          {bookings.length === 0 ? (
            <div className="text-gray-600">No bookings yet.</div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="border rounded-lg p-3">
                  <div className="font-semibold text-rr-black">
                    {b.vehicle_make || b.vehicle?.make} {b.vehicle_model || b.vehicle?.model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {b.start_date} - {b.end_date}
                  </div>
                  <div className="text-sm text-gray-500">
                    Customer: {b.customer?.name || b.customer_name || "Customer"} {b.customer?.email || b.customer_email ? `(${b.customer?.email || b.customer_email})` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// frontend/src/pages/OwnerDashboard.jsx
// Minimal Owner dashboard placeholder. We'll enhance later with charts and lists.
// - Shows quick stats and links to list/add vehicles, manage availability and bookings.

import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../auth/api';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalVehicles: 0, totalBookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      setLoading(true);
      try {
        // example endpoints - implement on backend
        const res = await apiFetch(`/api/owners/${user.id}/stats`); // returns { total_vehicles, total_bookings, total_earnings }
        if (res && typeof res === 'object') {
          setStats({
            totalVehicles: res.total_vehicles ?? res.totalVehicles ?? 0,
            totalBookings: res.total_bookings ?? res.totalBookings ?? 0,
            revenue: res.total_earnings ?? res.revenue ?? 0
          });
        }
      } catch (err) {
        console.error('owner dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  useEffect(() => {
    async function loadBookings() {
      if (!user?.id) return;
      setLoadingBookings(true);
      try {
        const res = await apiFetch(`/api/owners/${user.id}/bookings`);
        const list = res?.bookings || res || [];
        setRecentBookings(Array.isArray(list) ? list.slice(0, 5) : []);
      } catch (err) {
        console.error('owner bookings load failed', err);
        setRecentBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    }
    loadBookings();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Owner Dashboard</div>
          <h1 className="text-2xl font-extrabold text-[--rr-black]">Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/owner/list-vehicle')} className="btn-rr">List Vehicle</button>
          <button onClick={() => navigate('/owner/vehicles')} className="px-4 py-2 border rounded">My Vehicles</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">Total vehicles</div>
          <div className="text-2xl font-semibold">{loading ? '...' : stats.totalVehicles}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">Total bookings</div>
          <div className="text-2xl font-semibold">{loading ? '...' : stats.totalBookings}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="text-2xl font-semibold">₹{loading ? '...' : (stats.revenue ?? 0)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border shadow-sm">
        <div className="text-sm text-gray-500">Recent bookings & notifications</div>
        <div className="mt-3 space-y-2">
          {loadingBookings ? (
            <div className="text-sm text-gray-600">Loading bookings...</div>
          ) : recentBookings.length === 0 ? (
            <div className="text-sm text-gray-600">No recent bookings</div>
          ) : (
            recentBookings.map((b) => (
              <div key={b.id} className="text-sm border rounded-lg p-2">
                <div className="font-semibold text-rr-black">
                  {b.vehicle_make} {b.vehicle_model}
                </div>
                <div className="text-xs text-gray-500">
                  {b.start_date} - {b.end_date}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

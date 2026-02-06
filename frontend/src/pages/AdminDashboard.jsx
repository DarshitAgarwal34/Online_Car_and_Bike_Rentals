// frontend/src/pages/AdminDashboard.jsx
// Minimal Admin dashboard placeholder.
// - Shows top-level counts (users, owners, vehicles, bookings) and quick links.

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../auth/api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ customers: 0, owners: 0, vehicles: 0, bookings: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // endpoint to implement on backend for admin summary
        const res = await apiFetch('/api/admins/dashboard');
        setStats({
          customers: res.customers ?? 0,
          owners: res.owners ?? 0,
          vehicles: res.vehicles ?? 0,
          bookings: res.bookings ?? 0
        });
      } catch (err) {
        console.error('admin dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Admin Dashboard</div>
          <h1 className="text-2xl font-extrabold text-[--rr-black]">Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/customers')} className="px-4 py-2 border rounded">Customers</button>
          <button onClick={() => navigate('/admin/owners')} className="btn-rr">Owners</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">Customers</div>
          <div className="text-2xl font-semibold">{loading ? '...' : stats.customers}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">Owners</div>
          <div className="text-2xl font-semibold">{loading ? '...' : stats.owners}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">Vehicles</div>
          <div className="text-2xl font-semibold">{loading ? '...' : stats.vehicles}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">Bookings</div>
          <div className="text-2xl font-semibold">{loading ? '...' : stats.bookings}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border shadow-sm">
        <div className="text-sm text-gray-500">Admin actions</div>
        <div className="mt-3 flex gap-3">
          <button onClick={() => navigate('/admin/customers')} className="px-3 py-2 border rounded">Manage customers</button>
          <button onClick={() => navigate('/admin/owners')} className="px-3 py-2 border rounded">Manage owners</button>
        </div>
      </div>
    </div>
  );
}

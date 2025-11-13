// File: src/pages/Vehicles.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VehicleCard({ v, onBook }) {
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden flex flex-col">
      <div className="w-full h-44 bg-gray-100 overflow-hidden">
        <img src={v.photo_url || v.photo || '/placeholder-vehicle.jpg'} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-rr-black">{v.make} {v.model}</h3>
            <p className="text-sm text-gray-500 mt-1">{v.year} • {v.color}</p>
          </div>
          <div className="text-right">
            <div className="text-rr-orange font-bold text-lg">₹{v.daily_rate}</div>
            <div className="text-sm text-gray-400">/day</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600 capitalize">{v.vehicle_condition}</div>
          <button onClick={() => onBook(v.id)} className="px-3 py-2 bg-rr-orange text-white rounded-md text-sm hover:bg-rr-orange-dark btn-rr">Book Now</button>
        </div>
      </div>
    </div>
  );
}

export default function Vehicles() {
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
  const query = useQuery();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // pagination
  const [page, setPage] = useState(parseInt(query.get('page') || '1', 10));
  const limit = 12;

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        // forward query params from URL to API
        const params = new URLSearchParams();
        for (const [k, v] of query.entries()) {
          params.set(k, v);
        }
        // add pagination params
        params.set('limit', String(limit));
        params.set('page', String(page));

        const res = await fetch(`${API_BASE}/vehicles?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Server ${res.status}: ${txt}`);
        }
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('vehicles load error', e);
          setErr(e.message || 'Failed to load vehicles');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [API_BASE, query.toString(), page]);

  function handleBookNow(vehicleId) {
    if (!user) {
      navigate(`/login?next=/book/${vehicleId}`);
      return;
    }
    if (user.role === 'customer') {
      navigate(`/book/${vehicleId}`);
      return;
    }
    if (user.role === 'owner') navigate('/owner');
    if (user.role === 'admin') navigate('/admin');
    else navigate('/profile');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Vehicles</h2>
        <div className="text-sm text-gray-600">Showing results</div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading vehicles…</div>
      ) : err ? (
        <div className="text-center text-red-600 py-8">{err}</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No vehicles found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(v => <VehicleCard key={v.id} v={v} onBook={handleBookNow} />)}
        </div>
      )}

      {/* simple pagination controls */}
      <div className="flex items-center justify-center space-x-3 py-6">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-2 rounded-md border">Prev</button>
        <div>Page {page}</div>
        <button onClick={() => setPage(p => p + 1)} className="px-3 py-2 rounded-md border">Next</button>
      </div>
    </div>
  );
}

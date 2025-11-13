// File: src/pages/Vehicles.jsx
// Vehicles listing page for RentRoam
// - Fetches vehicles from backend (/api/vehicles) and supports server-side city/type/available filters.
// - Reads query params from URL so /vehicles?city=Kota works (e.g., when Home redirects).
// - Responsive grid + pagination that adapts per viewport width.
// - Uses apiFetch wrapper to attach JWT automatically and useAuth for user role-based redirects.

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../auth/api';
import { useAuth } from '../auth/AuthContext';

function VehicleCard({ v, onBook }) {
  // Single card UI for vehicle
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden flex flex-col">
      <div className="w-full h-48 bg-gray-100 overflow-hidden">
        <img
          src={v.photo_url || v.photo || v.photoUrl || v.image || '/placeholder-vehicle.png'}
          alt={`${v.make} ${v.model}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-rr-black">{v.make} {v.model}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {v.year || '—'} • {v.color || '—'} • {(v.seating_capacity ?? v.seatingCapacity) || '—'} seats
            </p>
            <p className="text-xs text-gray-400 mt-1">Owner city: {v.owner_city || v.ownerCity || '—'}</p>
          </div>

          <div className="text-right">
            <div className="text-rr-orange font-bold text-lg">₹{v.daily_rate ?? v.price ?? '—'}</div>
            <div className="text-sm text-gray-400">/day</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600 capitalize">{(v.vehicle_condition || v.condition || 'good')}</div>
          <button
            onClick={() => onBook(v.id)}
            className="px-3 py-2 bg-rr-orange text-white rounded-md text-sm hover:bg-rr-orange-dark shadow-md btn-rr"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // data + ui state
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // search / filter UI state (kept in sync with URL query params)
  const [city, setCity] = useState('');
  const [type, setType] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // helper: parse location.search into an object
  const getQueryFromLocation = useCallback(() => {
    const q = new URLSearchParams(location.search);
    return {
      city: q.get('city') || '',
      type: q.get('type') || 'all',
      available: q.get('available') === '1' || q.get('available') === 'true' ? true : false
    };
  }, [location.search]);

  // update UI filters from URL on mount / when URL changes
  useEffect(() => {
    const q = getQueryFromLocation();
    setCity(q.city);
    setType(q.type);
    setAvailableOnly(q.available);
    // reset page on query change
    setCurrentPage(1);
  }, [location.search, getQueryFromLocation]);

  // responsive perPage based on viewport width
  const updatePerPageByWidth = useCallback(() => {
    const w = window.innerWidth;
    if (w <= 640) setPerPage(8); // mobile: 8 items (1-col)
    else if (w <= 1024) setPerPage(10); // tablet: 10 items (2-col approx)
    else setPerPage(15); // desktop: 15 items (3-col approx)
    setCurrentPage(1);
  }, []);

  // main loader: fetch vehicles from server, using query params from URL (or explicit params)
  async function loadVehicles({ city: c, type: t, available } = {}) {
    setLoading(true);
    setError(null);
    try {
      // prefer explicit passed filters, else parse from current URL
      const finalCity = typeof c !== 'undefined' ? c : (getQueryFromLocation().city || '');
      const finalType = typeof t !== 'undefined' ? t : (getQueryFromLocation().type || 'all');
      const finalAvailable = typeof available !== 'undefined' ? available : getQueryFromLocation().available;

      const qp = new URLSearchParams();
      if (finalCity) qp.set('city', finalCity);
      if (finalType && finalType !== 'all') qp.set('type', finalType);
      if (typeof finalAvailable !== 'undefined' && finalAvailable !== false) qp.set('available', finalAvailable ? '1' : '0');

      const path = '/api/vehicles' + (qp.toString() ? `?${qp.toString()}` : '');
      // apiFetch attaches token automatically
      const data = await apiFetch(path);

      // backend might return array or { vehicles: [] }
      let arr = [];
      if (Array.isArray(data)) arr = data;
      else if (Array.isArray(data.vehicles)) arr = data.vehicles;
      else if (Array.isArray(data.data)) arr = data.data;
      else arr = [];

      setVehicles(arr);
    } catch (err) {
      console.error('loadVehicles error', err);
      setError(err.message || 'Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  // call loadVehicles on mount and when URL changes
  useEffect(() => {
    loadVehicles();
    // set perPage initially and attach resize listener
    updatePerPageByWidth();
    window.addEventListener('resize', updatePerPageByWidth);
    return () => window.removeEventListener('resize', updatePerPageByWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // reload whenever query changes

  // derived: filtered count and current page slice (client-side slicing for pagination)
  const totalItems = vehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return vehicles.slice(start, start + perPage);
  }, [vehicles, currentPage, perPage]);

  // when user submits search, update URL (so Home redirect / bookmarking works) and reload
  function handleSearch(e) {
    e && e.preventDefault();
    const qp = new URLSearchParams();
    if (city) qp.set('city', city);
    if (type && type !== 'all') qp.set('type', type);
    if (availableOnly) qp.set('available', '1');
    // update URL -> triggers useEffect to reload
    navigate(`/vehicles${qp.toString() ? `?${qp.toString()}` : ''}`, { replace: false });
  }

  // Book flow: redirect guests to login (with next param), customers to booking page, others to their dashboards
  function handleBookNow(vehicleId) {
    if (!user) {
      navigate(`/login?next=/book/${vehicleId}`);
      return;
    }
    if (user.role === 'customer') {
      navigate(`/book/${vehicleId}`);
      return;
    }
    if (user.role === 'owner') {
      navigate('/owner');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    navigate(`/vehicles/${vehicleId}`);
  }

  return (
    <div className="space-y-6">
      {/* Header + search controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-rr-black">Vehicles</h1>
          <p className="text-sm text-gray-600">Browse vehicles listed by owners across cities</p>
        </div>

        {/* --- MODIFIED RESPONSIVE FORM --- */}
        <form
          onSubmit={handleSearch}
          // Stack form elements vertically on mobile, horizontally on desktop
          className="flex flex-col md:flex-row md:items-center md:flex-wrap gap-3"
        >
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (owner city)"
            // Full width on mobile, auto-width on desktop
            className="px-3 py-2 rounded border border-gray-200 focus:ring-1 focus:ring-rr-orange bg-white w-full md:w-auto"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            // Full width on mobile, auto-width on desktop
            className="px-3 py-2 rounded border border-gray-200 focus:ring-1 focus:ring-rr-orange bg-white w-full md:w-auto"
          >
            <option value="all">All types</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="scooter">Scooter</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600 w-full md:w-auto">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="form-checkbox"
            />
            Available only
          </label>
          
          {/* Wrapper for buttons to stack correctly */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              type="submit"
              // Full width on mobile, auto on desktop
              className="px-3 py-2 bg-rr-orange text-white rounded-md hover:bg-rr-orange-dark btn-rr w-full sm:w-auto"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                setCity('');
                setType('all');
                setAvailableOnly(false);
                navigate('/vehicles', { replace: true });
              }}
              // Full width on mobile, auto on desktop
              className="px-3 py-2 border rounded text-sm w-full sm:w-auto"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => loadVehicles({ city, type, available: availableOnly })}
              // Full width on mobile, auto on desktop
              className="px-3 py-2 bg-rr-orange text-white rounded-md hover:bg-rr-orange-dark btn-rr w-full sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </form>
        {/* --- END OF MODIFICATIONS --- */}
      </div>

      {/* Loading / error */}
      {loading && <div className="py-8 text-center">Loading vehicles...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {/* Grid */}
      {!loading && !error && (
        <>
          {/* This grid is already responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.length === 0 ? (
              <div className="col-span-full text-center text-gray-600 py-16">No vehicles found.</div>
            ) : (
              pageItems.map((v) => <VehicleCard key={v.id} v={v} onBook={handleBookNow} />)
            )}
          </div>

          {/* Pagination */}
          {/* This pagination is already responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing <strong>{Math.min((currentPage - 1) * perPage + 1, totalItems || 0)}</strong> -
              <strong> {Math.min(currentPage * perPage, totalItems || 0)}</strong> of <strong>{totalItems}</strong>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                « First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                ‹ Prev
              </button>

              <div className="px-3 py-1 border rounded bg-white">Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong></div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                Next ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50"
              >
                Last »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
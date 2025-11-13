// File: src/pages/Home.jsx
// Purpose: RentRoam Home page — fetch featured vehicles from backend instead of using hard-coded data.
// - Uses apiFetch (auth/api) which automatically attaches JWT if present.
// - Shows loading / error states and graceful fallback sample data.

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../auth/api';

function VehicleCard({ v, onBook }) {
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden flex flex-col">
      <div className="w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={v.photo_url || v.photo || v.photoUrl || v.photo || '/placeholder-vehicle.png'}
          alt={`${v.make} ${v.model}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-rr-black">{v.make} {v.model}</h3>
            <p className="text-sm text-gray-500 mt-1">{v.year} • {v.color} • {v.seating_capacity ?? v.seatingCapacity ?? '—'} seats</p>
          </div>
          <div className="text-right">
            <div className="text-rr-orange font-bold text-lg">₹{v.daily_rate}</div>
            <div className="text-sm text-gray-400">/day</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600 capitalize">{v.vehicle_condition || v.condition || 'good'}</div>
          <button
            onClick={() => onBook(v.id)}
            className="px-3 py-2 bg-rr-orange text-white rounded-md text-sm hover:bg-rr-orange-dark shadow-md ring-1 ring-white/20 btn-rr"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // form state
  const [city, setCity] = useState('');
  const [vehicleType, setVehicleType] = useState('all');
  const [pickupDate, setPickupDate] = useState('');
  const [dropDate, setDropDate] = useState('');

  // vehicles state
  const [vehicles, setVehicles] = useState([]); // live data from server
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Small built-in fallback in case backend is not available
  const fallback = useMemo(() => ([
    { id: 101, make: 'Royal Enfield', model: 'Classic 350', year: 2021, color: 'Matte Black', seating_capacity: 2, daily_rate: 1200, vehicle_condition: 'excellent', photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60' },
    { id: 102, make: 'Hyundai', model: 'Verna', year: 2019, color: 'White', seating_capacity: 5, daily_rate: 2000, vehicle_condition: 'good', photo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=60' },
    { id: 103, make: 'Hero', model: 'Splendor Plus', year: 2020, color: 'Red', seating_capacity: 2, daily_rate: 400, vehicle_condition: 'excellent', photo: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=60' }
  ]), []);
// fetch vehicles from backend on mount (and when filters change if you want)
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Build query params for the API call (only include if set)
        const q = new URLSearchParams();
        if (city) q.set('city', city);
        if (vehicleType && vehicleType !== 'all') q.set('type', vehicleType);
        if (pickupDate) q.set('pickup', pickupDate);
        if (dropDate) q.set('drop', dropDate);

        // Use apiFetch which attaches Authorization header automatically if token stored
        const path = '/api/vehicles' + (q.toString() ? `?${q.toString()}` : '');
        const data = await apiFetch(path); // expects array of vehicles

        if (!mounted) return;
        if (!Array.isArray(data)) {
          // Backend might return { vehicles: [...] } or direct array; handle both
          const arr = Array.isArray(data.vehicles) ? data.vehicles : (Array.isArray(data.data) ? data.data : []);
          // MODIFIED: Slice the array to 6 if it has length, otherwise use fallback
          setVehicles(arr.length ? arr.slice(0, 6) : fallback);
        } else {
          // MODIFIED: Slice the array to 6 if it has length, otherwise use fallback
          setVehicles(data.length ? data.slice(0, 6) : fallback);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles', err);
        if (!mounted) return;
        setError(err.message || 'Failed to load vehicles');
        setVehicles(fallback);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount; adjust deps if you want live filter fetches

  function handleSearch(e) {
    e && e.preventDefault();
    // In this simple version we just reload vehicles with the current filters.
    // For production you'd refactor fetch into a reusable function and call it here with the filter parameters.
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams();
        if (city) q.set('city', city);
        if (vehicleType && vehicleType !== 'all') q.set('type', vehicleType);
        if (pickupDate) q.set('pickup', pickupDate);
        if (dropDate) q.set('drop', dropDate);

        const path = '/api/vehicles' + (q.toString() ? `?${q.toString()}` : '');
        const data = await apiFetch(path);
        if (Array.isArray(data)) setVehicles(data);
        else if (Array.isArray(data.vehicles)) setVehicles(data.vehicles);
        else setVehicles(fallback);
        const el = document.getElementById('featured-listings');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        console.error('Search failed', err);
        setError(err.message || 'Search failed');
        setVehicles(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }

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
    <div className="space-y-10">
      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center min-h-[70vh] flex items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-20 text-center max-w-4xl w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-white text-sm sm:text-base font-semibold tracking-wide mb-2">
              EXPLORE • BOOK • ROAM
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              Find the perfect ride — wherever you roam.
            </h1>
            <p className="text-white/90 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              RentRoam connects you with verified owners and reliable vehicles for every trip. Fast bookings, secure payments, and verified KYC.
            </p>
          </div>

          {/* SEARCH FORM */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-5 sm:p-6 shadow-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Kota)"
                className="p-3 rounded-md border border-white/40 text-white placeholder-white/70 bg-transparent focus:outline-none focus:ring-2 focus:ring-rr-orange w-full appearance-none"
              />

              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="p-3 rounded-md border border-white/40 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-rr-orange w-full appearance-none"
              >
                <option value="all" className="text-black">All types</option>
                <option value="car" className="text-black">Car</option>
                <option value="bike" className="text-black">Bike</option>
                <option value="scooter" className="text-black">Scooter</option>
              </select>

              <input
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                type="date"
                className="p-3 rounded-md border border-white/40 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-rr-orange w-full appearance-none"
              />

              <input
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
                type="date"
                className="p-3 rounded-md border border-white/40 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-rr-orange w-full appearance-none"
              />
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="submit"
                className="px-6 py-3 rounded-md bg-rr-orange text-white font-semibold hover:bg-rr-orange-dark btn-rr transition-all"
              >
                {loading ? 'Searching...' : 'Search Vehicles'}
              </button>

              <button
                type="button"
                onClick={() => { setCity(''); setVehicleType('all'); setPickupDate(''); setDropDate(''); }}
                className="px-6 py-3 rounded-md border border-white text-white hover:bg-white/10 transition-all"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section id="featured-listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-rr-black">Featured vehicles</h2>
          <div className="text-sm text-gray-600">Hand-picked popular rides near you</div>
        </div>

        {error && (
          <div className="text-red-500 mb-4">Failed to load live vehicles: {error}. Showing fallback results.</div>
        )}

        {loading ? (
          <div className="py-12 text-center">Loading vehicles...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} v={v} onBook={handleBookNow} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white rounded-xl shadow-soft p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xl font-semibold mb-4">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-rr-orange font-bold">1. Search</div>
            <p className="text-sm text-gray-600 mt-2">Choose city, dates and pick your vehicle.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-rr-orange font-bold">2. Book</div>
            <p className="text-sm text-gray-600 mt-2">Confirm pickup and complete booking.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-rr-orange font-bold">3. Ride</div>
            <p className="text-sm text-gray-600 mt-2">Meet the owner, pick up the vehicle and enjoy the ride.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

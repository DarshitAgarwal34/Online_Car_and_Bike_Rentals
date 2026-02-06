// frontend/src/pages/CustomerDashboard.jsx
// Customer dashboard for RentRoam
// - Shows welcome + KYC banner
// - Search panel (city, pickup, drop, type)
// - Fetches vehicles from backend via apiFetch and shows responsive grid
// - Shows recent bookings preview
// - Uses Tailwind v4 variables and .btn-rr (theme in src/theme.css)
// - Assumes apiFetch is available at ../auth/api and useAuth() provides user/token helpers

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../auth/api";

// local logo you uploaded earlier — keep this path or move file to public/ and update path
const LOGO_SRC = "/Logo.png";

/* -------------------------
   Small UI components used
   ------------------------- */

// KYC banner shows when customer is not verified
function CustomerKycBanner({ kycSubmitted, kycVerified, onVerifyClick }) {

  // 🟢 Fully verified
  if (kycVerified) {
    return (
      <div className="px-4 py-3 rounded-lg bg-white border text-sm text-[--rr-black] shadow-sm flex items-center justify-between">
        <div>
          <strong className="mr-2">KYC Approved</strong>
          <span className="text-gray-600">You can book vehicles normally.</span>
        </div>
        <div className="text-sm text-green-600 font-semibold">Approved</div>
      </div>
    );
  }

  // 🟡 Submitted, pending admin
  if (kycSubmitted) {
    return (
      <div className="px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-400/40 text-sm text-[--rr-black] shadow-sm flex items-center justify-between">
        <div>
          <strong className="mr-2">KYC Submitted</strong>
          <span className="text-gray-600">Waiting for admin approval.</span>
        </div>
        <div className="text-sm text-yellow-600 font-semibold">Pending</div>
      </div>
    );
  }

  // 🔴 Not submitted
  return (
    <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-400/40 text-sm text-[--rr-black] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="font-semibold">Complete your KYC</div>
        <div className="text-gray-600 text-sm">
          Upload Aadhar & Driving License to enable bookings.
        </div>
      </div>
      <button onClick={onVerifyClick} className="btn-rr px-3 py-2 text-sm">
        Verify KYC
      </button>
    </div>
  );
}


// compact vehicle card used on dashboard
function VehicleCard({ v, onBook }) {
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden flex flex-col">
      <div className="w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={
            v.primary_photo ||
            v.photo_url ||
            v.photos?.[0] ||
            "https://via.placeholder.com/800x500?text=No+Image"
          }
          alt={`${v.make} ${v.model}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[--rr-black]">
              {v.make} {v.model}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {v.year} • {v.color} • {v.seating_capacity ?? "-"} seats
            </p>
          </div>
          <div className="text-right">
            <div className="text-[--rr-orange] font-bold text-lg">
              ₹{v.daily_rate}
            </div>
            <div className="text-sm text-gray-400">/day</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600 capitalize">
            {v.vehicle_condition || "n/a"}
          </div>
          <button
            onClick={() => onBook(v)}
            className="px-3 py-2 bg-[--rr-orange] text-white rounded-md text-sm hover:bg-[--rr-orange-dark] btn-rr"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

// recent booking preview card
function BookingCard({ b }) {
  const start = new Date(b.start_date).toLocaleString();
  const end = new Date(b.end_date).toLocaleString();
  return (
    <div className="p-3 bg-white rounded-lg border shadow-sm flex items-center gap-3">
      <img
        src={
          b.vehicle?.primary_photo ||
          "https://via.placeholder.com/120x80?text=Vehicle"
        }
        alt="vehicle"
        className="w-20 h-12 object-cover rounded"
      />
      <div className="flex-1">
        <div className="font-semibold text-sm">
          {b.vehicle?.make} {b.vehicle?.model}
        </div>
        <div className="text-xs text-gray-500">From: {start}</div>
        <div className="text-xs text-gray-500">To: {end}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">₹{b.total_price}</div>
        <div className="text-xs text-gray-500">{b.status}</div>
      </div>
    </div>
  );
}

/* -------------------------
   Main Dashboard component
   ------------------------- */

export default function CustomerDashboard() {
  const { user } = useAuth(); // should contain id, role and is_verified ideally
  const navigate = useNavigate();

  // local state
  const [profile, setProfile] = useState(null); // customer profile
  const [vehicles, setVehicles] = useState([]); // fetched list
  const [bookings, setBookings] = useState([]); // recent bookings
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");

  // search filters
  const [city, setCity] = useState(user?.city || "");
  const [vehicleType, setVehicleType] = useState("all");
  const [pickup, setPickup] = useState(""); // yyyy-mm-dd
  const [drop, setDrop] = useState(""); // yyyy-mm-dd

  // derive a simple "today to tomorrow" default range if pickup/drop not set
  useEffect(() => {
    if (!pickup) {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      setPickup(today);
      setDrop(tomorrow);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to fetch profile
  async function loadProfile() {
    if (!user?.id) return;
    setLoadingProfile(true);
    try {
      const data = await apiFetch(`/api/customers/${user.id}`);
      // API may return { customer: {...} } or customer object directly
      const p = data?.customer || data;
      setProfile(p || null);
      // sync city default if available
      if (p?.city && !city) setCity(p.city);
    } catch (err) {
      console.error("profile load failed", err);
      setError("Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  }

  // helper to fetch vehicles using query params
  async function fetchVehicles(filters = {}) {
    setLoadingVehicles(true);
    setError("");
    try {
      const q = new URLSearchParams();
      if (filters.city) q.set("city", filters.city);
      if (filters.type && filters.type !== "all") q.set("type", filters.type);
      if (filters.pickup) q.set("pickup", filters.pickup);
      if (filters.drop) q.set("drop", filters.drop);

      // uses apiFetch helper which should attach token
      const data = await apiFetch(
        `/api/vehicles${q.toString() ? `?${q.toString()}` : ""}`
      );
      // backend shape may be { vehicles: [...] } or [...]; handle both
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.vehicles)
        ? data.vehicles
        : [];
      setVehicles(list);
    } catch (err) {
      console.error("vehicles load failed", err);
      setError("Failed to load vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  }

  // helper to fetch recent bookings
  async function loadRecentBookings() {
    if (!user?.id) return;
    try {
      const data = await apiFetch(`/api/customers/${user.id}/bookings?limit=5`);
      const list = data?.bookings || data || [];
      setBookings(list);
    } catch (err) {
      console.error("bookings load failed", err);
    }
  }

  // initial load: profile + vehicles + bookings
  useEffect(() => {
    loadProfile();
    fetchVehicles({ city: city || undefined, type: vehicleType, pickup, drop });
    loadRecentBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // search handler bound to the search panel
  function handleSearch(e) {
    e?.preventDefault();
    fetchVehicles({ city: city || undefined, type: vehicleType, pickup, drop });
    // scroll to section
    const el = document.getElementById("available-vehicles");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // booking handler: if not logged-in go to login; if not KYC -> go to kyc; otherwise route to booking page
  function handleBook(v) {
    if (!user) {
      navigate(`/login?next=/customer/book`);
      return;
    }
    const canBook = Boolean(
      profile?.kyc_verified ||
        profile?.kyc_submitted ||
        profile?.is_verified ||
        user?.is_verified
    );
    if (!canBook) {
      // redirect to kyc page
      navigate("/signup/kyc");
      return;
    }
    navigate(`/customer/book`);
  }

  // memoized fallback UI for empty state
  const noVehicles = useMemo(
    () => !loadingVehicles && vehicles.length === 0,
    [loadingVehicles, vehicles]
  );

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={LOGO_SRC}
            alt="RentRoam"
            className="w-12 h-12 rounded-md object-cover"
          />
          <div>
            <div className="text-sm text-gray-500">Welcome back</div>
            <div className="text-2xl font-extrabold text-[--rr-black]">
              {profile?.name
                ? `Hi, ${profile.name.split(" ")[0]}`
                : user?.name || "Renter"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-lg border text-sm text-[--rr-black]">
            <div className="text-xs text-gray-500">Wallet</div>
            <div className="font-semibold">
              ₹{Number(profile?.wallet_balance ?? 0).toFixed(2)}
            </div>
          </div>

          <div className="hidden sm:block">
            <button
              onClick={() => navigate("/history")}
              className="px-4 py-2 border rounded text-sm"
            >
              Bookings
            </button>
          </div>
        </div>
      </div>

      <CustomerKycBanner
        kycSubmitted={Boolean(profile?.kyc_submitted)}
        kycVerified={Boolean(profile?.kyc_verified)}
        onVerifyClick={() => navigate("/signup/kyc")}
      />

      {/* Search panel */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-lg p-4 border shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Kota)"
            className="p-3 rounded border border-gray-200 focus:ring-2 focus:ring-[--rr-orange] bg-white"
          />
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="p-3 rounded border border-gray-200 focus:ring-2 focus:ring-[--rr-orange] bg-white"
          >
            <option value="all">All types</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>

          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            type="date"
            className="p-3 rounded border border-gray-200 focus:ring-2 focus:ring-[--rr-orange] bg-white"
          />
          <input
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            type="date"
            className="p-3 rounded border border-gray-200 focus:ring-2 focus:ring-[--rr-orange] bg-white"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button type="submit" className="btn-rr">
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setCity("");
              setVehicleType("all");
              const now = new Date();
              setPickup(now.toISOString().slice(0, 10));
              setDrop(
                new Date(now.getTime() + 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10)
              );
              fetchVehicles({});
            }}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {/* main content: vehicles + recent bookings sidebar (responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* vehicles listing takes 2/3 on large screens */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[--rr-black]">
              Available vehicles
            </h3>
            <div className="text-sm text-gray-600">
              {loadingVehicles ? "Loading..." : `${vehicles.length} results`}
            </div>
          </div>

          {/* responsive grid: mobile 1, sm 2, lg 3 */}
          {loadingVehicles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* placeholder skeletons */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-60 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : noVehicles ? (
            <div className="p-6 bg-white rounded-lg border text-center text-gray-600">
              No vehicles found — try changing city, dates or type.
            </div>
          ) : (
            <div
              id="available-vehicles"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {vehicles.map((v) => (
                <VehicleCard key={v.id} v={v} onBook={handleBook} />
              ))}
            </div>
          )}
        </div>

        {/* sidebar: recent bookings + quick actions */}
        <aside className="space-y-4">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Recent bookings</div>
              <div
                className="text-xs text-[--rr-orange] font-semibold cursor-pointer"
                onClick={() => navigate("/history")}
              >
                View all
              </div>
            </div>

            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="text-sm text-gray-500">No recent bookings</div>
              ) : (
                bookings.map((b) => <BookingCard key={b.id} b={b} />)
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Need help?</div>
                <div className="font-semibold">Contact support</div>
                <div className="text-xs text-gray-500 mt-1">
                  rentroam@gmail.com • 2345678901
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => navigate("/need-help")}
                className="w-full btn-rr"
              >
                Get support
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

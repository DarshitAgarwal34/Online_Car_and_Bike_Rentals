// File: src/pages/BookVehicle.jsx
// Purpose: Booking procedure page for a selected vehicle
// - Fetches vehicle details
// - Shows booking form and price summary
// - Guards non-customer users

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../auth/api";

function daysBetween(a, b) {
  try {
    const start = new Date(a);
    const end = new Date(b);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff || 1);
  } catch {
    return 1;
  }
}

export default function BookVehicle() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [pickupDate, setPickupDate] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isCustomer = user?.role === "customer";

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    setPickupDate(today);
    setDropDate(tomorrow);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadVehicle() {
      setLoadingVehicle(true);
      setError("");
      try {
        const data = await apiFetch(`/api/vehicles/${id}`);
        if (!mounted) return;
        const v = data?.vehicle || data;
        setVehicle(v || null);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load vehicle");
      } finally {
        if (mounted) setLoadingVehicle(false);
      }
    }
    loadVehicle();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!user?.id || !isCustomer) return;
      setLoadingProfile(true);
      try {
        const data = await apiFetch(`/api/customers/${user.id}`);
        if (!mounted) return;
        setProfile(data?.customer || data || null);
      } catch {
        if (!mounted) return;
        setProfile(null);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user?.id, isCustomer]);

  const isVerified = Boolean(
    profile?.kyc_verified ||
      profile?.is_verified ||
      profile?.kyc_submitted ||
      user?.is_verified
  );

  const days = useMemo(() => daysBetween(pickupDate, dropDate), [pickupDate, dropDate]);
  const dailyRate = Number(vehicle?.daily_rate || vehicle?.price || 0);
  const total = useMemo(() => (dailyRate || 0) * days, [dailyRate, days]);

  function handleSubmit(e) {
    e?.preventDefault();
    setSubmitted(true);
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-rr-black">Book vehicle</h1>
        <p className="mt-2 text-gray-600">
          Please login or sign up to continue the booking procedure.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to={`/login?next=/book/${id}`} className="btn-rr text-center">
            Login
          </Link>
          <Link to={`/signup?next=/book/${id}`} className="px-4 py-2 rounded-lg border text-center">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-rr-black">Book vehicle</h1>
        <p className="mt-2 text-gray-600">
          Booking is available for customer accounts only. You are logged in as{" "}
          <strong>{user?.role}</strong>.
        </p>
        <div className="mt-4">
          <Link to="/" className="btn-rr">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Booking procedure</div>
          <h1 className="text-2xl font-bold text-rr-black">Confirm your booking</h1>
        </div>
        <button onClick={() => navigate("/customer/dashboard")} className="px-3 py-2 border rounded text-sm">
          Back to dashboard
        </button>
      </div>

      {loadingVehicle && <div className="text-gray-500">Loading vehicle...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loadingVehicle && vehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle summary */}
          <div className="bg-white rounded-xl border p-5 shadow-sm lg:col-span-1">
            <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={
                  vehicle.primary_photo ||
                  vehicle.photo_url ||
                  vehicle.photos?.[0] ||
                  "https://via.placeholder.com/800x500?text=Vehicle"
                }
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4">
              <div className="text-lg font-semibold text-rr-black">
                {vehicle.make} {vehicle.model}
              </div>
              <div className="text-sm text-gray-500">
                {vehicle.year} · {vehicle.color} · {vehicle.seating_capacity ?? "-"} seats
              </div>
              <div className="mt-2 text-rr-orange font-bold text-lg">₹{dailyRate}</div>
              <div className="text-xs text-gray-500">per day</div>
            </div>
          </div>

          {/* Booking form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-5 shadow-sm lg:col-span-2 space-y-4">
            {!isVerified && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                Your KYC is not verified yet. Please complete KYC before booking.
                <div className="mt-2">
                  <Link to="/signup/kyc" className="text-rr-orange underline text-sm">
                    Go to KYC
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pickup date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Drop date</label>
                <input
                  type="date"
                  value={dropDate}
                  onChange={(e) => setDropDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pickup city</label>
              <input
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                placeholder="City (e.g. Kota)"
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment method</label>
              <div className="mt-2 flex gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  Pay on pickup
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  Card/UPI
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
                placeholder="Any special pickup instructions"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold text-rr-black">₹{total}</div>
                <div className="text-xs text-gray-500">{days} day(s)</div>
              </div>
              <button type="submit" className="btn-rr" disabled={!isVerified || loadingProfile}>
                {submitted ? "Booking submitted" : "Confirm booking"}
              </button>
            </div>

            {submitted && (
              <div className="text-sm text-green-600">
                Booking request submitted. You will see it in your dashboard once confirmed.
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

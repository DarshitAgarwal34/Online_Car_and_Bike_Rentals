// File: src/pages/CustomerBookingFlow.jsx
// Purpose: Customer booking flow (search -> select -> confirm)

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../auth/api";

function VehicleCard({ v, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(v)}
      className="text-left bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
    >
      <div className="h-40 bg-gray-100 overflow-hidden">
        <img
          src={v.photo_url || "https://via.placeholder.com/800x500?text=Vehicle"}
          alt={`${v.make} ${v.model}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-rr-black">
              {v.make} {v.model}
            </div>
            <div className="text-sm text-gray-500">
              {v.year} · {v.color} · {v.seating_capacity ?? "-"} seats
            </div>
          </div>
          <div className="text-right">
            <div className="text-rr-orange font-bold text-lg">₹{v.daily_rate}</div>
            <div className="text-xs text-gray-500">/day</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600 capitalize">
          {v.vehicle_condition || "good"}
        </div>
      </div>
    </button>
  );
}

function daysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const s = new Date(startDate);
  const e = new Date(endDate);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff || 1);
}

export default function CustomerBookingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState("any");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [dropTime, setDropTime] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const days = useMemo(() => daysBetween(pickupDate, dropDate), [pickupDate, dropDate]);
  const total = useMemo(
    () => (selected ? Number(selected.daily_rate || 0) * days : 0),
    [selected, days]
  );

  async function handleSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams();
      if (city) q.set("city", city);
      if (vehicleType && vehicleType !== "any") q.set("type", vehicleType);
      q.set("available", "1");
      const path = `/api/vehicles${q.toString() ? `?${q.toString()}` : ""}`;
      const data = await apiFetch(path);
      const list = Array.isArray(data) ? data : data?.vehicles || [];
      setVehicles(list);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(v) {
    setSelected(v);
    setStep(3);
  }

  function handleConfirm() {
    // Booking submission would go here (backend not implemented yet)
    setStep(4);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Customer</div>
          <h1 className="text-2xl font-bold text-rr-black">Book a vehicle</h1>
        </div>
        <button onClick={() => navigate("/customer/dashboard")} className="px-3 py-2 border rounded text-sm">
          Back to dashboard
        </button>
      </div>

      {/* Step 1: search */}
      {step === 1 && (
        <form onSubmit={handleSearch} className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Kota)"
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            >
              <option value="any">Any type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
            <input
              type="date"
              value={dropDate}
              onChange={(e) => setDropDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
            <input
              type="time"
              value={dropTime}
              onChange={(e) => setDropTime(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" className="btn-rr" disabled={loading}>
            {loading ? "Searching..." : "Find available vehicles"}
          </button>
        </form>
      )}

      {/* Step 2: select */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Select a vehicle ({vehicles.length} found)
            </div>
            <button onClick={() => setStep(1)} className="px-3 py-2 border rounded text-sm">
              Change search
            </button>
          </div>
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-lg border p-6 text-gray-600">
              No vehicles available for this search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} v={v} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: confirm */}
      {step === 3 && selected && (
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <div className="text-sm text-gray-500">Confirmation</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold text-rr-black">
                {selected.make} {selected.model}
              </div>
              <div className="text-sm text-gray-500">
                {selected.year} · {selected.color} · {selected.seating_capacity ?? "-"} seats
              </div>
            </div>
            <div className="text-right">
              <div className="text-rr-orange font-bold text-xl">₹{selected.daily_rate}</div>
              <div className="text-xs text-gray-500">/day</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <div className="text-gray-500">Pickup</div>
              <div>{pickupDate || "-"} {pickupTime || ""}</div>
            </div>
            <div>
              <div className="text-gray-500">Drop</div>
              <div>{dropDate || "-"} {dropTime || ""}</div>
            </div>
            <div>
              <div className="text-gray-500">City</div>
              <div>{city || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500">Days</div>
              <div>{days}</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <div className="text-sm text-gray-500">Total price</div>
              <div className="text-xl font-bold text-rr-black">₹{total}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-3 py-2 border rounded text-sm">
                Back
              </button>
              <button onClick={handleConfirm} className="btn-rr">
                Book now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: done */}
      {step === 4 && (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="text-lg font-semibold text-rr-black">Booking confirmed</div>
          <p className="text-sm text-gray-600 mt-2">
            Your booking request has been submitted. You can view it from your dashboard once confirmed.
          </p>
          <button onClick={() => navigate("/customer/dashboard")} className="btn-rr mt-4">
            Back to dashboard
          </button>
        </div>
      )}
    </div>
  );
}

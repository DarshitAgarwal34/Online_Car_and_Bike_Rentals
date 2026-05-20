// File: src/pages/OwnerListVehicle.jsx
// Purpose: Owner vehicle listing form

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiUrl } from "../services/apiBase";

const CONDITIONS = [
  "new",
  "excellent",
  "good",
  "fair",
  "poor",
  "needs maintenance"
];

export default function OwnerListVehicle() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicleType, setVehicleType] = useState("car");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [color, setColor] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [condition, setCondition] = useState("good");
  const [dailyRate, setDailyRate] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("Owner not found. Please login again.");
      return;
    }

    const required = [
      vehicleType,
      make,
      model,
      year,
      registrationNumber,
      color,
      seatingCapacity,
      condition,
      dailyRate
    ];
    if (required.some((v) => !String(v || "").trim())) {
      setError("Please fill all required fields.");
      return;
    }
    if (!photoFile && !photoUrl) {
      setError("Please upload a photo or provide a photo URL.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("owner_id", String(user.id));
      form.append("vehicle_type", vehicleType);
      form.append("make", make);
      form.append("model", model);
      form.append("year", year);
      form.append("registration_number", registrationNumber);
      form.append("color", color);
      form.append("seating_capacity", seatingCapacity);
      form.append("vehicle_condition", condition);
      form.append("daily_rate", dailyRate);
      if (photoFile) form.append("photo", photoFile);
      if (!photoFile && photoUrl) form.append("photo_url", photoUrl);

      const token = localStorage.getItem("rentroam_token");
      const res = await fetch(apiUrl("/api/vehicles"), {
        method: "POST",
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || data?.error || `Failed (${res.status})`;
        throw new Error(msg);
      }

      setSuccess("Vehicle listed successfully.");
      setTimeout(() => navigate("/owner/vehicles"), 800);
    } catch (err) {
      setError(err.message || "Failed to list vehicle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Owner</div>
          <h1 className="text-2xl font-bold text-rr-black">List a vehicle</h1>
        </div>
        <button onClick={() => navigate("/owner/vehicles")} className="px-3 py-2 border rounded text-sm">
          My vehicles
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Make</label>
            <input
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration number</label>
            <input
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Seating capacity</label>
            <input
              type="number"
              value={seatingCapacity}
              onChange={(e) => setSeatingCapacity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily rate (₹)</label>
            <input
              type="number"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full"
            />
            <div className="text-xs text-gray-500 mt-1">PNG or JPG up to 5MB</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Photo URL (optional)</label>
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rr-orange"
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-rr" disabled={loading}>
            {loading ? "Listing..." : "List vehicle"}
          </button>
          <button type="button" onClick={() => navigate("/owner")} className="px-3 py-2 border rounded text-sm">
            Back to dashboard
          </button>
        </div>
      </form>
    </div>
  );
}

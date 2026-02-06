// File: src/pages/OwnerVehicles.jsx
// Purpose: Owner's vehicles list

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../auth/api";

function VehicleCard({ v, onToggle, onRemove }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
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
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="capitalize text-gray-600">{v.vehicle_condition || "good"}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggle(v)}
              className={`text-xs px-2 py-1 rounded ${
                v.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {v.is_available ? "Available" : "Unavailable"}
            </button>
            <button
              type="button"
              onClick={() => onRemove(v)}
              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerVehicles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/owners/${user.id}/vehicles`);
        const list = res?.vehicles || res || [];
        setVehicles(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || "Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  async function removeVehicle(v) {
    if (!v?.id) return;
    if (!confirm("Remove this vehicle?")) return;
    setRemovingId(v.id);
    try {
      await apiFetch(`/api/vehicles/${v.id}`, { method: "DELETE" });
      setVehicles((prev) => prev.filter((item) => item.id !== v.id));
    } catch (err) {
      setError(err.message || "Failed to remove vehicle");
    } finally {
      setRemovingId(null);
    }
  }

  async function toggleAvailability(v) {
    if (!v?.id) return;
    setUpdatingId(v.id);
    try {
      await apiFetch(`/api/vehicles/${v.id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ available: !v.is_available })
      });
      setVehicles((prev) =>
        prev.map((item) =>
          item.id === v.id ? { ...item, is_available: !v.is_available } : item
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update availability");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Owner</div>
          <h1 className="text-2xl font-bold text-rr-black">My vehicles</h1>
        </div>
        <button onClick={() => navigate("/owner/list-vehicle")} className="btn-rr">
          List new vehicle
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading vehicles...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length === 0 ? (
            <div className="col-span-full bg-white border rounded-lg p-6 text-center text-gray-600">
              No vehicles listed yet.
            </div>
          ) : (
            vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                v={{ ...v, is_available: updatingId === v.id ? v.is_available : v.is_available }}
                onToggle={toggleAvailability}
                onRemove={removeVehicle}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

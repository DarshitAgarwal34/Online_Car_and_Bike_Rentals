import { useEffect, useState } from "react";
import { apiFetch } from "../../auth/api";

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/admins/owners").then((res) => setOwners(res.owners || []));
  }, []);

  function startEdit(o) {
    setEditing({
      id: o.id,
      name: o.name || "",
      email: o.email || "",
      phone: o.phone || "",
      dob: o.dob || "",
      gender: o.gender || "",
      is_verified: Boolean(o.is_verified)
    });
    setError("");
  }

  async function saveEdit() {
    if (!editing?.id) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/admins/owners/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(editing)
      });
      setOwners((prev) =>
        prev.map((o) => (o.id === editing.id ? { ...o, ...editing } : o))
      );
      setEditing(null);
    } catch (err) {
      setError(err.message || "Failed to update owner");
    } finally {
      setSaving(false);
    }
  }

  async function removeOwner(id) {
    if (!confirm("Remove owner and all vehicles?")) return;
    await apiFetch(`/api/admins/owners/${id}`, { method: "DELETE" });
    setOwners((o) => o.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-soft p-6">
        <div className="text-sm text-gray-500">Admin</div>
        <h1 className="text-2xl font-bold text-rr-black">Owners</h1>
        <p className="text-sm text-gray-600 mt-1">
          View owner details, listings and complaints.
        </p>
      </div>

      {editing && (
        <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-rr-black">Edit owner</div>
            <button onClick={() => setEditing(null)} className="px-3 py-1 border rounded text-sm">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Name"
              className="px-3 py-2 rounded border"
            />
            <input
              value={editing.email}
              onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              placeholder="Email"
              className="px-3 py-2 rounded border"
            />
            <input
              value={editing.phone}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              placeholder="Phone"
              className="px-3 py-2 rounded border"
            />
            <input
              type="date"
              value={editing.dob || ""}
              onChange={(e) => setEditing({ ...editing, dob: e.target.value })}
              className="px-3 py-2 rounded border"
            />
            <input
              value={editing.gender}
              onChange={(e) => setEditing({ ...editing, gender: e.target.value })}
              placeholder="Gender"
              className="px-3 py-2 rounded border"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={editing.is_verified}
                onChange={(e) => setEditing({ ...editing, is_verified: e.target.checked })}
              />
              Account Verified
            </label>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button onClick={saveEdit} className="btn-rr" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="text-left">Name</th>
              <th className="text-left">Email</th>
              <th className="text-left">Phone</th>
              <th className="text-left">DOB</th>
              <th className="text-left">Gender</th>
              <th className="text-left">Listings</th>
              <th className="text-left">Complaints</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.id}</td>
                <td>{o.name}</td>
                <td>{o.email}</td>
                <td>{o.phone || "-"}</td>
                <td>{o.dob || "-"}</td>
                <td>{o.gender || "-"}</td>
                <td>{o.number_of_listings ?? 0}</td>
                <td>{o.complaints_count ?? 0}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => startEdit(o)}
                    className="px-3 py-1 text-xs border rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeOwner(o.id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {owners.length === 0 && (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-400">
                  No owners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

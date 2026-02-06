import { useEffect, useState } from "react";
import { apiFetch } from "../../auth/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/admins/customers");
        setCustomers(res.customers || []);
      } catch (err) {
        setError(err.message || "Failed to load customers");
        setCustomers([]);
      }
    }
    load();
  }, []);

  function toDateInput(v) {
    if (!v) return "";
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  function startEdit(c) {
    setEditing({
      id: c.id,
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      dob: toDateInput(c.dob),
      gender: c.gender || "",
      license_number: c.license_number || "",
      aadhar_plain: c.aadhar_plain || "",
      kyc_submitted: Boolean(c.kyc_submitted),
      kyc_verified: Boolean(c.kyc_verified),
      is_verified: Boolean(c.is_verified)
    });
    setError("");
  }

  async function saveEdit() {
    if (!editing?.id) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...editing };
      if (!payload.aadhar_plain) delete payload.aadhar_plain;
      await apiFetch(`/api/admins/customers/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...payload } : c))
      );
      setEditing(null);
    } catch (err) {
      setError(err.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  }

  async function removeCustomer(id) {
    if (!confirm("Delete this customer?")) return;
    await apiFetch(`/api/admins/customers/${id}`, { method: "DELETE" });
    setCustomers((c) => c.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-soft p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">Admin</div>
          <h1 className="text-2xl font-extrabold text-rr-black">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Full customer data with KYC and complaints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg border text-sm bg-gray-50">
            Total: <strong>{customers.length}</strong>
          </div>
        </div>
      </div>

      {editing && (
        <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-rr-black">Edit customer</div>
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
            <input
              value={editing.license_number}
              onChange={(e) => setEditing({ ...editing, license_number: e.target.value })}
              placeholder="License number"
              className="px-3 py-2 rounded border"
            />
            <input
              value={editing.aadhar_plain}
              onChange={(e) => setEditing({ ...editing, aadhar_plain: e.target.value })}
              placeholder="Aadhar number"
              className="px-3 py-2 rounded border"
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.kyc_submitted}
                onChange={(e) => setEditing({ ...editing, kyc_submitted: e.target.checked })}
              />
              KYC Submitted
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.kyc_verified}
                onChange={(e) => setEditing({ ...editing, kyc_verified: e.target.checked })}
              />
              KYC Verified
            </label>
            <label className="flex items-center gap-2">
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

      <div className="bg-white rounded-2xl border shadow-soft overflow-hidden">
        <div className="px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-sm text-gray-500">Customer list</div>
            <div className="text-xs text-gray-400">Click Edit to update details or Delete to remove.</div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left font-semibold">ID</th>
                <th className="text-left font-semibold">Customer</th>
                <th className="text-left font-semibold">Contact</th>
                <th className="text-left font-semibold">DOB</th>
                <th className="text-left font-semibold">Gender</th>
                <th className="text-left font-semibold">License</th>
                <th className="text-left font-semibold">Aadhar</th>
                <th className="text-left font-semibold">KYC</th>
                <th className="text-left font-semibold">Complaints</th>
                <th className="text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="p-3 font-semibold text-rr-black">#{c.id}</td>
                  <td className="py-3 pr-3">
                    <div className="font-medium text-rr-black">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="text-sm">{c.phone || "-"}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td className="py-3 pr-3">
                    {c.dob ? new Date(c.dob).toISOString().slice(0, 10) : "-"}
                  </td>
                  <td className="py-3 pr-3 capitalize">{c.gender || "-"}</td>
                  <td className="py-3 pr-3">{c.license_number || "-"}</td>
                  <td className="py-3 pr-3">{c.aadhar_plain || "-"}</td>
                  <td className="py-3 pr-3">
                    <KycBadge submitted={c.kyc_submitted} verified={c.kyc_verified} />
                  </td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {c.complaints_count ?? 0}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeCustomer(c.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-400">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KycBadge({ submitted, verified }) {
  if (verified) {
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span>;
  }
  if (submitted) {
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>;
  }
  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Not Verified</span>;
}

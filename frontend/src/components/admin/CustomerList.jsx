// src/components/admin/CustomerList.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../auth/api';
import CustomerDetailModal from './CustomerDetailModal';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/admins/customers');
      setCustomers(data.customers || data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    try {
      await apiFetch(`/api/admins/customers/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">All customers</h2>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">KYC</th>
              <th className="p-2">Registered</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">
                  {c.kyc_status === 'approved' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Approved</span>
                  ) : c.kyc_status === 'submitted' ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Pending</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Not submitted</span>
                  )}
                </td>
                <td className="p-2">{new Date(c.created_at || c.registered_at || Date.now()).toLocaleDateString()}</td>
                <td className="p-2">
                  <button onClick={() => setSelected(c)} className="px-3 py-1 bg-gray-100 rounded mr-2">
                    View
                  </button>
                  <button onClick={() => removeCustomer(c.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <CustomerDetailModal
          customer={selected}
          onClose={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

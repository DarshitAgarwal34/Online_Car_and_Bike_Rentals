// src/components/admin/KycRequestsTable.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../auth/api';
import KycReviewModal from './KycReviewModal';

export default function KycRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/admins/kyc/requests');
      // try multiple shapes
      setRequests(data.requests || data || []);
    } catch (err) {
      console.error('load kyc requests', err);
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Pending KYC requests</h2>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">Customer</th>
                <th className="p-2">Email</th>
                <th className="p-2">Aadhar (last 4)</th>
                <th className="p-2">License (last 4)</th>
                <th className="p-2">Submitted</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No pending KYC requests.
                  </td>
                </tr>
              )}

              {requests.map((r) => (
                <tr key={r.customer_id || r.id || JSON.stringify(r)} className="border-t">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">
                    {String(r.aadhar_number || '').length >= 4
                      ? `****${String(r.aadhar_number).slice(-4)}`
                      : r.aadhar_number || '—'}
                  </td>
                  <td className="p-2">
                    {String(r.license_number || '').length >= 4
                      ? `****${String(r.license_number).slice(-4)}`
                      : r.license_number || '—'}
                  </td>
                  <td className="p-2">{new Date(r.updated_at || r.created_at || Date.now()).toLocaleString()}</td>
                  <td className="p-2">
                    <button onClick={() => setSelected(r)} className="px-3 py-1 rounded bg-rr-orange text-white">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <KycReviewModal
          req={selected}
          onClose={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

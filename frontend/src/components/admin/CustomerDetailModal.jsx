// src/components/admin/CustomerDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../auth/api';

export default function CustomerDetailModal({ customer, onClose }) {
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/admins/customers/${customer.id}`);
      setFull(data.customer || data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (!full && loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded">Loading…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-3xl w-full p-6 overflow-auto max-h-[90vh]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">Customer: {full?.name}</h3>
            <div className="text-sm text-gray-600">{full?.email} • {full?.phone || '—'}</div>
          </div>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold">Profile</div>
            {full?.profile_picture && (
              <img src={full.profile_picture} alt="profile" className="w-40 h-40 object-cover rounded mt-2" />
            )}
            <div className="mt-2 text-sm">DOB: {full?.dob || '—'}</div>
            <div className="text-sm">Gender: {full?.gender || '—'}</div>
            <div className="text-sm">Phone: {full?.phone || '—'}</div>
          </div>

          <div>
            <div className="text-sm font-semibold">KYC</div>
            <div className="mt-2">Status: <strong>{full?.kyc_status || 'not_submitted'}</strong></div>

            {full?.kyc && (
              <div className="mt-2">
                <div>Aadhar: {full.kyc.aadhar_number || '—'}</div>
                {full.kyc.aadhar_photo && <img src={full.kyc.aadhar_photo} alt="aadhar" className="w-full h-40 object-contain border mt-2" />}
                <div className="mt-2">License: {full.kyc.license_number || '—'}</div>
                {full.kyc.license_photo && <img src={full.kyc.license_photo} alt="license" className="w-full h-40 object-contain border mt-2" />}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}

// src/components/admin/KycReviewModal.jsx
import React, { useState } from 'react';
import { apiFetch } from '../../auth/api';

export default function KycReviewModal({ req, onClose }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  async function approve() {
    setLoading(true);
    try {
      await apiFetch(`/api/admins/kyc/${req.customer_id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ note: 'Approved via admin UI' }),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Approve failed');
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (!reason.trim()) {
      alert('Please add a reason for rejection');
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`/api/admins/kyc/${req.customer_id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Reject failed');
    } finally {
      setLoading(false);
    }
  }

  const aurl = req.aadhar_url || req.aadhar_photo || req.aadhar || '';
  const lurl = req.license_url || req.license_photo || req.license || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-3xl w-full p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Review KYC — {req.name}</h3>
            <div className="text-sm text-gray-600">{req.email}</div>
          </div>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-2">Aadhar</div>
            <div className="mb-2">Number: <strong>{req.aadhar_number || '—'}</strong></div>
            {aurl ? (
              <img src={aurl} alt="aadhar" className="w-full h-48 object-contain border" />
            ) : (
              <div className="text-sm text-gray-400">No image</div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">License</div>
            <div className="mb-2">Number: <strong>{req.license_number || '—'}</strong></div>
            {lurl ? (
              <img src={lurl} alt="license" className="w-full h-48 object-contain border" />
            ) : (
              <div className="text-sm text-gray-400">No image</div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Add rejection reason (required for rejection)"
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button disabled={loading} onClick={approve} className="px-4 py-2 bg-green-600 text-white rounded">
            Approve
          </button>
          <button disabled={loading} onClick={reject} className="px-4 py-2 bg-red-600 text-white rounded">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

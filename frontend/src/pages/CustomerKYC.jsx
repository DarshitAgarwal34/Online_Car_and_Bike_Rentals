// File: frontend/src/pages/CustomerKYC.jsx
// Purpose: Customer KYC page for RentRoam
// - Lets customer submit Aadhar and Driving License numbers, with optional photo uploads
// - Shows KYC status: "Not verified" (red), "Submitted / One-step verified" (orange), "Approved by admin" (green)
// - Uses fetch for multipart/form-data POST to /api/customers/:id/kyc
// - Uses GET /api/customers/:id/kyc to read current status
// - Uses useAuth() for current user info and apiFetch convention for JSON endpoints
// - Shows previews for uploaded files (uses local logo as placeholder if needed)
// - Styling assumes your Tailwind v4 tokens and .btn-rr available

import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiUrl } from '../services/apiBase';

// local placeholder image (the uploaded file you provided previously)
// developer note: keep this path or move logo to public/ and update LOGO_SRC in Logo.jsx
const PLACEHOLDER_IMG = '/Logo.png';

export default function CustomerKYC() {
  const { user } = useAuth(); // expects { id, role, name, email, is_verified? }
  const navigate = useNavigate();

  // KYC form fields
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharFile, setAadharFile] = useState(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseFile, setLicenseFile] = useState(null);

  // status from backend: one of 'not_submitted' | 'submitted' | 'approved'
  const [status, setStatus] = useState('not_submitted');
  const [kycDetail, setKycDetail] = useState(null); // full object from backend if available

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper: human-friendly badge for status
  function StatusBadge({ s }) {
    if (!s || s === 'not_submitted') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Not verified</span>;
    }
    if (s === 'submitted') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Submitted (pending admin)</span>;
    }
    if (s === 'approved') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Verified (admin)</span>;
    }
    return null;
  }

  // Load existing KYC status from backend
  async function loadKyc() {
    if (!user?.id) return;
    setFetching(true);
    setError('');
    try {
      // backend expected endpoint: GET /api/customers/:id/kyc
      const res = await fetch(apiUrl(`/api/customers/${user.id}/kyc`));
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // no kyc found -> keep defaults
        setStatus('not_submitted');
        setKycDetail(null);
        setFetching(false);
        return;
      }

      // backend should return something like:
      // { status: 'submitted'|'approved', aadhar_number, aadhar_url, license_number, license_url, admin_verified: true/false }
      const k = data?.kyc || data;
      if (!k) {
        setStatus('not_submitted');
        setKycDetail(null);
      } else {
        // map backend status to our status flags
        let mapped = 'not_submitted';
        if (k.status === 'approved' || k.admin_verified) mapped = 'approved';
        else if (k.status === 'submitted' || k.aadhar_url || k.license_url) mapped = 'submitted';
        setStatus(mapped);
        setKycDetail(k);
        // prefill numbers if present
        if (k.aadhar_number) setAadharNumber(k.aadhar_number);
        if (k.license_number) setLicenseNumber(k.license_number);
      }
    } catch (err) {
      console.error('loadKyc error', err);
      setError('Failed to load KYC');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadKyc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // preview helpers (URL.createObjectURL)
  function previewUrl(file, fallback) {
    if (!file) return fallback || null;
    try {
      return URL.createObjectURL(file);
    } catch {
      return fallback || null;
    }
  }

  // main submit handler: sends multipart/form-data to backend
  async function handleSubmit(e) {
    e?.preventDefault();
    setError('');
    setSuccess('');
    // basic validation: require document numbers, but photo uploads are optional
    if (!aadharNumber || !licenseNumber) {
      setError('Please provide both Aadhar and Driving License numbers.');
      return;
    }
    if (!user?.id) {
      setError('User not found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      // Build form data
      const form = new FormData();
      form.append('aadhar_number', aadharNumber);
      form.append('license_number', licenseNumber);
      if (aadharFile) form.append('aadhar_file', aadharFile);
      if (licenseFile) form.append('license_file', licenseFile);

      // POST to backend endpoint
      const res = await fetch(apiUrl(`/api/customers/${user.id}/kyc`), {
        method: 'POST',
        body: form
        // Note: do not set Content-Type for multipart; browser sets boundary
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || data?.message || `KYC upload failed (${res.status})`;
        throw new Error(msg);
      }

      // assume backend responded with kyc object and status 'submitted' (waiting admin)
      setStatus(data?.status === 'approved' || data?.admin_verified ? 'approved' : 'submitted');
      setKycDetail(data || null);
      setSuccess('KYC submitted successfully. Waiting for admin approval.');
    } catch (err) {
      console.error('KYC submit error', err);
      setError(err.message || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  }

  // quick helper to let user remove an uploaded file before submit
  function clearAadharFile() {
    setAadharFile(null);
  }
  function clearLicenseFile() {
    setLicenseFile(null);
  }

  // Small UI: show whether booking allowed (one-step verified or admin approved)
  const canBook = status === 'submitted' || status === 'approved';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo size={48} showText={true} />
          <div>
            <div className="text-sm text-gray-500">KYC center</div>
            <h1 className="text-2xl font-extrabold text-[--rr-black]">Identity verification</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Booking status</div>
          <StatusBadge s={status} />
        </div>
      </div>

      {/* Info panel */}
      <div className="bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm text-gray-600">Two-step verification</div>
            <div className="text-sm text-gray-700">
              Submit your Aadhar and Driving License numbers. Photo uploads are optional. After submission, your account becomes <strong>Submitted</strong> and you can book.
              Admin approval moves the account to <strong>Verified</strong>.
            </div>
          </div>
          <div className="text-sm">
            <div>Can book: <strong className={`ml-2 ${canBook ? 'text-green-600' : 'text-red-600'}`}>{canBook ? 'Yes' : 'No'}</strong></div>
            <div className="text-xs text-gray-500 mt-1">Admin approval required for full verification</div>
          </div>
        </div>
      </div>

      {/* Show any fetch or submit errors */}
      {fetching && <div className="text-sm text-gray-500">Loading KYC status...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      {/* KYC form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border shadow-sm space-y-6">
        {/* Aadhar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
            <input
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value)}
              placeholder="Enter Aadhar number"
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[--rr-orange]"
            />
            <div className="text-xs text-gray-500 mt-1">We encrypt your Aadhar on the server — visible only to admin.</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Aadhar Photo <span className="text-gray-400">(optional)</span></label>
            <div className="flex items-center gap-3">
              <label className="w-36 h-24 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500 cursor-pointer overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setAadharFile(e.target.files?.[0] || null)} />
                {aadharFile ? (
                  <img src={previewUrl(aadharFile, PLACEHOLDER_IMG)} alt="aadhar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="px-2 text-center">Upload</div>
                )}
              </label>

              {aadharFile && (
                <div>
                  <button type="button" onClick={clearAadharFile} className="px-3 py-1 text-sm rounded border">Remove</button>
                </div>
              )}

              {/* show existing backend image if available */}
              {!aadharFile && kycDetail?.aadhar_url && (
                <a href={kycDetail.aadhar_url} target="_blank" rel="noreferrer" className="text-sm text-[--rr-orange] underline">View uploaded</a>
              )}
            </div>
          </div>
        </div>

        {/* License */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Driving License Number</label>
            <input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Enter driving license number"
              className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[--rr-orange]"
            />
            <div className="text-xs text-gray-500 mt-1">License will be verified by admin.</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">License Photo <span className="text-gray-400">(optional)</span></label>
            <div className="flex items-center gap-3">
              <label className="w-36 h-24 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500 cursor-pointer overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} />
                {licenseFile ? (
                  <img src={previewUrl(licenseFile, PLACEHOLDER_IMG)} alt="license preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="px-2 text-center">Upload</div>
                )}
              </label>

              {licenseFile && (
                <div>
                  <button type="button" onClick={clearLicenseFile} className="px-3 py-1 text-sm rounded border">Remove</button>
                </div>
              )}

              {!licenseFile && kycDetail?.license_url && (
                <a href={kycDetail.license_url} target="_blank" rel="noreferrer" className="text-sm text-[--rr-orange] underline">View uploaded</a>
              )}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-rr">
            {loading ? 'Submitting...' : (status === 'approved' ? 'Re-submit documents' : 'Submit for verification')}
          </button>

          <button type="button" onClick={() => navigate('/customer/dashboard')} className="px-3 py-2 border rounded text-sm">Back to dashboard</button>

          {/* quick status note */}
          <div className="text-sm text-gray-500 ml-auto">
            Status: <strong className="ml-2">{status === 'approved' ? 'Approved' : status === 'submitted' ? 'Submitted' : 'Not submitted'}</strong>
          </div>
        </div>
      </form>

      {/* admin note / timeline */}
      <div className="bg-white rounded-lg p-4 border shadow-sm">
        <h4 className="font-semibold mb-2">Verification timeline</h4>
        <ol className="text-sm space-y-2">
          <li>
            <span className="font-medium">Customer submitted documents</span> — <span className="text-gray-600">You</span>
          </li>
          <li>
            <span className="font-medium">Admin review</span> — <span className="text-gray-600">Waiting</span>
          </li>
          <li>
            <span className="font-medium">Final approval</span> — <span className="text-gray-600">Admin action required</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

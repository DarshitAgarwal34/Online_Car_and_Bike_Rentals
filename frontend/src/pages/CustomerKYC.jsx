// src/pages/CustomerKYC.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CustomerKYC() {
  const [license_number, setLicense] = useState('');
  const [aadhar_plain, setAadhar] = useState('');
  const { user } = useAuth();
  const nav = useNavigate();

  if (!user) {
    // Not logged in — redirect
    nav('/login');
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/customers/${user.id}/kyc`, {
        license_number,
        aadhar_plain
      });
      alert('KYC uploaded');
      nav('/');
    } catch (err) {
      console.error('kyc upload error', err);
      alert(err.response?.data?.error || 'KYC upload failed');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload KYC</h2>
      <p className="text-sm text-gray-500 mb-3">Only customers need to upload Aadhaar & driving license.</p>
      <form onSubmit={submit} className="space-y-3">
        <input value={license_number} onChange={e => setLicense(e.target.value)} placeholder="Driving license number" className="w-full border p-2 rounded" />
        <input value={aadhar_plain} onChange={e => setAadhar(e.target.value)} placeholder="Aadhaar number (will be encrypted)" className="w-full border p-2 rounded" />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Upload KYC</button>
      </form>
    </div>
  );
}

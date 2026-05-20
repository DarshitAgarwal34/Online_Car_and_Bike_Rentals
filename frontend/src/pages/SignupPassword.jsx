// src/pages/SignupPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { apiUrl } from '../services/apiBase';

export default function SignupPassword() {
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const raw = localStorage.getItem('regData');
    if (!raw) nav('/signup');
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    const raw = JSON.parse(localStorage.getItem('regData') || '{}');
    if (!raw || !raw.email) return nav('/signup');
    if (!password) return alert('enter a password');

    try {
      if (raw.role === 'owner') {
        // owner signup
        const res = await axios.post(apiUrl('/api/owners/signup'), {
          name: raw.name,
          email: raw.email,
          password,
          phone: raw.phone,
          dob: raw.dob,
          profile_picture: raw.profile_picture
        });
        const { token, user } = res.data;
        loginWithToken(token, user);
        localStorage.removeItem('regData');
        nav('/owner'); // owner dashboard
      } else {
        // customer signup (without KYC yet)
        const res = await axios.post(apiUrl('/api/customers/signup'), {
          name: raw.name,
          email: raw.email,
          password,
          phone: raw.phone,
          dob: raw.dob,
          profile_picture: raw.profile_picture
        });
        const { token, user } = res.data;
        loginWithToken(token, user);
        // after customer signup we expect a separate KYC page
        localStorage.removeItem('regData');
        nav('/signup/kyc');
      }
    } catch (err) {
      console.error('signup password error', err);
      alert(err.response?.data?.error || 'signup failed');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Create password</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a strong password" type="password" className="w-full border p-2 rounded" />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Create account</button>
      </form>
    </div>
  );
}

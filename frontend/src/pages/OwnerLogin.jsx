// src/pages/OwnerLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiUrl } from '../services/apiBase';

export default function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithToken } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(apiUrl('/api/owners/login'), { email, password });
      const { token, user } = res.data;
      loginWithToken(token, user);
      nav('/owner');
    } catch (err) {
      alert(err.response?.data?.error || 'login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Owner Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border p-2 rounded" />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}

// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  // role: 'customer' | 'owner' | 'admin'
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const nav = useNavigate();
  const { loginWithToken } = useAuth();

  // Decide endpoint by role
  function endpointForRole(role) {
    if (role === 'admin') return '/api/admins/login';
    if (role === 'owner') return '/api/owners/login';
    return '/api/customers/login';
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      const url = `http://localhost:5000${endpointForRole(role)}`;
      const res = await axios.post(url, { email, password });

      // Expect backend: { token, user }
      const { token, user } = res.data;
      if (!token) throw new Error('No token returned');

      // ensure role present on user (backend should provide it)
      user.role = user.role || role;

      // save token & user
      loginWithToken(token, user);

      // redirect by role
      if (user.role === 'admin') nav('/admin');
      else if (user.role === 'owner') nav('/owner');
      else nav('/profile'); // customer

    } catch (err) {
      console.error('login error', err);
      // show server error when possible
      const serverMsg = err.response?.data?.error || err.response?.data || err.message;
      setError(String(serverMsg));
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Sign in as</label>
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-2 rounded mb-3">{error}</div>}

      <form onSubmit={submit} className="space-y-3">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full border p-2 rounded"
        />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
      </form>

      <div className="text-sm text-gray-500 mt-3">
        Tip: choose role before login (admin uses admin credentials).
      </div>
    </div>
  );
}

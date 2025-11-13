/* -----------------
File: src/pages/AdminLogin.jsx
----------------- */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { adminLogin } from '../services/adminApi';


export default function AdminLogin() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState(null);
const nav = useNavigate();
const { loginWithToken } = useAuth();


async function submit(e) {
e.preventDefault();
setError(null);
try {
const data = await adminLogin(email, password);
const { token, user } = data;
if (!token) throw new Error('no token returned');
// mark role just in case
user.role = user.role || 'admin';
loginWithToken(token, user);
nav('/admin');
} catch (err) {
console.error('admin login', err);
setError(err.response?.data?.error || err.message || 'login failed');
}
}


return (
<div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
<h2 className="text-xl font-semibold mb-4">Admin Login</h2>
{error && <div className="bg-red-50 text-red-700 p-2 rounded mb-3">{error}</div>}
<form onSubmit={submit} className="space-y-3">
<input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
<input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border p-2 rounded" />
<button className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
</form>
</div>
);
}
// frontend/src/pages/Signup.jsx
// Fixed Signup page for RentRoam
// - Self-contained computeAge helper (prevents crash)
// - Uses useAuth for optional auto-login if backend returns token
// - Clean UI that matches Login (with visible text fix)

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Logo from '../components/Logo';
import { apiUrl } from '../services/apiBase';

// compute age safely from a yyyy-mm-dd string
function computeAgeFromDOB(dobStr) {
  if (!dobStr) return '';
  const d = new Date(dobStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 ? age : '';
}

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nextParam = params.get('next') || null;

  const [role, setRole] = useState('customer'); // customer | owner
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basic client-side email format check
  function isEmail(v) {
    return !!v && /\S+@\S+\.\S+/.test(v);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill the required fields: name, email, password.');
      return;
    }
    if (!isEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      // multipart because of possible profile picture
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('phone', phone);
      form.append('dob', dob);
      form.append('gender', gender);
      form.append('password', password);
      if (role === 'owner' && city) form.append('city', city);
      if (profileFile) form.append('profile_picture', profileFile);

      const endpoint = role === 'owner' ? '/api/owners/signup' : '/api/customers/signup';
      const res = await fetch(apiUrl(endpoint), { method: 'POST', body: form });

      let data = null;
      try { data = await res.json(); } catch (err) { /* ignore JSON parse error */ }

      if (!res.ok) {
        // show backend message when available
        const msg = data?.error || data?.message || `Signup failed (${res.status})`;
        throw new Error(msg);
      }

      // If backend returns token, log user in via context (optional)
      if (data && (data.token || data.accessToken)) {
        const token = data.token || data.accessToken;
        const user = data.user || { email, role };
        // use AuthContext.login in the simple token+user mode
        await login({ token, user });
        // customers should go to KYC page to finish aadhar/dl upload
        if (role === 'customer') navigate('/signup/kyc', { replace: true });
        else navigate('/owner', { replace: true });
        return;
      }

      // Otherwise go to login with success
      if (nextParam && nextParam.startsWith('/')) {
        navigate(`/login?next=${encodeURIComponent(nextParam)}`, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('signup error', err);
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left panel (Unchanged) */}
          <div
            className="flex flex-col items-start justify-center gap-4 p-6 md:p-10"
            style={{
              background: 'linear-gradient(135deg, var(--rr-orange,#FF6A00), var(--rr-orange-dark,#CC5500))',
              color: 'white'
            }}
          >
            <div className="md:hidden w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/Logo.png" alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
                <div className="text-lg font-bold">RentRoam</div>
              </div>
              <div className="text-white/90 text-sm font-medium">Sign up</div>
            </div>

            <div className="hidden md:flex md:flex-col md:items-start md:justify-center">
              <img src="/Logo.png" alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
              <h3 className="mt-4 text-2xl md:text-3xl font-extrabold">Create your account</h3>
              <p className="mt-2 text-sm md:text-base text-white/90 max-w-xs">
                Join RentRoam as a customer or owner. Customers must complete KYC before booking.
              </p>
            </div>
          </div>

          {/* Form column */}
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/Logo.png" alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
                <div>
                  <h2 className="text-xl font-semibold text-rr-black">Create account</h2>
                  <div className="text-sm text-gray-500">Sign up as customer or owner</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setRole('customer')}
                // 2. FIXED: Changed text-white to text-gray-900
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${role === 'customer' ? 'bg-rr-orange text-gray-900' : 'bg-gray-100'}`}
                type="button"
              >
                Customer
              </button>
              <button
                onClick={() => setRole('owner')}
                // 3. FIXED: Changed text-white to text-gray-900
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${role === 'owner' ? 'bg-rr-orange text-gray-900' : 'bg-gray-100'}`}
                type="button"
              >
                Owner
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">DOB</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition" />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition">
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input readOnly value={computeAgeFromDOB(dob)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50" />
              </div>
            </div>

            {role === 'owner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Owner city (e.g. Kota)"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                />
              </div>
            )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Profile picture (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} className="mt-1 block w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition" />
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="flex items-center gap-3">
                {/* 4. FIXED: Changed text-white to text-gray-900 */}
                <button type="submit" disabled={loading} className="btn-rr w-full sm:w-auto">
                  {loading ? 'Creating...' : 'Create account'}
                </button>

                <div className="text-sm text-gray-600">
                  Already registered? <Link to="/login" className="text-rr-orange hover:underline">Login</Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">© {new Date().getFullYear()} RentRoam — All rights reserved</div>
      </div>
    </div>
  );
}

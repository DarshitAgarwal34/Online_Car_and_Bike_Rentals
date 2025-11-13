// frontend/src/pages/Login.jsx
// RentRoam Login page — only email (no mobile), polished UI, clear buttons and visible "Customer" tab.
// Uses useAuth().login({ credentials, endpoint }) as implemented in your AuthContext.

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';

  const [role, setRole] = useState('customer'); // customer | owner | admin
  const [email, setEmail] = useState(''); // only email now
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function endpointForRole(r) {
    if (r === 'owner') return '/api/owners/login';
    if (r === 'admin') return '/api/admins/login';
    return '/api/customers/login';
  }

  function isEmail(v) {
    return !!v && /\S+@\S+\.\S+/.test(v);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setError('');

    const v = (email || '').trim();
    if (!v || !password) {
      setError('email and password required');
      return;
    }
    if (!isEmail(v)) {
      setError('please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const result = await login({
        credentials: { email: v, password },
        endpoint: endpointForRole(role)
      });

      if (result && result.ok === false) {
        setError(result.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      navigate(next, { replace: true });
    } catch (err) {
      console.error('login error', err);
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left: branding panel */}
          <div
            className="flex flex-col items-start justify-center gap-4 p-6 md:p-10"
            style={{
              background: 'linear-gradient(135deg, var(--rr-orange,#FF6A00), var(--rr-orange-dark,#CC5500))',
              color: 'white'
            }}
          >
            <div className="md:hidden w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="0.5" y="0.5" width="23" height="23" rx="5" fill="#ffffff20" />
                  <text x="12" y="16" textAnchor="middle" fontWeight="700" fontSize="10" fill="#fff">RR</text>
                </svg>
                <div className="text-lg font-bold">RentRoam</div>
              </div>
              <Link to="/signup" className="text-white/90 text-sm font-medium underline">Sign up</Link>
            </div>

            <div className="hidden md:flex md:flex-col md:items-start md:justify-center">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="0.5" y="0.5" width="23" height="23" rx="5" fill="#ffffff18" />
                <text x="12" y="16" textAnchor="middle" fontWeight="700" fontSize="12" fill="#fff">RR</text>
              </svg>

              <h3 className="mt-4 text-2xl md:text-3xl font-extrabold">Welcome to RentRoam</h3>
              <p className="mt-2 text-sm md:text-base text-white/90 max-w-xs">
                Find verified cars & bikes nearby. Manage bookings, KYC and listings from your dashboard.
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/vehicles"
                  className="px-4 py-2 rounded-lg font-medium bg-white/20 hover:bg-white/30 transition text-white shadow-sm"
                >
                  Browse vehicles
                </Link>
                <Link
                  to="/need-help"
                  className="px-4 py-2 rounded-lg font-medium bg-white/10 hover:bg-white/20 transition text-white"
                >
                  Need help
                </Link>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-rr-orange text-white flex items-center justify-center font-bold shadow">RR</div>
                <div>
                  <h2 className="text-xl font-semibold text-rr-black">Sign in</h2>
                  <div className="text-sm text-gray-500">Use email to sign in</div>
                </div>
              </div>
              <div className="hidden sm:block">
                <Link to="/signup" className="text-rr-orange font-medium">Create account</Link>
              </div>
            </div>

            {/* Role selector (Customer visible and active by default) */}
            <div className="flex gap-2 mb-5">
              {['customer', 'owner', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  type="button"
                  aria-pressed={role === r}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition
                    ${role === r ? 'bg-rr-orange text-gray-900 shadow-md ring-2 ring-rr-orange-dark/30' : 'bg-gray-100 text-gray-700 hover:scale-[1.02]'}`}
                >
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-[38px] text-sm text-gray-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                <div className="text-right mt-1">
                  <Link to="/forgot-password" className="text-sm text-rr-orange hover:underline">Forgot?</Link>
                </div>
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-3 rounded-lg bg-rr-orange text-gray-900 font-semibold text-sm shadow-lg hover:scale-[1.01] transition transform active:scale-95 ring-2 ring-rr-orange-dark/20"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="text-sm text-gray-600 text-center sm:text-left">
                  New to RentRoam? <Link to="/signup" className="text-rr-orange font-medium hover:underline">Create account</Link>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-px bg-gray-100 my-3" />
                <div className="text-xs text-gray-400 text-center">By signing in you agree to our Terms & Privacy</div>
              </div>
            </form>

            <div className="mt-6 text-center sm:hidden">
              Need help? <Link to="/need-help" className="text-rr-orange hover:underline">Contact support</Link>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} RentRoam — All rights reserved
        </div>
      </div>
    </div>
  );
}
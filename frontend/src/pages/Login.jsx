// frontend/src/pages/Login.jsx
// RentRoam Login page (fixed)
// - Email-only login (no mobile)
// - Ensures logo is visible at all sizes
// - Redirects to role-specific dashboard after successful login
// - Uses Tailwind v4 tokens (bg-[--rr-orange], text-[--rr-black]) and .btn-rr

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Logo from "../components/Logo";

// Use public logo
const LOGO_SRC = "/Logo.png";

export default function Login() {
  // get login and current user from AuthContext
  const { login, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nextParam = params.get("next") || null;

  // local UI state
  const [role, setRole] = useState("customer"); // customer | owner | admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // mapping role -> backend endpoint
  function endpointForRole(r) {
    if (r === "owner") return "/api/owners/login";
    if (r === "admin") return "/api/admins/login";
    return "/api/customers/login";
  }

  // very small validator
  function isEmail(v) {
    return !!v && /\S+@\S+\.\S+/.test(v);
  }

  // main submit handler
  async function handleSubmit(e) {
    e?.preventDefault();
    setError("");

    const v = (email || "").trim();
    if (!v || !password) {
      setError("Email and password are required");
      return;
    }
    if (!isEmail(v)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // call AuthContext.login - it should set token + user in context
      const result = await login({
        credentials: { email: v, password },
        endpoint: endpointForRole(role),
      });

      if (result && result.ok === false) {
        setError(result.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // redirect to next param if provided
      if (nextParam && nextParam.startsWith("/")) {
        navigate(nextParam, { replace: true });
        return;
      }

      // role-based fallback
      if (role === "customer") navigate("/customer/dashboard", { replace: true });
      else if (role === "owner") navigate("/owner", { replace: true });
      else if (role === "admin") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      console.error("login error", err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[--rr-gray]">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left: branding panel (always visible) */}
          <div
            className="flex flex-col items-start justify-center gap-4 p-6 md:p-10"
            style={{
              background:
                "linear-gradient(135deg, var(--rr-orange,#FF6A00), var(--rr-orange-dark,#CC5500))",
              color: "white",
            }}
          >
            {/* Visible at all sizes - small logo row */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={LOGO_SRC} alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
                <div className="text-lg font-bold">RentRoam</div>
              </div>
              <Link
                to="/signup"
                className="text-white/90 text-sm font-medium underline"
              >
                Sign up
              </Link>
            </div>

            {/* main marketing content (hidden on xs? no: keep visible) */}
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-extrabold">
                Welcome to RentRoam
              </h3>
              <p className="mt-2 text-sm text-white/90 max-w-xs">
                Find verified cars & bikes nearby. Manage bookings, KYC and
                listings from your dashboard.
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/vehicles"
                  className="px-4 py-2 rounded-lg font-medium bg-white/20 hover:bg-white/30 transition text-white shadow-sm"
                >
                  Browse
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
              {/* small square logo so brand remains visible even if left panel collapses */}
              <img src={LOGO_SRC} alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
              <div>
                <h2 className="text-xl font-semibold text-[--rr-black]">
                  Sign in
                </h2>
                <div className="text-sm text-gray-500">
                  Use your email to sign in
                </div>
              </div>
            </div>

              <div className="hidden sm:block">
                <Link to="/signup" className="text-[--rr-orange] font-medium">
                  Create account
                </Link>
              </div>
            </div>

            {/* Role selector */}
            <div className="flex gap-2 mb-5">
              {["customer", "owner", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  type="button"
                  aria-pressed={role === r}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    role === r
                      ? "bg-[--rr-orange] text-[--rr-black] shadow-md ring-2 ring-[--rr-orange-dark]/30"
                      : "bg-gray-100 text-gray-700 hover:scale-[1.02]"
                  }`}
                >
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[--rr-orange] transition"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[--rr-orange] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-[38px] text-sm text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                <div className="text-right mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[--rr-orange] hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-rr w-full sm:w-auto"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <div className="text-sm text-gray-600 text-center sm:text-left">
                  New to RentRoam?{" "}
                  <Link
                    to="/signup"
                    className="text-[--rr-orange] font-medium hover:underline"
                  >
                    Create account
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-px bg-gray-100 my-3" />
                <div className="text-xs text-gray-400 text-center">
                  By signing in you agree to our Terms & Privacy
                </div>
              </div>
            </form>

            <div className="mt-6 text-center sm:hidden">
              Need help?{" "}
              <Link
                to="/need-help"
                className="text-[--rr-orange] hover:underline"
              >
                Contact support
              </Link>
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

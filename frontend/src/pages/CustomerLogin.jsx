import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function isEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function CustomerLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nextParam = new URLSearchParams(location.search).get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "customer") navigate("/customer/dashboard", { replace: true });
    if (user?.role === "owner") navigate("/owner", { replace: true });
    if (user?.role === "admin") navigate("/admin", { replace: true });
  }, [navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!isEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await login({
      credentials: { email: normalizedEmail, password },
      endpoint: "/api/customers/login",
    });
    setLoading(false);

    if (!result?.ok) {
      setError(result?.error || "Login failed.");
      return;
    }

    if (nextParam && nextParam.startsWith("/")) {
      navigate(nextParam, { replace: true });
      return;
    }

    navigate("/customer/dashboard", { replace: true });
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div
            className="flex flex-col items-start justify-center gap-4 p-6 md:p-10"
            style={{
              background: "linear-gradient(135deg, var(--rr-orange,#FF6A00), var(--rr-orange-dark,#CC5500))",
              color: "white",
            }}
          >
            <div className="flex items-center gap-3">
              <img src="/Logo.png" alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
              <div className="text-lg font-bold">RentRoam</div>
            </div>
            <h3 className="mt-4 text-2xl md:text-3xl font-extrabold">Customer login</h3>
            <p className="mt-2 text-sm md:text-base text-white/90 max-w-xs">
              Access bookings, KYC progress, and your travel history from one place.
            </p>

            <div className="flex gap-2 mt-4 w-full max-w-xs">
              <button type="button" className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-900">
                Customer
              </button>
              <button
                type="button"
                onClick={() => navigate("/owner/login")}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-white/15 text-white hover:bg-white/25 transition"
              >
                Owner
              </button>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/Logo.png" alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
                <div>
                  <h2 className="text-xl font-semibold text-rr-black">Sign in</h2>
                  <div className="text-sm text-gray-500">Customer portal</div>
                </div>
              </div>
              <Link to="/owner/login" className="text-sm text-rr-orange hover:underline">
                Owner login
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="customer@rentroam.com"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password?role=customer" className="text-sm text-rr-orange hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 block w-full px-3 py-2 pr-20 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-[34px] text-sm text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {error ? <div className="text-sm text-red-500">{error}</div> : null}

              <div className="flex items-center gap-3">
                <button type="submit" disabled={loading} className="btn-rr w-full sm:w-auto">
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <div className="text-sm text-gray-600">
                  New here? <Link to="/signup" className="text-rr-orange hover:underline">Create account</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

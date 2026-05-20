import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const LOGO_SRC = "/Logo.png";

function isEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function RouteAdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
      endpoint: "/api/admins/login",
    });
    setLoading(false);

    if (!result?.ok) {
      setError(result?.error || "Login failed.");
      return;
    }

    navigate("/admin", { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-xl items-center justify-center">
      <div className="w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <img src={LOGO_SRC} alt="RentRoam" className="h-11 w-11 rounded-2xl object-cover shadow-md" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Restricted route</p>
            <h1 className="text-3xl font-black text-slate-950">Admin Login</h1>
          </div>
        </div>

        <p className="mb-6 text-sm leading-6 text-slate-500">
          Admin access stays route-based and is intentionally separated from the customer and owner login portals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@rentroam.com"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
            />
          </div>

          {error ? <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Signing in..." : "Sign in as admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

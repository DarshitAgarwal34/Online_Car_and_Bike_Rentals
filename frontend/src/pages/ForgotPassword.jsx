import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../auth/api";

const ROLE_META = {
  customer: {
    label: "Customer",
    endpoint: "/api/customers/forgot-password",
    loginPath: "/login",
    helper: "Use the same date of birth you submitted while creating the customer account.",
  },
  owner: {
    label: "Owner",
    endpoint: "/api/owners/forgot-password",
    loginPath: "/owner/login",
    helper: "Use the date of birth stored on the owner account for verification.",
  },
};

function isEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

function mapForgotPasswordError(message) {
  const raw = (message || "").trim();
  const normalized = raw.toLowerCase();
  const flattened = normalized.replace(/[_-]+/g, " ");

  if (!normalized) {
    return "We could not reset the password. Please verify your email and date of birth.";
  }

  if (
    flattened.includes("not found") ||
    flattened.includes("no account") ||
    flattened.includes("no user") ||
    flattened.includes("email does not exist")
  ) {
    return "Incorrect email or date of birth. Please check both details and try again.";
  }

  if (
    flattened.includes("incorrect dob") ||
    flattened.includes("invalid dob") ||
    flattened.includes("wrong dob") ||
    flattened.includes("date of birth") ||
    flattened.includes("dob mismatch")
  ) {
    return "The date of birth does not match this account. Please enter the same DOB used during signup.";
  }

  if (
    flattened.includes("invalid email") ||
    flattened.includes("incorrect email") ||
    flattened.includes("email mismatch")
  ) {
    return "The email address is incorrect. Please enter the registered email for this account.";
  }

  if (
    flattened.includes("email") &&
    (flattened.includes("dob") || flattened.includes("birth"))
  ) {
    return "The email and date of birth do not match our records. Please check both fields and try again.";
  }

  if (/^[a-z0-9_-]+$/.test(normalized)) {
    return "Incorrect email or date of birth. Please check both details and try again.";
  }

  return raw;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialRole = params.get("role");

  const [role, setRole] = useState(ROLE_META[initialRole] ? initialRole : "customer");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function selectRole(nextRole) {
    setRole(nextRole);
    setError("");
    setSuccess("");
    navigate(`/forgot-password?role=${nextRole}`, { replace: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !dob || !newPassword || !confirmPassword) {
      setError("Email, DOB, new password, and confirm password are required.");
      return;
    }

    if (!isEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(ROLE_META[role].endpoint, {
        method: "POST",
        body: JSON.stringify({
          email: normalizedEmail,
          dob,
          newPassword,
        }),
      });

      setSuccess("Password changed successfully. You can now login with the new password.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(mapForgotPasswordError(err.message));
    } finally {
      setLoading(false);
    }
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
              <img src="/Logo.png" alt="RentRoam" className="w-10 h-10 rounded-md object-cover" />
              <div className="text-lg font-bold">RentRoam</div>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold">Reset your password</h2>
            <p className="text-sm md:text-base text-white/90 max-w-sm">
              Email aur date of birth dono match honge tabhi password reset hoga. Admin reset yahan intentionally available nahi hai.
            </p>

            <div className="w-full max-w-sm rounded-xl bg-white/10 p-1">
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(ROLE_META).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectRole(key)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      role === key ? "bg-white text-gray-900" : "text-white/85 hover:bg-white/10"
                    }`}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-white/90">{ROLE_META[role].helper}</p>
          </div>

          <div className="p-6 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <img src="/Logo.png" alt="RentRoam" className="w-9 h-9 rounded-md object-cover" />
              <div>
                <h3 className="text-xl font-semibold text-rr-black">{ROLE_META[role].label} Reset</h3>
                <div className="text-sm text-gray-500">Verify account details before updating the password</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rr-orange transition"
                  />
                </div>
              </div>

              {error ? <div className="text-sm text-red-500">{error}</div> : null}
              {success ? <div className="text-sm text-green-600">{success}</div> : null}

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button type="submit" disabled={loading} className="btn-rr w-full sm:w-auto">
                  {loading ? "Updating..." : "Change password"}
                </button>
                <Link to={ROLE_META[role].loginPath} className="text-sm text-rr-orange hover:underline">
                  Back to {ROLE_META[role].label.toLowerCase()} login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// File: src/pages/BookNow.jsx
// Purpose: Book Now landing page
// - Shows login/signup CTA for guests
// - Guides customers to dashboard vehicles and booking procedure
// - Keeps RentRoam theme consistent with existing pages

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Logo from "../components/Logo";
import { apiFetch } from "../auth/api";

export default function BookNow() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isCustomer = user?.role === "customer";
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!user?.id || !isCustomer) return;
      try {
        const data = await apiFetch(`/api/customers/${user.id}`);
        if (!mounted) return;
        setProfile(data?.customer || data || null);
      } catch {
        if (!mounted) return;
        setProfile(null);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user?.id, isCustomer]);

  function goDashboardVehicles() {
    navigate("/customer/book");
  }

  const isVerified = Boolean(profile?.is_verified ?? user?.is_verified);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="bg-white rounded-2xl shadow-soft border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-3">
              <Logo size={44} showText={false} />
              <div>
                <div className="text-sm text-gray-500">RentRoam</div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-rr-black">
                  Book your ride in minutes
                </h1>
              </div>
            </div>

            <p className="mt-4 text-gray-600">
              Login or sign up, choose your vehicle from the dashboard, and
              complete the booking form. Fast, secure, and verified.
            </p>

            {!user ? (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/login?next=/book?step=vehicles" className="btn-rr text-center">
                  Login
                </Link>
                <Link to="/signup?next=/book?step=vehicles" className="px-4 py-2 rounded-lg border text-center">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {isCustomer ? (
                  isVerified ? (
                    <button onClick={goDashboardVehicles} className="btn-rr">
                      Start booking
                    </button>
                  ) : (
                    <Link to="/signup/kyc" className="btn-rr text-center">
                      Complete KYC
                    </Link>
                  )
                ) : (
                  <div className="text-sm text-gray-600">
                    You are logged in as <strong>{user?.role}</strong>. Switch to a
                    customer account to book vehicles.
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="min-h-[220px] md:min-h-full p-6 md:p-10 text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--rr-orange,#FF6A00), var(--rr-orange-dark,#CC5500))",
            }}
          >
            <h3 className="text-xl font-semibold">Quick steps</h3>
            <ol className="mt-4 space-y-3 text-sm text-white/90">
              <li>
                <span className="font-semibold">1.</span> Login or sign up
              </li>
              <li>
                <span className="font-semibold">2.</span> Go to dashboard and select a vehicle
              </li>
              <li>
                <span className="font-semibold">3.</span> Fill booking details and confirm
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-sm text-gray-500">Step 1</div>
          <div className="text-lg font-semibold text-rr-black">Login / Signup</div>
          <p className="text-sm text-gray-600 mt-2">
            Use your email to sign in. New user? Create an account and complete KYC.
          </p>
          {!user && (
            <div className="mt-3 flex gap-2">
              <Link to="/login?next=/book?step=vehicles" className="btn-rr text-sm px-3 py-2">
                Login
              </Link>
              <Link to="/signup?next=/book?step=vehicles" className="text-sm px-3 py-2 border rounded">
                Sign up
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-sm text-gray-500">Step 2</div>
          <div className="text-lg font-semibold text-rr-black">Select vehicle</div>
          <p className="text-sm text-gray-600 mt-2">
            Browse available cars and bikes from your customer dashboard.
          </p>
          <div className="mt-3">
            {isCustomer ? (
              isVerified ? (
                <button
                  onClick={goDashboardVehicles}
                  className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Start booking
                </button>
              ) : (
                <Link to="/signup/kyc" className="px-3 py-2 text-sm border rounded">
                  Complete KYC
                </Link>
              )
            ) : (
              <button
                onClick={() => navigate("/customer/book")}
                className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
              >
                View vehicles
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-sm text-gray-500">Step 3</div>
          <div className="text-lg font-semibold text-rr-black">Booking procedure</div>
          <p className="text-sm text-gray-600 mt-2">
            After selecting a vehicle, you will be taken to the booking form.
          </p>
          <div className="mt-3 text-xs text-gray-500">
            Tip: Clicking any "Book Now" button opens the booking form.
          </div>
        </div>
      </section>
    </div>
  );
}

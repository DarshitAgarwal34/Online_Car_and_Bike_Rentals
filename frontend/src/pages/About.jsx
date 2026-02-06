// File: src/pages/About.jsx
// Purpose: About Us page for RentRoam

import React from "react";
import Logo from "../components/Logo";

export default function About() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="bg-white rounded-2xl shadow-soft border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-3">
              <Logo size={44} showText={false} />
              <div>
                <div className="text-sm text-gray-500">About RentRoam</div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-rr-black">
                  Built for quick, trusted rentals
                </h1>
              </div>
            </div>
            <p className="mt-4 text-gray-600">
              RentRoam connects verified vehicle owners with customers who need
              a reliable ride. We focus on transparent pricing, secure booking,
              and a smooth pickup experience for both cars and bikes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="px-3 py-2 rounded-lg border text-sm bg-gray-50">
                Verified owners
              </div>
              <div className="px-3 py-2 rounded-lg border text-sm bg-gray-50">
                Fast bookings
              </div>
              <div className="px-3 py-2 rounded-lg border text-sm bg-gray-50">
                Secure payments
              </div>
            </div>
          </div>
          <div
            className="min-h-[220px] md:min-h-full p-6 md:p-10 text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--rr-orange,#FF6A00), var(--rr-orange-dark,#CC5500))",
            }}
          >
            <h3 className="text-xl font-semibold">Why we exist</h3>
            <p className="mt-3 text-sm text-white/90">
              Rentals should be simple. We bring clear vehicle details, trusted
              owners, and a single dashboard for everything: KYC, booking, and
              support.
            </p>
            <div className="mt-6 text-sm text-white/90">
              <div className="font-semibold">Mission</div>
              <div>
                Make local vehicle rentals as easy as booking a ride-share.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-sm text-gray-500">Value 1</div>
          <div className="text-lg font-semibold text-rr-black">Trust</div>
          <p className="text-sm text-gray-600 mt-2">
            KYC-backed customers and verified owners keep every booking safe.
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-sm text-gray-500">Value 2</div>
          <div className="text-lg font-semibold text-rr-black">Speed</div>
          <p className="text-sm text-gray-600 mt-2">
            Search, compare, and confirm within minutes from your dashboard.
          </p>
        </div>
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-sm text-gray-500">Value 3</div>
          <div className="text-lg font-semibold text-rr-black">Support</div>
          <p className="text-sm text-gray-600 mt-2">
            Dedicated help for onboarding, payments, and vehicle handover.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Get in touch</div>
            <div className="text-lg font-semibold text-rr-black">
              We’d love to hear from you
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Email us or visit our support center.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:rentroam@gmail.com" className="btn-rr text-center">
              Email support
            </a>
            <a href="tel:2345678901" className="px-4 py-2 rounded-lg border text-center">
              Call us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

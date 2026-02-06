// src/components/Layout.jsx
// Role-aware layout (responsive) — cleaned header breakpoints, improved mobile drawer,
// consistent CTAs (btn-rr), sticky header with safe spacing.

import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Logo from './Logo';

export default function Layout() {
  const { user, logout } = useAuth();
  const role = user?.role || 'guest';
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  function handleLogout() {
    logout();
    navigate('/');
  }

  const GUEST_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/vehicles', label: 'Vehicles' },
    { to: '/book', label: 'BookNow' },
    { to: '/about', label: 'About Us' },
    { to: '/need-help', label: 'NeedHelp' }
  ];

  const CUSTOMER_LINKS = [
    { to: '/customer/book', label: 'BookNow' },
    { to: '/kyc', label: 'KYC' },
    { to: '/history', label: 'History' },
    { to: '/customer/help', label: 'NeedHelp' }
  ];

  const OWNER_LINKS = [
    { to: '/owner/list-vehicle', label: 'List Vehicle' },
    { to: '/owner/vehicles', label: 'My Vehicles' },
    { to: '/owner/bookings', label: 'Bookings' },
    { to: '/owner/analytics', label: 'Analytics' },
    { to: '/owner/help', label: 'NeedHelp' }
  ];

  const ADMIN_LINKS = [
    { to: '/admin/customers', label: 'Customers' },
    { to: '/admin/owners', label: 'Owners' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/help', label: 'NeedHelp' },
    { to: '/admin/', label: 'Dashboard' }
  ];

  let links = GUEST_LINKS;
  if (role === 'customer') links = CUSTOMER_LINKS;
  if (role === 'owner') links = OWNER_LINKS;
  if (role === 'admin') links = ADMIN_LINKS;

  const homeLink =
    role === 'customer'
      ? '/customer/dashboard'
      : role === 'owner'
      ? '/owner'
      : role === 'admin'
      ? '/admin'
      : '/';

  if (isAdminArea) {
    return (
      <div className="min-h-screen bg-rr-gray">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-rr-gray">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-0">
              <Link to={homeLink} className="flex items-center gap-3 shrink-0">
                <Logo size={42} />
                <div className="hidden sm:block min-w-0">
                  <div className="text-lg font-extrabold text-rr-black truncate">RentRoam</div>
                  <div className="text-xs text-gray-500 truncate">Rent cars & bikes nearby</div>
                </div>
              </Link>
            </div>

            {/* Desktop nav: shows from md and up; carefully spaced so it doesn't collapse at 768 */}
            <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-gray-700 hover:text-rr-orange transition-colors font-medium text-sm whitespace-nowrap"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop auth actions */}
              <div className="hidden md:flex items-center gap-3">
                {role === 'guest' ? (
                  <>
                    <Link to="/login" className="px-3 py-2 rounded text-sm border border-gray-200 hover:bg-gray-50">
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-3 py-2 rounded text-sm bg-rr-orange text-white shadow-md hover:scale-105 transform transition duration-150 ring-2 ring-white/30 z-50 btn-rr"
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 truncate">Hi, <span className="font-semibold text-rr-black">{user?.name?.split(' ')[0] || user?.email}</span></div>
                    <button onClick={handleLogout} className="px-3 py-1 rounded bg-gray-100 text-sm">Logout</button>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setOpen(s => !s)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label="Toggle menu"
                aria-expanded={open}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer: large, touch-friendly, stacked links */}
        <div className={`${open ? 'block' : 'hidden'} md:hidden border-t bg-white`}>
          <div className="px-4 py-4 space-y-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-3 px-2 rounded hover:bg-gray-50 text-gray-800 font-medium">
                {l.label}
              </Link>
            ))}

            <div className="pt-2 border-t">
              {role === 'guest' ? (
                <div className="flex gap-3 mt-3">
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded border text-center text-gray-800">Login</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded text-center btn-rr">Sign up</Link>
                </div>
              ) : (
                <>
                  <div className="py-2 text-gray-700">Signed in as <strong>{user?.email}</strong></div>
                  <button onClick={() => { setOpen(false); handleLogout(); }} className="w-full text-left py-2 text-gray-700">Logout</button>
                </>
              )}
              <div className="mt-3 border-t pt-3">
                <Link to="/need-help" onClick={() => setOpen(false)} className="block py-2 text-gray-700">Need Help</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3">
                <Logo size={40} showText={false} />
                <div>
                  <h4 className="font-bold text-lg text-rr-black">RentRoam</h4>
                  <p className="text-sm text-gray-500">Rent cars & bikes near you</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Explore a wide range of vehicles, book instantly and roam freely. Verified owners, easy bookings and secure payments.</p>
            </div>

            <div>
              <h5 className="font-semibold mb-2">Links</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/vehicles" className="hover:text-rr-orange">Vehicles</Link></li>
                <li><Link to="/about" className="hover:text-rr-orange">About Us</Link></li>
                <li><Link to="/need-help" className="hover:text-rr-orange">Need Help</Link></li>
                <li><Link to="/book" className="hover:text-rr-orange">Book Now</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-2">Contact</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Phone: <a href="tel:2345678901" className="text-gray-800 hover:text-rr-orange">2345678901</a></div>
                <div>Email: <a href="mailto:rentroam@gmail.com" className="text-gray-800 hover:text-rr-orange">rentroam@gmail.com</a></div>
                <div>Location: <span className="text-gray-800">IIIT Kota, Ranpur, Kota, Rajasthan, 325003</span></div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-4 text-sm text-gray-500 text-center">© {new Date().getFullYear()} RentRoam — All rights reserved</div>
        </div>
      </footer>
    </div>
  );
}

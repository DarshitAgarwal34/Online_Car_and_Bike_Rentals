import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Logo from "../../components/Logo";
import { useState } from "react";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-rr-gray">
      {/* Mobile top bar */}
      <header className="md:hidden w-full bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} showText={false} />
            <div>
              <div className="text-sm text-gray-500">Admin</div>
              <div className="font-bold text-rr-black">RentRoam</div>
            </div>
          </div>
          <button
            onClick={() => setOpen((s) => !s)}
            className="px-3 py-2 rounded border text-sm"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
        {open && (
          <div className="border-t bg-white">
            <nav className="px-4 py-3 space-y-2">
              <NavItem to="/admin" end label="Dashboard" onClick={() => setOpen(false)} />
              <NavItem to="/admin/customers" label="Customers" onClick={() => setOpen(false)} />
              <NavItem to="/admin/owners" label="Owners" onClick={() => setOpen(false)} />
              <NavItem to="/admin/complaints" label="Complaints" onClick={() => setOpen(false)} />
              <NavItem to="/admin/help" label="Help" onClick={() => setOpen(false)} />
            </nav>
            <div className="px-4 pb-4">
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="w-full btn-rr"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col">
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <Logo size={38} showText={false} />
          <div>
            <div className="text-xs text-gray-500">Admin Console</div>
            <div className="font-bold text-rr-black">RentRoam</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem to="/admin" end label="Dashboard" />
          <NavItem to="/admin/customers" label="Customers" />
          <NavItem to="/admin/owners" label="Owners" />
          <NavItem to="/admin/complaints" label="Complaints" />
          <NavItem to="/admin/help" label="Help" />
        </nav>

        <button
          onClick={() => { logout(); navigate("/"); }}
          className="m-4 btn-rr"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-lg text-sm font-medium transition
        ${isActive
          ? "bg-orange-100 text-[--rr-orange] border border-[--rr-orange]/60 shadow-sm"
          : "text-gray-700 hover:text-[--rr-orange] hover:bg-orange-50 border border-transparent"}`
      }
    >
      {label}
    </NavLink>
  );
}

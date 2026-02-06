import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../auth/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch("/api/admins/stats").then(setStats).catch(() => setStats(null));
  }, []);

  const kycTotal = useMemo(() => {
    if (!stats) return 0;
    return (stats.kycSubmitted || 0) + (stats.kycNotSubmitted || 0);
  }, [stats]);

  if (!stats) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-soft p-6">
        <div className="text-sm text-gray-500">Admin Dashboard</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-rr-black">
          Welcome back, <span className="text-rr-orange">Admin</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Quick overview of registrations, KYC status, vehicles, and bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered Customers" value={stats.customers} />
        <StatCard title="Registered Owners" value={stats.owners} />
        <StatCard title="Total Vehicles" value={stats.vehicles} />
        <StatCard title="Total Bookings" value={stats.totalBookings ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-rr-black">KYC Overview</div>
            <div className="text-sm text-gray-500">Customers</div>
          </div>
          <div className="mt-4 space-y-4">
            <ProgressRow
              label="KYC Verified"
              value={stats.kycVerified || 0}
              total={kycTotal}
              color="bg-green-500"
            />
            <ProgressRow
              label="KYC Submitted (Pending)"
              value={(stats.kycSubmitted || 0) - (stats.kycVerified || 0)}
              total={kycTotal}
              color="bg-yellow-500"
            />
            <ProgressRow
              label="Not Submitted"
              value={stats.kycNotSubmitted || 0}
              total={kycTotal}
              color="bg-red-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="text-lg font-semibold text-rr-black">Quick Insights</div>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Verified KYC</span>
              <strong>{stats.kycVerified || 0}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending KYC</span>
              <strong>{(stats.kycSubmitted || 0) - (stats.kycVerified || 0)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Not Submitted</span>
              <strong>{stats.kycNotSubmitted || 0}</strong>
            </div>
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex items-center justify-between">
              <span>Vehicles / Owner</span>
              <strong>
                {stats.owners ? (stats.vehicles / stats.owners).toFixed(1) : "0.0"}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Bookings / Customer</span>
              <strong>
                {stats.customers
                  ? ((stats.totalBookings || 0) / stats.customers).toFixed(1)
                  : "0.0"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-extrabold text-rr-black">{value ?? 0}</div>
    </div>
  );
}

function ProgressRow({ label, value, total, color }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{label}</span>
        <span>{value} / {total || 0}</span>
      </div>
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

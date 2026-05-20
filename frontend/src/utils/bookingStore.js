const BOOKINGS_KEY = "rentroam_local_bookings";

function readBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  window.dispatchEvent(new CustomEvent("rentroam:bookings-changed"));
}

export function getLocalBookings() {
  if (typeof window === "undefined") return [];
  return readBookings();
}

export function createLocalBooking({
  booking,
  vehicle,
  customer,
  owner,
}) {
  const bookings = readBookings();
  const nextBooking = {
    ...booking,
    id: booking.id || `local-${Date.now()}`,
    vehicle_id: booking.vehicle_id || vehicle?.id || null,
    customer_id: booking.customer_id || customer?.id || null,
    owner_id: booking.owner_id || owner?.id || vehicle?.owner_id || null,
    vehicle: booking.vehicle || vehicle || null,
    customer: booking.customer || customer || null,
    owner: booking.owner || owner || null,
    status: booking.status || "confirmed",
    created_at: booking.created_at || new Date().toISOString(),
    source: booking.source || "local",
  };

  writeBookings([nextBooking, ...bookings]);
  return nextBooking;
}

export function mergeBookings(remoteBookings = [], localBookings = []) {
  const map = new Map();
  [...localBookings, ...remoteBookings].forEach((booking) => {
    if (!booking?.id) return;
    map.set(String(booking.id), booking);
  });

  return Array.from(map.values()).sort((a, b) => {
    const aTime = new Date(a.created_at || a.start_date || 0).getTime();
    const bTime = new Date(b.created_at || b.start_date || 0).getTime();
    return bTime - aTime;
  });
}

export function getBookedVehicleIds(bookings = getLocalBookings()) {
  const now = Date.now();

  return new Set(
    bookings
      .filter((booking) => {
        const status = String(booking?.status || "").toLowerCase();
        if (["cancelled", "completed", "rejected"].includes(status)) {
          return false;
        }

        const endDate = booking?.end_date ? new Date(booking.end_date).getTime() : null;
        return !endDate || Number.isNaN(endDate) || endDate >= now;
      })
      .map((booking) => Number(booking.vehicle_id || booking.vehicle?.id))
      .filter(Boolean)
  );
}

export function isVehicleBooked(vehicleId, bookings = getLocalBookings()) {
  return getBookedVehicleIds(bookings).has(Number(vehicleId));
}

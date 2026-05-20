// Central API URL helper
const RAW_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "";

export function apiUrl(path = "") {
  if (!path) return RAW_BASE || "/api";
  if (/^https?:\/\//i.test(path)) return path;

  if (RAW_BASE) {
    return path.startsWith("/") ? `${RAW_BASE}${path}` : `${RAW_BASE}/${path}`;
  }

  if (path.startsWith("/api")) return path;
  return path.startsWith("/") ? `/api${path}` : `/api/${path}`;
}

export const API_BASE = RAW_BASE || "/api";

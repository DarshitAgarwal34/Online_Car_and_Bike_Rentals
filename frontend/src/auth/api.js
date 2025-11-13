// File: src/auth/api.js
// Universal API wrapper - automatically attaches JWT from localStorage

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path.startsWith("/api") ? path : `/api${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Invalid JSON response from server");
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || "API Error");
  }

  return data;
}

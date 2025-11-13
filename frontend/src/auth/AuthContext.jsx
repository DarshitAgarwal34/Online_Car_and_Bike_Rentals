// frontend/src/auth/AuthContext.jsx
// Lightweight AuthContext for RentRoam
// - Stores token + user in localStorage
// - Exposes login({ token, user }) and logout()
// - Provides an api-aware wrapper hook useAuth()

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from './api'; // your api wrapper

// helper near top of file:
function inferRoleFromEndpoint(endpoint) {
  endpoint = (endpoint || '').toLowerCase();
  if (endpoint.includes('/owners') || endpoint.includes('/owner')) return 'owner';
  if (endpoint.includes('/admins') || endpoint.includes('/admin')) return 'admin';
  return 'customer';
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('rentroam_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('rentroam_token') || null);
  const [loading, setLoading] = useState(false);

  // whenever token/user changes, persist to localStorage
  useEffect(() => {
    if (token) localStorage.setItem('rentroam_token', token);
    else localStorage.removeItem('rentroam_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('rentroam_user', JSON.stringify(user));
    else localStorage.removeItem('rentroam_user');
  }, [user]);

  // login: accept credential response or explicit token+user
  async function login({ token: t, user: u, credentials, endpoint }) {
    // if caller passed token+user, accept that
    if (t && u) {
      setToken(t);
      setUser(u);
      return { ok: true };
    }

    // --- NEW LOGIC INSERTED HERE ---
    if (!credentials || !endpoint) throw new Error('Missing credentials or endpoint');
    
    setLoading(true);
    try {
      const resp = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      // adapt to different backend shapes
      const tokenFromServer = resp.token || resp.accessToken || resp.data?.token;
      let userFromServer = resp.user || resp.data?.user || null;

      // If backend didn't return user object, make a minimal user object
      if (!userFromServer) {
        userFromServer = {
          email: credentials.email || credentials.phone || null,
          role: credentials.role || inferRoleFromEndpoint(endpoint) // fallback
        };
      }

      // If role still missing, try infer from endpoint (e.g. '/api/owners/login')
      if (!userFromServer.role) {
        userFromServer.role = inferRoleFromEndpoint(endpoint);
      }

      if (!tokenFromServer) throw new Error('Login response missing token');

      setToken(tokenFromServer);
      setUser(userFromServer);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
    // --- END OF INSERTED LOGIC ---
  }

  function logout() {
    setToken(null);
    setUser(null);
    // keep localStorage cleaned by useEffect handlers
  }

  function getToken() {
    return token;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
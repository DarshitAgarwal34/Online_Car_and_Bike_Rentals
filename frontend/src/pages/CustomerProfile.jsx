// src/pages/CustomerProfile.jsx
import React from 'react';
import { useAuth } from '../auth/AuthContext';

export default function CustomerProfile() {
  const { user } = useAuth();
  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">My profile</h2>
      <div><strong>Name:</strong> {user.name}</div>
      <div><strong>Email:</strong> {user.email}</div>
      <div><strong>Phone:</strong> {user.phone || '—'}</div>
      <div><strong>Role:</strong> {user.role}</div>
      {/* Add more fields as needed */}
    </div>
  );
}

// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [role, setRole] = useState('customer'); // 'customer' or 'owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [profile_picture, setProfilePicture] = useState('');
  const nav = useNavigate();

  function next() {
    if (!name || !email) return alert('enter name and email');
    const regData = { role, name, email, phone, dob, profile_picture };
    localStorage.setItem('regData', JSON.stringify(regData));
    nav('/signup/password');
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Sign up</h2>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Account type</label>
        <div className="flex gap-4">
          <label className={`p-2 border rounded cursor-pointer ${role === 'customer' ? 'bg-indigo-50' : ''}`}>
            <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} /> Customer
          </label>
          <label className={`p-2 border rounded cursor-pointer ${role === 'owner' ? 'bg-indigo-50' : ''}`}>
            <input type="radio" name="role" value="owner" checked={role === 'owner'} onChange={() => setRole('owner')} /> Owner
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full border p-2 rounded" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Contact number" className="w-full border p-2 rounded" />
        <input value={dob} onChange={e => setDob(e.target.value)} placeholder="Date of birth (YYYY-MM-DD)" className="w-full border p-2 rounded" />
        <input value={profile_picture} onChange={e => setProfilePicture(e.target.value)} placeholder="Profile picture URL (optional)" className="w-full border p-2 rounded" />
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded">Next</button>
      </div>
    </div>
  );
}

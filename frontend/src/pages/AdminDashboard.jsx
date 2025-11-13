/* -----------------
File: src/pages/AdminDashboard.jsx
----------------- */
import React, { useEffect, useState } from 'react';
import { fetchAdmins } from '../services/adminApi';
import { useAuth } from '../auth/AuthContext';


export default function AdminDashboard() {
const [admins, setAdmins] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const { user } = useAuth();


useEffect(() => {
let mounted = true;
setLoading(true);
fetchAdmins(page).then(data => {
if (!mounted) return;
setAdmins(data.admins || []);
setLoading(false);
}).catch(err => {
console.error('fetch admins', err);
setLoading(false);
});
return () => { mounted = false; };
}, [page]);


return (
<div>
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-semibold">Admin Dashboard</h2>
<div className="text-sm text-gray-600">Signed in as <strong>{user?.email}</strong></div>
</div>


<div className="bg-white rounded shadow p-4">
{loading ? (
<div>Loading admins...</div>
) : (
<table className="w-full text-sm table-auto">
<thead>
<tr className="text-left text-gray-600">
<th className="p-2">ID</th>
<th className="p-2">Name</th>
<th className="p-2">Email</th>
<th className="p-2">Role</th>
<th className="p-2">Active</th>
</tr>
</thead>
<tbody>
{admins.map(a => (
<tr key={a.id} className="border-t">
<td className="p-2">{a.id}</td>
<td className="p-2">{a.name}</td>
<td className="p-2">{a.email}</td>
<td className="p-2">{a.role}</td>
<td className="p-2">{a.is_active ? 'Yes' : 'No'}</td>
</tr>
))}
</tbody>
</table>
)}
</div>


<div className="mt-4 flex justify-between">
<button className="px-4 py-2 border rounded" onClick={() => setPage(p => Math.max(1, p-1))}>Previous</button>
<div>Page {page}</div>
<button className="px-4 py-2 border rounded" onClick={() => setPage(p => p+1)}>Next</button>
</div>
</div>
);
}
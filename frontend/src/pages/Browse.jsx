import React from 'react';
import { Link } from 'react-router-dom';


export default function Browse() {
// Placeholder static data; we'll later fetch from the backend
const sample = [
{ id: 1, title: 'Hyundai Verna', price: 2000, location: 'Jaipur' },
{ id: 2, title: 'Hero Splendor', price: 400, location: 'Jaipur' }
];


return (
<div>
<h2 className="text-2xl font-semibold mb-4">Browse listings</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
{sample.map(v => (
<div key={v.id} className="bg-white p-4 rounded-lg shadow">
<div className="flex gap-4">
<div className="w-28 h-20 bg-gray-200 rounded-md" />
<div className="flex-1">
<h3 className="font-semibold">{v.title}</h3>
<p className="text-sm text-gray-500">{v.location}</p>
<div className="mt-2 flex items-center justify-between">
<div className="text-indigo-600 font-bold">₹{v.price}/day</div>
<Link to={`/vehicles/${v.id}`} className="text-sm text-indigo-600">View</Link>
</div>
</div>
</div>
</div>
))}
</div>
</div>
);
}
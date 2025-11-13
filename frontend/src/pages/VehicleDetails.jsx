/* -----------------
File: src/pages/VehicleDetails.jsx
----------------- */
import React from 'react';
import { useParams } from 'react-router-dom';


export default function VehicleDetails() {
const { id } = useParams();


return (
<div>
<h2 className="text-2xl font-semibold mb-4">Vehicle #{id}</h2>
<p className="text-gray-600">Details will be loaded from backend here.</p>
</div>
);
}
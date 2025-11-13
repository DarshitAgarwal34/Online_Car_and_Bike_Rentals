import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupPassword from './pages/SignupPassword';
import CustomerKYC from './pages/CustomerKYC';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import VehicleDetails from './pages/VehicleDetails';
import ProtectedRoute from './auth/ProtectedRoute';
import CustomerProfile from './pages/CustomerProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Vehicles from './pages/Vehicles';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All main pages use the Layout (header/footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Browse />} />
          <Route path="vehicles" element={<Vehicles />} />

          {/* Auth routes */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="signup/password" element={<SignupPassword />} />
          <Route path="signup/kyc" element={<CustomerKYC />} />
          <Route path="owner/login" element={<OwnerLogin />} />

          {/* Protected owner dashboard */}
          <Route
            path="owner"
            element={
              <ProtectedRoute /* role="owner" */>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />

          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />

          <Route path="vehicles/:id" element={<VehicleDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

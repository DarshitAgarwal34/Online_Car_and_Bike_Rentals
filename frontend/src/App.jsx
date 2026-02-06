import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupPassword from "./pages/SignupPassword";
import CustomerKYC from "./pages/CustomerKYC";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerDashboard from "./pages/OwnerDashboard";
import VehicleDetails from "./pages/VehicleDetails";
import ProtectedRoute from "./auth/ProtectedRoute";
import CustomerProfile from "./pages/CustomerProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOwners from "./pages/admin/AdminOwners";
import AdminCustomers from "./pages/admin/AdminCustomers";
import Vehicles from "./pages/Vehicles";
import CustomerDashboard from "./pages/CustomerDashboard";
import BookNow from "./pages/BookNow";
import BookVehicle from "./pages/BookVehicle";
import About from "./pages/About";
import NeedHelp from "./pages/NeedHelp";
import OwnerListVehicle from "./pages/OwnerListVehicle";
import OwnerVehicles from "./pages/OwnerVehicles";
import OwnerBookings from "./pages/OwnerBookings";
import CustomerBookingFlow from "./pages/CustomerBookingFlow";
import CustomerHelp from "./pages/CustomerHelp";
import OwnerHelp from "./pages/OwnerHelp";
import CustomerHistory from "./pages/CustomerHistory";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminHelp from "./pages/admin/AdminHelp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Browse />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="book" element={<BookNow />} />
          <Route path="book/:id" element={<BookVehicle />} />
          <Route path="about" element={<About />} />
          <Route path="need-help" element={<NeedHelp />} />

          {/* Auth routes */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="signup/password" element={<SignupPassword />} />
          <Route path="signup/kyc" element={<CustomerKYC />} />
          <Route path="owner/login" element={<OwnerLogin />} />

          {/* Customer */}
          <Route
            path="customer/dashboard"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute role="customer">
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="kyc"
            element={
              <ProtectedRoute role="customer">
                <CustomerKYC />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute role="customer">
                <CustomerHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="customer/help"
            element={
              <ProtectedRoute role="customer">
                <CustomerHelp />
              </ProtectedRoute>
            }
          />

          {/* Owner */}
          <Route
            path="owner"
            element={
              <ProtectedRoute role="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/list-vehicle"
            element={
              <ProtectedRoute role="owner">
                <OwnerListVehicle />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/vehicles"
            element={
              <ProtectedRoute role="owner">
                <OwnerVehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/help"
            element={
              <ProtectedRoute role="owner">
                <OwnerHelp />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/bookings"
            element={
              <ProtectedRoute role="owner">
                <OwnerBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/analytics"
            element={
              <ProtectedRoute role="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="customer/book"
            element={
              <ProtectedRoute role="customer">
                <CustomerBookingFlow />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="owners" element={<AdminOwners />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="help" element={<AdminHelp />} />
          </Route>

          <Route path="vehicles/:id" element={<VehicleDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

# 🚀 RentRoam – Frontend

RentRoam is a role-based vehicle rental platform frontend designed to deliver a smooth, modern, and responsive experience for customers, vehicle owners, and administrators.

This repository contains only the frontend layer, focusing on UI/UX, client-side logic, and seamless API integration.

The design philosophy is clean, professional, and slightly adventurous, using an orange–black–white color theme.

---

## 🧭 Project Overview

RentRoam allows users to:
- Browse rental vehicles
- Book vehicles based on city, time, and availability
- Manage bookings and KYC (for customers)
- List and manage vehicles (for owners)
- Monitor platform-wide analytics (for admins)

The UI dynamically changes based on the logged-in user’s role.

---

## 🎨 UI / UX Design Philosophy

- Role-specific navigation bars
- Card-based layouts
- Grid-based responsiveness
- Sliding animations for Login & Signup
- Minimal clutter, maximum usability
- Strong visual hierarchy

**Color Theme**
- Orange (primary accent)
- Black (structure & contrast)
- White (clarity & spacing)

---

## 📄 Pages & Features

### 1️⃣ Welcome / Home Page (Public)

**Navigation Bar**
- RentRoam (logo + name)
- Home
- Vehicles
- Book Now
- About Us
- Login / Sign Up
- Need Help

**Main Content**
- Hero section with landscape bike image
- Engaging welcome tagline
- Preview of available vehicles
- Clear call-to-action buttons

**Footer**
- Contact Us  
  - Phone: 9057216634  
  - Email: rentroam@gmail.com  
  - Location:  
    565, Block C, Boys Hostel, IIIT Kota,  
    Ranpur, Kota, Rajasthan – 325003
- Useful links
- Copyright

---

### 2️⃣ Vehicles Page (Public)

- Responsive grid-based vehicle cards
- Layout:
  - Desktop: 3 columns
  - Tablet: 2 columns
  - Mobile: 1 column
- Each card includes:
  - Vehicle image
  - Name & model
  - Price per day
  - Book Now button

**Booking Flow**
- Not logged in → Redirect to Login
- Logged in customer → Booking process

Vehicle data is fetched dynamically via backend APIs (JSON).

---

### 3️⃣ Authentication

#### Login Page
- Centralized card layout
- Roles:
  - Customer
  - Owner
  - Admin
- Login using:
  - Email + Password
  - Mobile + Password
- Features:
  - Forgot Password
  - Redirect to Signup

**Forgot Password Verification**
- Email
- Mobile
- Date of Birth

---

#### Signup Page

- Separate signup for:
  - Customer
  - Owner

**Customer Signup Fields**
- Name
- Email
- Phone
- Password
- Date of Birth (calendar input)
- Gender
- Profile picture upload
- Auto-calculated age

**KYC Note**
- Aadhaar & Driving License are not mandatory during signup
- Required later for booking

Login and Signup share the same UI with sliding card animations.

---

## 👤 Role-Based Interfaces

---

### 🧑‍💼 Customer Role

**Navigation**
- RentRoam + logo
- KYC
- Book Now
- History
- Welcome message

**Customer Dashboard**
- City selection
- Pickup & drop date/time
- Search available vehicles
- Featured vehicle cards

**KYC Page**
- View verified details if approved
- Upload Aadhaar & Driving License if not verified
- Booking restricted until KYC verification

**Booking**
- Confirm vehicle
- Confirm pickup/drop
- Final price calculation
- Booking confirmation

**History**
- List of all previous bookings

---

### 🚗 Owner Role

**Navigation**
- RentRoam + logo
- List Vehicle
- Remove Vehicle
- Availability
- Notifications
- Total Bookings

**Owner Dashboard**
- Welcome message
- Vehicle summary cards
- Basic analytics

**List Vehicle**
- Vehicle type
- Make, model, year
- Registration number
- Color
- Seating capacity
- Condition:
  - new
  - excellent
  - good
  - fair
  - poor
  - needs_maintenance
- Daily rental price

**Remove Vehicle**
- View and delete owned vehicles

**Availability**
- Toggle vehicle availability
- Auto-lock booked vehicles

**Total Bookings**
- Total bookings count
- Total profit
- Interactive charts & graphs

---

### 🛡️ Admin Role

**Navigation**
- RentRoam + logo
- Customers
- Owners

**Admin Dashboard**
- Total customers
- Total owners
- Total bookings
- Total vehicles
- KYC verified vs unverified users
- Visual analytics

**Customer Management**
- View all customers
- Full customer details
- Edit or remove customers
- View customer-related complaints

**Owner Management**
- View all owners
- Owner details
- Edit or remove owners
- View owner-related complaints

---

### ❓ Need Help Page

- FAQ section
- Register Complaint form:
  - Complaint against: Customer / Owner
  - Subject
  - Description
  - File upload (0–3 files)

Complaints are routed to relevant dashboards.

---

## 🔗 Backend Integration

- REST API architecture
- JWT-based authentication
- Role-based routing and guards
- Real-time availability updates

Minor backend changes may be required to support all features.

---

## 📱 Responsiveness

- Fully responsive across:
  - Desktop
  - Tablet
  - Mobile
- Adaptive grid layouts
- Touch-friendly components

---

## 📌 Notes

- Frontend repository only
- Backend handled separately
- Placeholder images and logos used

---

## ✨ Future Enhancements

- Dark mode
- Real-time notifications
- Advanced filters
- Multi-language support

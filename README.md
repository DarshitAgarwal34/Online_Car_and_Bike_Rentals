# Online Car and Bike Rental

Full-stack project with a Node/Express + MySQL backend and a Vite + React frontend for managing vehicle rentals.

## What’s Inside
- Backend REST API for customers, owners, admins, and vehicles
- File uploads served from `/uploads`
- Frontend SPA built with React, Vite, and Tailwind CSS

## Tech Stack
- Backend: Node.js, Express, MySQL (mysql2), JWT auth
- Frontend: React, Vite, Tailwind CSS

## Requirements
- Node.js 18+ (or a compatible LTS)
- npm
- MySQL server

## Setup

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Create a backend environment file `backend/.env`:
```bash
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=online_rentals_db
DB_PORT=3306
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
AADHAR_KEY=your_aadhar_secret
VITE_API_URL=http://localhost:5000
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Run (Development)

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```

By default, the backend runs on `http://localhost:5000` and the Vite dev server runs on `http://localhost:5173`.

## Scripts

Backend:
- `npm run dev` — start API with nodemon
- `npm start` — start API with node

Frontend:
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Notes
- Database schema/migrations are not included in this repo. Create the required tables before running the API.

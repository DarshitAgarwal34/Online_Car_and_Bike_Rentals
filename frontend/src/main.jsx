import React from 'react';
import { Analytics } from "@vercel/analytics/react"
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './auth/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Analytics />
    </AuthProvider>
  </React.StrictMode>
);

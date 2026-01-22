import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Simple test components
const Login = () => <div className="p-8"><h1 className="text-2xl">Login Page</h1></div>;
const Register = () => <div className="p-8"><h1 className="text-2xl">Register Page</h1></div>;
const Dashboard = () => <div className="p-8"><h1 className="text-2xl">Dashboard</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

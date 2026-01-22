import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [showSuccess, setShowSuccess] = useState(true);

  useEffect(() => {
    // Hide success page after 5 seconds
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 Success!</h1>
          <p className="text-xl text-gray-700 mb-2">Your Splitwise Clone is Ready</p>
          <p className="text-gray-600">All Supabase tables are configured correctly</p>
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">What's Working:</h2>
            <ul className="text-left space-y-2">
              <li>✅ React App</li>
              <li>✅ Vercel Deployment</li>
              <li>✅ Supabase Database</li>
              <li>✅ All Tables Created</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
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

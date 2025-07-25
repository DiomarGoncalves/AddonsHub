import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddonDetails from './pages/AddonDetails';
import UploadAddon from './pages/UploadAddon';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/addon/:id" element={<AddonDetails />} />
              <Route path="/upload" element={<UploadAddon />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
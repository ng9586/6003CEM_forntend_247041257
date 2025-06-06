import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Hotels from './pages/Hotels';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Bookings from './pages/Booking';
import Navbar from './components/Navbar';
import { UserProvider, useUser } from './contexts/UserContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function AppContent() {
  const { setProfile } = useUser();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProfile(res.data))
        .catch(() => setProfile(null));
    }
  }, [setProfile]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hotels />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;

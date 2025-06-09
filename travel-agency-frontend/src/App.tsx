import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProfile(res.data))
        .catch(error => {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setProfile(null);
            navigate('/login');
          } else {
            setProfile(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [setProfile, navigate]);

  if (loading) return <p>載入中...</p>;

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

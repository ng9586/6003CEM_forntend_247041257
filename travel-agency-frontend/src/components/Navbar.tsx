// src/components/AppNavbar.tsx
import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const API_BASE = import.meta.env.VITE_IMAGE_BASE_URL.replace(/\/api$/, '');

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const { profile } = useUser();

  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  useEffect(() => {
    if (profile?.avatarUrl) setAvatarTimestamp(Date.now());
  }, [profile?.avatarUrl]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const avatarSrc = profile?.avatarUrl
  ? `${API_BASE}${profile.avatarUrl.startsWith('/') ? '' : '/'}${profile.avatarUrl}?t=${avatarTimestamp}`
  : 'https://via.placeholder.com/40';

console.log("🤖 profile.avatarUrl =", profile?.avatarUrl);
console.log("🧠 avatarSrc =", avatarSrc);



  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Travel Agency</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login">登入</Nav.Link>
                <Nav.Link as={Link} to="/register">註冊</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/">酒店清單</Nav.Link>
                <Nav.Link as={Link} to="/bookings">我的預約</Nav.Link>
                <Nav.Link as={Link} to="/profile">個人資料</Nav.Link>
                {role === 'operator' && <Nav.Link as={Link} to="/dashboard">營運管理</Nav.Link>}
                {profile && (
                  <div className="d-flex align-items-center mx-2">
                    <Image
                      src={avatarSrc}
                      alt="Avatar"
                      roundedCircle
                      width={40}
                      height={40}
                      style={{ objectFit: 'cover' }}
                    />
                    <span className="text-white ms-2">{profile.username}</span>
                  </div>
                )}
                <Button variant="outline-light" className="ms-2" onClick={handleLogout}>
                  登出
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

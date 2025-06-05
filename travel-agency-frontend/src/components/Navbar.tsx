import React, { useEffect, useState } from 'react';
import { Navbar, Container, Nav, Button, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Profile {
  username: string;
  avatarUrl: string;
}

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [profile, setProfile] = useState<Profile | null>(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 取得用戶資料（頭像和名稱）
  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setProfile(res.data))
        .catch(() => setProfile(null));
    }
  }, [token]);

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

                {role === 'operator' && (
                  <Nav.Link as={Link} to="/dashboard">營運管理</Nav.Link>
                )}

                {/* 顯示用戶頭像 + 名稱 */}
                {profile && (
                  <div className="d-flex align-items-center mx-2">
                    <Image
                      src={`${API_BASE}${profile.avatarUrl}`}
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

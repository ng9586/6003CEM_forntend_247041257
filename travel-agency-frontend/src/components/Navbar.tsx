import React from 'react';
import { Navbar, Container, Nav, Button, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const API_BASE = import.meta.env.VITE_IMAGE_BASE_URL || '';

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const { profile } = useUser();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontWeight: '700',
            fontSize: '1.8rem',
            letterSpacing: '1.2px',
            color: '#00aaff',
            userSelect: 'none',
          }}
        >
          Wanderlust Travel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center" style={{ gap: '1rem' }}>
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" className="px-3">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="px-3">
                  Register
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/" className="px-3">
                  Hotel Search
                </Nav.Link>
                <Nav.Link as={Link} to="/localHotels" className="px-3">
                  Hotel Reservation
                </Nav.Link>
                <Nav.Link as={Link} to="/bookings" className="px-3">
                  Hotel Reservation
                </Nav.Link>
                <Nav.Link as={Link} to="/favorites" className="px-3">
                  Collect
                </Nav.Link>
                <Nav.Link as={Link} to="/flights" className="px-3">
                  Flight Status
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="px-3">
                  Profile
                </Nav.Link>
                {role === 'operator' && (
                  <Nav.Link as={Link} to="/dashboard" className="px-3">
                    operations management
                  </Nav.Link>
                )}
                {profile && (
                  <div className="d-flex align-items-center mx-3" style={{ userSelect: 'none' }}>
                    <Image
                      src={
                        profile.avatarUrl
                          ? `${API_BASE}${profile.avatarUrl}?t=${Date.now()}`
                          : 'https://via.placeholder.com/40'
                      }
                      alt="Avatar"
                      roundedCircle
                      width={40}
                      height={40}
                      style={{ objectFit: 'cover', boxShadow: '0 0 6px rgba(0,0,0,0.3)' }}
                    />
                    <span
                      className="text-white ms-2"
                      style={{ fontWeight: 600, fontSize: '1rem', whiteSpace: 'nowrap' }}
                    >
                      {profile.username}
                    </span>
                  </div>
                )}
                <Button
                  variant="outline-light"
                  className="ms-2"
                  onClick={handleLogout}
                  style={{
                    borderWidth: 1.5,
                    fontWeight: 600,
                    padding: '4px 14px',
                    transition: 'background-color 0.3s, color 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#00aaff';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#fff';
                  }}
                >
                  Sign out
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

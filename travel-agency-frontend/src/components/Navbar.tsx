import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Travel Agency</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            {!token && (
              <>
                <Nav.Link as={Link} to="/login">登入</Nav.Link>
                <Nav.Link as={Link} to="/register">註冊</Nav.Link>
              </>
            )}
            {token && (
              <>
                <Nav.Link as={Link} to="/hotels">酒店清單</Nav.Link>
                {role === 'operator' && (
                  <Nav.Link as={Link} to="/dashboard">營運管理</Nav.Link>
                )}
                <Nav.Link onClick={handleLogout}>登出</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

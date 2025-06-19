import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      alert('登入成功！');
      navigate(role === 'operator' ? '/dashboard' : '/hotels');
    } catch (err: any) {
      setError(err.response?.data?.message || '登入失敗');
    }
  };

  return (
    <Container
      style={{
        maxWidth: '400px',
        marginTop: '80px',
        padding: '30px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2
        className="mb-4"
        style={{ fontWeight: '700', color: '#004080', textAlign: 'center', fontSize: '2rem' }}
      >
        登入
      </h2>
      {error && (
        <Alert variant="danger" className="mb-4" style={{ fontWeight: '600' }}>
          {error}
        </Alert>
      )}
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email 地址</Form.Label>
          <Form.Control
            type="email"
            placeholder="輸入 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ borderRadius: 8, fontSize: 16 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#004080')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '')}
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="formPassword">
          <Form.Label>密碼</Form.Label>
          <Form.Control
            type="password"
            placeholder="輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ borderRadius: 8, fontSize: 16 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#004080')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '')}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100"
          style={{
            background: 'linear-gradient(45deg, #004080, #00264d)',
            border: 'none',
            fontWeight: '700',
            fontSize: 18,
            padding: '10px 0',
            boxShadow: '0 6px 16px rgba(0,64,128,0.6)',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00264d')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(45deg, #004080, #00264d)')}
        >
          登入
        </Button>
      </Form>
    </Container>
  );
};

export default Login;

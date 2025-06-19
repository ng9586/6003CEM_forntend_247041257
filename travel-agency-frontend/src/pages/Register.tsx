import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpCode, setSignUpCode] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', {
        email,
        password,
        signUpCode,
      });

      alert('註冊成功！請登入');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '註冊失敗');
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
        註冊
      </h2>
      {error && (
        <Alert variant="danger" className="mb-4" style={{ fontWeight: '600' }}>
          {error}
        </Alert>
      )}
      <Form onSubmit={handleRegister}>
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

        <Form.Group className="mb-3" controlId="formPassword">
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

        <Form.Group className="mb-4" controlId="formCode">
          <Form.Label>註冊代碼（SignUpCode）</Form.Label>
          <Form.Control
            type="text"
            placeholder="例如：agency2025"
            value={signUpCode}
            onChange={(e) => setSignUpCode(e.target.value)}
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
          註冊
        </Button>
      </Form>
    </Container>
  );
};

export default Register;

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
    <Container style={{ maxWidth: '500px', marginTop: '50px' }}>
      <h2 className="mb-4">註冊</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleRegister}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email 地址</Form.Label>
          <Form.Control
            type="email"
            placeholder="輸入 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formCode">
          <Form.Label>註冊代碼（SignUpCode）</Form.Label>
          <Form.Control
            type="text"
            placeholder="例如：agency2025"
            value={signUpCode}
            onChange={(e) => setSignUpCode(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          註冊
        </Button>
      </Form>
    </Container>
  );
};

export default Register;

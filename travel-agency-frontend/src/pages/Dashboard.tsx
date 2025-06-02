import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/hotels',
        { name, location, price: Number(price), description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('酒店已成功新增！');
      setName('');
      setLocation('');
      setPrice('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || '新增酒店失敗');
    }
  };

  return (
    <Container style={{ maxWidth: '600px', marginTop: '50px' }}>
      <h2 className="mb-4">營運者管理酒店</h2>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleAddHotel}>
        <Form.Group className="mb-3">
          <Form.Label>酒店名稱</Form.Label>
          <Form.Control
            type="text"
            placeholder="輸入酒店名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>地點</Form.Label>
          <Form.Control
            type="text"
            placeholder="輸入地點"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>價格</Form.Label>
          <Form.Control
            type="number"
            placeholder="輸入價格"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>描述</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="酒店描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          新增酒店
        </Button>
      </Form>
    </Container>
  );
};

export default Dashboard;

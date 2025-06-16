import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import {
  fetchLocalHotels,
  createLocalHotel,
  updateLocalHotel,
  deleteLocalHotel,
} from '../services/localHotelApi';

const Dashboard: React.FC = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const res = await fetchLocalHotels();
      setHotels(res.data);
    } catch {
      setError('無法取得酒店資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const resetForm = () => {
    setName('');
    setLocation('');
    setPrice('');
    setDescription('');
    setImageFile(null);
    setEditingHotel(null);
  };

  const handleShowAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleShowEdit = (hotel: any) => {
    setEditingHotel(hotel);
    setName(hotel.name);
    setLocation(hotel.location);
    setPrice(hotel.price.toString());
    setDescription(hotel.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('location', location);
      formData.append('price', price);
      formData.append('description', description);
      if (imageFile) formData.append('image', imageFile);

      if (editingHotel) {
        await updateLocalHotel(editingHotel._id, formData);
      } else {
        await createLocalHotel(formData);
      }
      setShowModal(false);
      loadHotels();
    } catch {
      setError('儲存失敗');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定刪除？')) return;
    try {
      await deleteLocalHotel(id);
      loadHotels();
    } catch {
      setError('刪除失敗');
    }
  };

  return (
    <>
      <h2>本地酒店管理</h2>
      <Button onClick={handleShowAdd} className="mb-3">新增酒店</Button>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <p>載入中...</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>名稱</th>
              <th>地點</th>
              <th>價格</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel._id}>
                <td>{hotel.name}</td>
                <td>{hotel.location}</td>
                <td>${hotel.price}</td>
                <td>{hotel.description || '-'}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleShowEdit(hotel)}>編輯</Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(hotel._id)}>刪除</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingHotel ? '編輯酒店' : '新增酒店'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>名稱</Form.Label>
              <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>地點</Form.Label>
              <Form.Control type="text" value={location} onChange={e => setLocation(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>價格</Form.Label>
              <Form.Control type="number" value={price} onChange={e => setPrice(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>描述</Form.Label>
              <Form.Control as="textarea" value={description} onChange={e => setDescription(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>圖片</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={e => {
                  const input = e.target as HTMLInputElement;
                  setImageFile(input.files ? input.files[0] : null);
                }}
              />
            </Form.Group>
            <Button type="submit" className="w-100">{editingHotel ? '更新' : '新增'}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
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
    setError('');
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
    setError('');
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
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (Number(price) < 0) {
      setError('價格不能為負數');
      return;
    }
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
      setError('儲存失敗，請稍後再試');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定刪除？')) return;
    setError('');
    try {
      await deleteLocalHotel(id);
      loadHotels();
    } catch {
      setError('刪除失敗，請稍後再試');
    }
  };

  return (
    <>
      <h2 className="mb-4" style={{ color: '#004080', fontWeight: '700' }}>本地酒店管理</h2>

      <Button
        onClick={handleShowAdd}
        className="mb-3"
        style={{
          background: 'linear-gradient(45deg, #004080, #00264d)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,64,128,0.6)',
          fontWeight: '600',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#00264d')}
        onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(45deg, #004080, #00264d)')}
      >
        新增酒店
      </Button>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">載入中...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <thead style={{ backgroundColor: '#004080', color: '#fff' }}>
            <tr>
              <th>名稱</th>
              <th>地點</th>
              <th>價格</th>
              <th>描述</th>
              <th style={{ width: 140 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  尚無酒店資料
                </td>
              </tr>
            )}
            {hotels.map((hotel) => (
              <tr key={hotel._id}>
                <td>{hotel.name}</td>
                <td>{hotel.location}</td>
                <td>${hotel.price}</td>
                <td>{hotel.description || '-'}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleShowEdit(hotel)}
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(hotel._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#004080', color: '#fff' }}>
          <Modal.Title>{editingHotel ? '編輯酒店' : '新增酒店'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="hotelName">
              <Form.Label>名稱</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="請輸入酒店名稱"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="hotelLocation">
              <Form.Label>地點</Form.Label>
              <Form.Control
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="請輸入酒店地點"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="hotelPrice">
              <Form.Label>價格</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="請輸入價格"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="hotelDescription">
              <Form.Label>描述</Form.Label>
              <Form.Control
                as="textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="可選填，簡短描述酒店特色"
                rows={3}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="hotelImage">
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

            <Button
              type="submit"
              className="w-100"
              style={{
                background: editingHotel
                  ? 'linear-gradient(45deg, #b68b00, #d4af37)'
                  : 'linear-gradient(45deg, #004080, #00264d)',
                border: 'none',
                fontWeight: '600',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = editingHotel
                  ? '#d4af37'
                  : '#00264d';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = editingHotel
                  ? 'linear-gradient(45deg, #b68b00, #d4af37)'
                  : 'linear-gradient(45deg, #004080, #00264d)';
              }}
            >
              {editingHotel ? '更新' : '新增'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, ListGroup, Spinner } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Hotel {
  _id: string;
  name: string;
  source: 'local' | 'external';
}

interface User {
  username: string;
}

interface Booking {
  _id: string;
  hotelId: string;
  hotelSource: 'local' | 'external';
  user: User | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  stayDays: number | null;
}

const predefinedExternalHotels: Hotel[] = [
  { _id: 'ext1', name: '外部酒店 A', source: 'external' },
  { _id: 'ext2', name: '外部酒店 B', source: 'external' },
];

const Booking: React.FC = () => {
  const [localHotels, setLocalHotels] = useState<Hotel[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [stayDays, setStayDays] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingProcessing, setBookingProcessing] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('請先登入才能使用預約功能');
      return;
    }

    setLoadingHotels(true);
    axios.get(`${API_BASE}/localHotels`)
      .then(res => {
        const hotels = res.data.map((h: any) => ({ ...h, source: 'local' as const }));
        setLocalHotels(hotels);
      })
      .catch(() => setMessage('載入本地酒店列表失敗'))
      .finally(() => setLoadingHotels(false));

    fetchMyBookings();
  }, [token]);

  const fetchMyBookings = () => {
    if (!token) return;
    setLoadingBookings(true);
    axios.get(`${API_BASE}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setMyBookings(res.data))
      .catch(() => setMessage('載入預約紀錄失敗'))
      .finally(() => setLoadingBookings(false));
  };

  const combinedHotels = [...localHotels, ...predefinedExternalHotels];

  const handleBooking = async () => {
    if (!token) {
      setMessage('請先登入才能預約');
      return;
    }
    if (!selectedHotelId || !checkInDate || stayDays <= 0) {
      setMessage('請填寫完整預約資料');
      return;
    }

    const selectedHotel = combinedHotels.find(h => h._id === selectedHotelId);
    if (!selectedHotel) {
      setMessage('選擇的酒店不存在');
      return;
    }

    const duplicate = myBookings.some(
      (b) =>
        b.hotelId === selectedHotelId &&
        b.hotelSource === selectedHotel.source &&
        new Date(b.checkInDate ?? '').toDateString() === new Date(checkInDate).toDateString()
    );

    if (duplicate) {
      setMessage('您已經預約過該酒店該入住日期，請勿重複預約');
      return;
    }

    setBookingProcessing(true);
    try {
      const res = await axios.post(
        `${API_BASE}/bookings`,
        {
          hotelId: selectedHotelId,
          hotelSource: selectedHotel.source,
          checkInDate,
          stayDays,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('預約成功！');
      setMyBookings((prev) => [...prev, res.data.booking || res.data]);

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setMessage(`預約失敗：${error.response.data.message}`);
      } else {
        setMessage('預約失敗，請稍後再試');
      }
    } finally {
      setBookingProcessing(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!token) {
      alert('請先登入');
      return;
    }
    if (!window.confirm('確定要刪除此預約嗎？')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('預約已刪除');
      setMyBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch {
      alert('刪除失敗，請稍後再試');
    }
  };

  const getHotelName = (booking: Booking) => {
    const hotel = combinedHotels.find(h => h._id === booking.hotelId);
    return hotel?.name || (booking.hotelSource === 'local' ? '本地酒店' : '外部酒店');
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 720, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 className="mb-4" style={{ color: '#004080', fontWeight: '700' }}>📅 酒店預約</h2>

      {message && (
        <Alert variant="info" onClose={() => setMessage(null)} dismissible style={{ fontWeight: '600' }}>
          {message}
        </Alert>
      )}

      <Card className="mb-4 p-4 shadow rounded">
        <h5 className="mb-3" style={{ color: '#004080', fontWeight: '600' }}>新增預約</h5>

        <Form>
          <Form.Group className="mb-3" controlId="hotelSelect">
            <Form.Label>選擇酒店</Form.Label>
            {loadingHotels ? (
              <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span>載入中...</span>
              </div>
            ) : (
              <Form.Select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                style={{ borderRadius: 6 }}
              >
                <option value="">-- 請選擇 --</option>
                {combinedHotels.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.source === 'local' ? '本地' : '外部'})
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="checkInDate">
            <Form.Label>入住日期</Form.Label>
            <Form.Control
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              style={{ borderRadius: 6 }}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="stayDays">
            <Form.Label>入住天數</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={stayDays}
              onChange={(e) => setStayDays(Number(e.target.value))}
              style={{ borderRadius: 6 }}
            />
          </Form.Group>

          <Button
            variant="success"
            onClick={handleBooking}
            disabled={!selectedHotelId || !checkInDate || stayDays <= 0 || bookingProcessing}
            style={{ fontWeight: '600' }}
          >
            {bookingProcessing ? '預約中...' : '預約'}
          </Button>
        </Form>
      </Card>

      <h5 style={{ color: '#004080', fontWeight: '600', marginBottom: 16 }}>預約紀錄</h5>
      {loadingBookings ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <ListGroup>
          {myBookings.length === 0 && (
            <ListGroup.Item className="text-center text-muted py-4" style={{ userSelect: 'none' }}>
              尚無預約紀錄
            </ListGroup.Item>
          )}
          {myBookings.map((b) => (
            <ListGroup.Item
              key={b._id}
              className="d-flex justify-content-between align-items-start flex-column flex-md-row"
            >
              <div>
                <p className="mb-1"><strong>用戶名稱：</strong>{b.user?.username ?? '未知用戶'}</p>
                <p className="mb-1"><strong>酒店：</strong>{getHotelName(b)}</p>
                <p className="mb-1"><strong>入住日：</strong>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '無資料'}</p>
                <p className="mb-1"><strong>退房日：</strong>{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '無資料'}</p>
                <p className="mb-0"><strong>入住天數：</strong>{b.stayDays ?? '無資料'} 天</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteBooking(b._id)}
                className="mt-3 mt-md-0"
              >
                刪除
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default Booking;

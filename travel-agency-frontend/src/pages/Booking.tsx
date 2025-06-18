import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('請先登入才能使用預約功能');
      return;
    }

    axios.get(`${API_BASE}/localHotels`)
      .then(res => {
        const hotels = res.data.map((h: any) => ({ ...h, source: 'local' as const }));
        setLocalHotels(hotels);
      })
      .catch(() => setMessage('載入本地酒店列表失敗'));

    fetchMyBookings();
  }, [token]);

  const fetchMyBookings = () => {
    if (!token) return;
    axios.get(`${API_BASE}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setMyBookings(res.data))
      .catch(() => setMessage('載入預約紀錄失敗'));
  };

  const combinedHotels = [...localHotels, ...predefinedExternalHotels];

  const handleHotelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHotelId(e.target.value);
  };

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
    <div className="container mt-4">
      <h2>📅 酒店預約</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card p-3 mb-4">
        <h5>新增預約</h5>

        <div className="mb-2">
          <label>選擇酒店</label>
          <select
            className="form-select"
            value={selectedHotelId}
            onChange={handleHotelChange}
          >
            <option value="">-- 請選擇 --</option>
            {combinedHotels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.source === 'local' ? '本地' : '外部'})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label>入住日期</label>
          <input
            type="date"
            className="form-control"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label>入住天數</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={stayDays}
            onChange={(e) => setStayDays(Number(e.target.value))}
          />
        </div>

        <button
          className="btn btn-success mt-2"
          onClick={handleBooking}
          disabled={!selectedHotelId || !checkInDate || stayDays <= 0}
        >
          預約
        </button>
      </div>

      <h5>預約紀錄</h5>
      <ul className="list-group">
        {myBookings.length === 0 && <li className="list-group-item">尚無預約紀錄</li>}
        {myBookings.map((b) => (
          <li key={b._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <p><strong>用戶名稱：</strong>{b.user?.username ?? '未知用戶'}</p>
              <p><strong>酒店：</strong>{getHotelName(b)}</p>
              <p><strong>入住日：</strong>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '無資料'}</p>
              <p><strong>退房日：</strong>{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '無資料'}</p>
              <p><strong>入住天數：</strong>{b.stayDays ?? '無資料'} 天</p>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteBooking(b._id)}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Booking;

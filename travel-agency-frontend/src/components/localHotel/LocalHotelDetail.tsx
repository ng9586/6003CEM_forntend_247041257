import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLocalHotelById } from '../../services/localHotelApi';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description?: string;
  imageFilename?: string;
  images?: string[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api';
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || `${API_BASE}/uploads`;

const LocalHotelDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stayDays, setStayDays] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLocalHotelById(id)
        .then((res: AxiosResponse<Hotel>) => {
          setHotel(res.data);
          setError(null);
        })
        .catch(() => {
          setError('載入酒店資料失敗');
          setHotel(null);
        })
        .finally(() => setLoading(false));
    } else {
      setError('酒店 ID 不存在');
      setLoading(false);
    }
  }, [id]);

  const handleBooking = async () => {
    if (!hotel) return;

    if (!checkInDate) {
      setBookingMessage('請選擇入住日期');
      return;
    }

    if (stayDays <= 0) {
      setBookingMessage('入住天數必須大於 0');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setBookingMessage('請先登入才能預約');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/bookings`,
        {
          hotelId: hotel._id,
          hotelSource: 'local', // 標示本地酒店
          checkInDate,
          stayDays,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookingMessage('預約成功！即將跳轉...');
      setTimeout(() => {
        navigate('/'); // 可改成你想跳轉嘅路徑
      }, 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || '預約失敗，請稍後再試';
      setBookingMessage(msg);
    }
  };

  if (loading) return <p>載入中...</p>;
  if (error) return <p>{error}</p>;
  if (!hotel) return <p>找唔到酒店資料</p>;

  const imageUrls = hotel.images && hotel.images.length > 0
    ? hotel.images.map(imgPath => `${IMAGE_BASE}/uploads/${imgPath}?t=${Date.now()}`)
    : hotel.imageFilename
      ? [`${IMAGE_BASE}/uploads/${hotel.imageFilename}?t=${Date.now()}`]
      : [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #ccc',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer',
        }}
      >
        ← 返回
      </button>

      <h2>{hotel.name}</h2>
      <p><strong>地點：</strong>{hotel.location}</p>
      <p><strong>價格：</strong>${hotel.price}</p>
      {hotel.description && <p><strong>描述：</strong>{hotel.description}</p>}

      {imageUrls.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          {imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`圖片 ${idx + 1}`}
              loading="lazy"
              style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 8 }}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 300 }}>
        <h3>預約入住</h3>

        <label htmlFor="checkInDate">入住日期：</label>
        <input
          id="checkInDate"
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          style={{ width: '100%', marginTop: 8, marginBottom: 12 }}
        />

        <label htmlFor="stayDays">入住天數：</label>
        <input
          id="stayDays"
          type="number"
          min={1}
          value={stayDays}
          onChange={(e) => setStayDays(Number(e.target.value))}
          style={{ width: '100%', marginBottom: 12 }}
        />

        <button onClick={handleBooking} style={{ width: '100%', padding: '8px 0' }}>
          預約
        </button>

        {bookingMessage && <p style={{ marginTop: 12 }}>{bookingMessage}</p>}
      </div>
    </div>
  );
};

export default LocalHotelDetail;

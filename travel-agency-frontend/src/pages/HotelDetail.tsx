import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface HotelImage {
  path: string;
}

interface HotelDetailData {
  name: { content: string };
  description?: { content: string };
  address?: { content: string };
  images?: HotelImage[];
  category?: { name: string };
  zone?: { name: string };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HotelDetail: React.FC = () => {
  const { hotelCode } = useParams<{ hotelCode: string }>();
  const [hotel, setHotel] = useState<HotelDetailData | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [checkInDate, setCheckInDate] = useState('');
  const [stayDays, setStayDays] = useState(1);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!hotelCode) return;

    setLoading(true);

    const detailRequest = axios.get(`${API_BASE}/hotels/hotel-details?hotelId=${hotelCode}`);
    const priceRequest = axios.get(`${API_BASE}/hotels/price?hotelId=${hotelCode}`);

    Promise.all([detailRequest, priceRequest])
      .then(([detailRes, priceRes]) => {
        setHotel(detailRes.data.hotel || null);
        setMinPrice(priceRes.data.minPrice ?? null);
      })
      .catch((err) => {
        console.error('載入酒店詳細資料失敗:', err);
        setHotel(null);
        setMinPrice(null);
      })
      .finally(() => setLoading(false));
  }, [hotelCode]);

  const handleBooking = async () => {
    if (!token) {
      setBookingMessage('請先登入才能預約');
      return;
    }

    if (!checkInDate) {
      setBookingMessage('請選擇入住日期');
      return;
    }

    if (stayDays <= 0) {
      setBookingMessage('入住天數必須大於 0');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/bookings`,
        {
          hotelId: hotelCode,
          hotelSource: 'external',
          checkInDate,
          stayDays,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookingMessage('預約成功！即將跳轉...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || '預約失敗，請稍後再試';
      setBookingMessage(msg);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>載入中...</p>;
  if (!hotel) return <p style={{ textAlign: 'center', marginTop: 50 }}>找不到酒店資料</p>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ fontWeight: 700, color: '#004080', marginBottom: 12 }}>{hotel.name.content}</h2>
      {minPrice !== null && <p style={{ fontWeight: '600', fontSize: 18, color: '#007bff' }}>最低價: ${minPrice}</p>}
      {hotel.description?.content && <p style={{ lineHeight: 1.6, color: '#444' }}>{hotel.description.content}</p>}
      {hotel.address?.content && <p><strong>地址:</strong> {hotel.address.content}</p>}
      {hotel.category?.name && <p><strong>分類:</strong> {hotel.category.name}</p>}
      {hotel.zone?.name && <p><strong>地區:</strong> {hotel.zone.name}</p>}

      {hotel.images && hotel.images.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          {hotel.images.map((img, idx) =>
            img.path ? (
              <img
                key={idx}
                src={img.path}
                alt={`圖片 ${idx + 1}`}
                style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                loading="lazy"
              />
            ) : null
          )}
        </div>
      )}

      <div
        style={{
          marginTop: 40,
          border: '1px solid #ccc',
          padding: 24,
          borderRadius: 10,
          maxWidth: 400,
          backgroundColor: '#f9f9f9',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <h3 style={{ marginBottom: 20, color: '#004080' }}>預約入住</h3>

        <label htmlFor="checkInDate" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
          入住日期：
        </label>
        <input
          id="checkInDate"
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            marginBottom: 20,
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16,
          }}
        />

        <label htmlFor="stayDays" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
          入住天數：
        </label>
        <input
          id="stayDays"
          type="number"
          min={1}
          value={stayDays}
          onChange={(e) => setStayDays(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '8px 12px',
            marginBottom: 20,
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16,
          }}
        />

        <button
          onClick={handleBooking}
          style={{
            width: '100%',
            padding: '12px 0',
            backgroundColor: '#004080',
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00264d')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#004080')}
        >
          預約
        </button>

        {bookingMessage && (
          <p style={{ marginTop: 16, color: bookingMessage.includes('成功') ? 'green' : 'red', fontWeight: 600 }}>
            {bookingMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default HotelDetail;

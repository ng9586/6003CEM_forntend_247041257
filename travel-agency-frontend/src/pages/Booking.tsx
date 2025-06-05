import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Hotel {
  _id: string;
  name: string;
}

interface Booking {
  hotel: Hotel;
  checkInDate: string;
}

const Booking: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API_BASE}/hotels`).then((res) => setHotels(res.data));
    axios
      .get(`${API_BASE}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyBookings(res.data))
      .catch((err) => console.error('讀取預約失敗', err));
  }, []);

  const handleBooking = () => {
    axios
      .post(
        `${API_BASE}/bookings`,
        { hotelId: selectedHotelId, checkInDate },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('預約成功');
        window.location.reload();
      })
      .catch(() => alert('預約失敗'));
  };

  return (
    <div className="container mt-4">
      <h2>📅 酒店預約</h2>

      <div className="card p-3 mb-4">
        <h5>新增預約</h5>
        <div className="mb-2">
          <label>選擇酒店</label>
          <select className="form-select" value={selectedHotelId} onChange={(e) => setSelectedHotelId(e.target.value)}>
            <option value="">-- 請選擇 --</option>
            {hotels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
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
        <button className="btn btn-success mt-2" onClick={handleBooking} disabled={!selectedHotelId || !checkInDate}>
          預約
        </button>
      </div>

      <h5>我的預約紀錄</h5>
      <ul className="list-group">
        {myBookings.map((b, idx) => (
          <li key={idx} className="list-group-item">
            {b.hotel.name} - 入住日：{new Date(b.checkInDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Booking;

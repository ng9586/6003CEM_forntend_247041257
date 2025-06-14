import React, { useState } from 'react';

interface HotelSearchBarProps {
  onSearch: (city: string, checkIn: string, checkOut: string) => void;
}

const HotelSearchBar: React.FC<HotelSearchBarProps> = ({ onSearch }) => {
  const today = new Date().toISOString().split('T')[0];
  const [city, setCity] = useState('香港');
  const [checkIn, setCheckIn] = useState('2025-07-01');
  const [checkOut, setCheckOut] = useState('2025-07-03');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!city.trim() || !checkIn || !checkOut) return;

    if (new Date(checkOut) <= new Date(checkIn)) {
      alert('退房日期必須晚於入住日期');
      return;
    }

    onSearch(city.trim(), checkIn, checkOut);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}
    >
      <input
        type="text"
        placeholder="輸入城市名稱"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: 8, fontSize: 16, width: 150 }}
      />
      <label style={{ fontSize: 14 }}>
        入住:
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => {
            const value = e.target.value;
            setCheckIn(value);

            // 自動調整退房日
            if (new Date(checkOut) <= new Date(value)) {
              const nextDay = new Date(value);
              nextDay.setDate(nextDay.getDate() + 1);
              setCheckOut(nextDay.toISOString().split('T')[0]);
            }
          }}
          style={{ padding: 8, fontSize: 16, marginLeft: 4 }}
        />
      </label>
      <label style={{ fontSize: 14 }}>
        退房:
        <input
          type="date"
          min={checkIn}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          style={{ padding: 8, fontSize: 16, marginLeft: 4 }}
        />
      </label>
      <button type="submit" style={{ padding: '8px 16px', fontSize: 16 }}>
        搜尋
      </button>
    </form>
  );
};

export default HotelSearchBar;

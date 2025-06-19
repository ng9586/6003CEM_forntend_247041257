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
      style={{
        marginBottom: 24,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <input
        type="text"
        placeholder="輸入城市名稱"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{
          padding: '10px 14px',
          fontSize: 16,
          width: 180,
          borderRadius: 8,
          border: '1.5px solid #ccc',
          transition: 'border-color 0.3s',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#004080')}
        onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
      />
      <label
        style={{
          fontSize: 14,
          color: '#444',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          userSelect: 'none',
        }}
      >
        入住:
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => {
            const value = e.target.value;
            setCheckIn(value);

            if (new Date(checkOut) <= new Date(value)) {
              const nextDay = new Date(value);
              nextDay.setDate(nextDay.getDate() + 1);
              setCheckOut(nextDay.toISOString().split('T')[0]);
            }
          }}
          style={{
            padding: '8px 12px',
            fontSize: 16,
            borderRadius: 8,
            border: '1.5px solid #ccc',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#004080')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
        />
      </label>
      <label
        style={{
          fontSize: 14,
          color: '#444',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          userSelect: 'none',
        }}
      >
        退房:
        <input
          type="date"
          min={checkIn}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: 16,
            borderRadius: 8,
            border: '1.5px solid #ccc',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#004080')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
        />
      </label>
      <button
        type="submit"
        style={{
          padding: '10px 28px',
          fontSize: 16,
          background: 'linear-gradient(45deg, #004080, #00264d)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,64,128,0.6)',
          transition: 'background-color 0.3s',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#00264d')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(45deg, #004080, #00264d)')}
      >
        搜尋
      </button>
    </form>
  );
};

export default HotelSearchBar;

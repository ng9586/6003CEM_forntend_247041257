import React, { useState } from 'react';
import HotelSearchBar from '../pages/HotelSearchBar';
import HotelList from '../pages/HotelList';
import type { Hotel } from '../pages/HotelList';

const AppContent: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = async (city: string, checkIn: string, checkOut: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        city,
        checkIn,
        checkOut,
        adults: '2',
        children: '1',
        rooms: '1',
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/hotels/search-with-images?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API 請求失敗，狀態碼：${response.status}`);
      }

      const data = await response.json();

      const mappedHotels: Hotel[] = (data.hotels || []).map((hotel: any) => ({
        code: hotel.code,
        name: hotel.name,
        categoryName: hotel.categoryName,
        zoneName: hotel.zoneName,
        minPrice: hotel.minPrice,
        thumbnail: hotel.imageUrl,
      }));

      setHotels(mappedHotels);
    } catch (err: any) {
      setError(err.message || '未知錯誤');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1100,
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontWeight: 700,
          fontSize: '2.5rem',
          color: '#004080',
          marginBottom: 24,
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        酒店搜尋平台
      </h1>

      <HotelSearchBar onSearch={fetchHotels} />

      {loading && (
        <div style={{ margin: '30px 0', textAlign: 'center' }}>
          <div
            style={{
              margin: 'auto',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #004080',
              borderRadius: '50%',
              width: 40,
              height: 40,
              animation: 'spin 1s linear infinite',
            }}
            aria-label="載入中"
          />
        </div>
      )}

      {error && (
        <p
          style={{
            color: '#d9534f',
            fontWeight: 600,
            fontSize: 16,
            marginTop: 20,
            textAlign: 'center',
            userSelect: 'none',
          }}
          role="alert"
        >
          錯誤：{error}
        </p>
      )}

      {!loading && !error && hotels.length > 0 && <HotelList hotels={hotels} />}

      {!loading && !error && hotels.length === 0 && (
        <p
          style={{
            color: '#666',
            fontSize: 18,
            marginTop: 40,
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          請輸入搜尋條件後再搜尋酒店。
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AppContent;

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchHotels('香港', '2025-07-01', '2025-07-03');
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>酒店搜尋平台</h1>
      <HotelSearchBar onSearch={fetchHotels} />
      {loading && (
        <div style={{ margin: '20px 0' }}>
          <div
            style={{
              margin: 'auto',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: 36,
              height: 36,
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>錯誤：{error}</p>}
      {!loading && !error && <HotelList hotels={hotels} />}

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

import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface Hotel {
  code: number;
  name: string;
  categoryName: string;
  zoneName: string;
  minPrice: number | null;
  thumbnail?: string;
}

interface HotelListProps {
  hotels: Hotel[];
}

const HotelList: React.FC<HotelListProps> = ({ hotels }) => {
  const navigate = useNavigate();

  if (hotels.length === 0)
    return (
      <p style={{ textAlign: 'center', marginTop: 50, color: '#666', fontSize: 18 }}>
        無酒店資料
      </p>
    );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      {hotels.map((hotel) => (
        <div
          key={hotel.code}
          onClick={() => navigate(`/hotel/${hotel.code}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate(`/hotel/${hotel.code}`);
          }}
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 16,
            width: 220,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(-6px)';
            el.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.transform = 'translateY(0)';
            el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          {hotel.thumbnail ? (
            <img
              src={hotel.thumbnail}
              alt={hotel.name}
              style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 120,
                backgroundColor: '#eee',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#999',
                marginBottom: 12,
                fontSize: 16,
                userSelect: 'none',
              }}
            >
              無圖片
            </div>
          )}
          <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#004080', fontWeight: 600 }}>{hotel.name}</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
            {hotel.categoryName} - {hotel.zoneName}
          </p>
          <p style={{ marginTop: 8, fontWeight: 'bold', color: '#007bff', fontSize: 16 }}>
            最低價: {hotel.minPrice !== null ? `$${hotel.minPrice}` : '無資料'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default HotelList;

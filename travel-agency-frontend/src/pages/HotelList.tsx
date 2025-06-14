import React from 'react';

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
  if (hotels.length === 0) return <p>無酒店資料</p>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {hotels.map((hotel) => (
        <div
          key={hotel.code}
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 12,
            width: 220,
            boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          {hotel.thumbnail ? (
            <img
              src={hotel.thumbnail}
              alt={hotel.name}
              style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 120,
                backgroundColor: '#eee',
                borderRadius: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#999',
              }}
            >
              無圖片
            </div>
          )}
          <h3 style={{ margin: '8px 0 4px' }}>{hotel.name}</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
            {hotel.categoryName} - {hotel.zoneName}
          </p>
          <p style={{ marginTop: 8, fontWeight: 'bold' }}>
            最低價: {hotel.minPrice !== null ? `$${hotel.minPrice}` : '無資料'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default HotelList;

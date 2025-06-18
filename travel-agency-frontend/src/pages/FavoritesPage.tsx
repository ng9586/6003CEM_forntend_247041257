import React from 'react';
import { useUser } from '../contexts/UserContext';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description?: string;
  imageFilename?: string;
}

const IMAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';

const FavoritesPage: React.FC = () => {
  const { profile } = useUser();

  if (!profile) {
    return <p style={{ textAlign: 'center', marginTop: 50 }}>請先登入才能查看收藏。</p>;
  }

  const favoritedHotels: Hotel[] = profile.favoritedHotels || [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30, color: '#333' }}>❤️ 我的收藏</h2>

      {favoritedHotels.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>你還沒有收藏任何酒店！</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {favoritedHotels.map(hotel => (
            <div
              key={hotel._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                backgroundColor: '#fff',
                transition: 'box-shadow 0.2s ease',
              }}
              onClick={() => window.location.href = `/localHotels/${hotel._id}`}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
              }}
            >
              <img
                src={
                  hotel.imageFilename
                    ? `${IMAGE_BASE_URL}/uploads/${hotel.imageFilename}?t=${Date.now()}`
                    : 'https://dummyimage.com/100x80/cccccc/ffffff&text=No+Image'
                }
                alt={hotel.name}
                style={{
                  width: 100,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 6,
                  marginRight: 16,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 18, color: '#222' }}>{hotel.name}</h3>
                <p style={{ margin: '0 0 4px 0', color: '#555' }}>{hotel.location}</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#007bff' }}>價格: ${hotel.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;

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
    return (
      <p style={{ textAlign: 'center', marginTop: 80, fontSize: 18, color: '#666' }}>
        請先登入才能查看收藏。
      </p>
    );
  }

  const favoritedHotels: Hotel[] = profile.favoritedHotels || [];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '40px auto',
        padding: '0 20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: 40,
          color: '#004080',
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: '1px',
        }}
      >
        ❤️ My Collection
      </h2>

      {favoritedHotels.length === 0 ? (
        <p
          style={{
            textAlign: 'center',
            color: '#777',
            fontSize: 18,
            marginTop: 60,
            userSelect: 'none',
          }}
        >
          You haven't saved any hotels yet!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {favoritedHotels.map((hotel) => (
            <div
              key={hotel._id}
              role="button"
              tabIndex={0}
              onClick={() => (window.location.href = `/localHotels/${hotel._id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  window.location.href = `/localHotels/${hotel._id}`;
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 16,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
                el.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                el.style.transform = 'translateY(0)';
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
                  borderRadius: 10,
                  marginRight: 20,
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
                loading="lazy"
              />
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: 20,
                    color: '#00264d',
                    fontWeight: 600,
                    userSelect: 'none',
                  }}
                >
                  {hotel.name}
                </h3>
                <p
                  style={{
                    margin: '0 0 6px 0',
                    color: '#555',
                    fontSize: 15,
                    userSelect: 'none',
                  }}
                >
                  {hotel.location}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontWeight: '700',
                    color: '#007bff',
                    fontSize: 16,
                    userSelect: 'none',
                  }}
                >
                  價格: ${hotel.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;

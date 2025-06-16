import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  hotel: {
    _id: string;
    name: string;
    location: string;
    price: number;
    description?: string;
    imageFilename?: string;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const LocalHotelCard: React.FC<Props> = ({ hotel }) => {
  const navigate = useNavigate();
  const baseUrl = API_BASE.replace(/\/api\/?$/, '');

  const imageUrl = hotel.imageFilename
    ? `${baseUrl}/uploads/${hotel.imageFilename}?t=${Date.now()}`
    : 'https://dummyimage.com/40x40/cccccc/ffffff&text=No+Image';

  const handleClick = () => {
    navigate(`/localHotels/${hotel._id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: 8,
        width: 220,
        padding: 12,
        boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      <img
        src={imageUrl}
        alt={hotel.name}
        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
      />
      <h3>{hotel.name}</h3>
      <p>{hotel.location}</p>
      <p><strong>價格:</strong> ${hotel.price}</p>
    </div>
  );
};

export default LocalHotelCard;

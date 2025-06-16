import React, { useEffect, useState } from 'react';
import { fetchLocalHotels } from '../services/localHotelApi';
import LocalHotelCard from '../components/localHotel/LocalHotelCard';

const LocalHotelListPage: React.FC = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalHotels()
      .then(res => setHotels(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>載入中...</p>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 20 }}>
      {hotels.map(hotel => (
        <LocalHotelCard key={hotel._id} hotel={hotel} />
      ))}
    </div>
  );
};

export default LocalHotelListPage;

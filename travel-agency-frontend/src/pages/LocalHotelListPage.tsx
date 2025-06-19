import React, { useEffect, useState } from 'react';
import { fetchLocalHotels } from '../services/localHotelApi';
import LocalHotelCard from '../components/localHotel/LocalHotelCard';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description?: string;
  imageFilename?: string;
}

const LocalHotelListPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | ''>(''); // 排序狀態：空、asc、desc

  useEffect(() => {
    fetchLocalHotels()
      .then(res => {
        setHotels(res.data);
        setFilteredHotels(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = hotels;

    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        hotel =>
          hotel.name.toLowerCase().includes(lowerSearch) ||
          hotel.location.toLowerCase().includes(lowerSearch)
      );
    }

    if (priceSort === 'asc') {
      filtered = filtered.slice().sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      filtered = filtered.slice().sort((a, b) => b.price - a.price);
    }

    setFilteredHotels(filtered);
  }, [searchText, priceSort, hotels]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: 40 }}>載入中...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: '0 auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* 搜尋及排序區 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input
          type="text"
          placeholder="搜尋酒店名稱或地點"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            padding: '10px 14px',
            width: 220,
            borderRadius: 8,
            border: '1.5px solid #ccc',
            fontSize: 16,
            transition: 'border-color 0.3s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#004080')}
          onBlur={e => (e.currentTarget.style.borderColor = '#ccc')}
        />

        <select
          value={priceSort}
          onChange={e => setPriceSort(e.target.value as 'asc' | 'desc' | '')}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1.5px solid #ccc',
            fontSize: 16,
            transition: 'border-color 0.3s',
            cursor: 'pointer',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#004080')}
          onBlur={e => (e.currentTarget.style.borderColor = '#ccc')}
        >
          <option value="">價格排序</option>
          <option value="asc">價格由低到高</option>
          <option value="desc">價格由高到低</option>
        </select>

        <button
          onClick={() => {
            setSearchText('');
            setPriceSort('');
          }}
          style={{
            padding: '10px 24px',
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
          onMouseEnter={e => (e.currentTarget.style.background = '#00264d')}
          onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(45deg, #004080, #00264d)')}
          type="button"
        >
          清除篩選
        </button>
      </div>

      {/* 酒店列表 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center' }}>
        {filteredHotels.length === 0 ? (
          <p style={{ color: '#666', fontSize: 18, marginTop: 40, userSelect: 'none' }}>
            找不到符合條件的酒店。
          </p>
        ) : (
          filteredHotels.map(hotel => <LocalHotelCard key={hotel._id} hotel={hotel} />)
        )}
      </div>
    </div>
  );
};

export default LocalHotelListPage;

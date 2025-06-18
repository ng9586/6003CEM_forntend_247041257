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

    // 文字搜尋過濾
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        hotel =>
          hotel.name.toLowerCase().includes(lowerSearch) ||
          hotel.location.toLowerCase().includes(lowerSearch)
      );
    }

    // 價格排序
    if (priceSort === 'asc') {
      filtered = filtered.slice().sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      filtered = filtered.slice().sort((a, b) => b.price - a.price);
    }

    setFilteredHotels(filtered);
  }, [searchText, priceSort, hotels]);

  if (loading) return <p>載入中...</p>;

  return (
    <div style={{ padding: 20 }}>
      {/* 搜尋及排序區 */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          gap: 12,
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
          style={{ padding: 8, width: 200, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <select
          value={priceSort}
          onChange={e => setPriceSort(e.target.value as 'asc' | 'desc' | '')}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
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
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          清除篩選
        </button>
      </div>

      {/* 酒店列表 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {filteredHotels.length === 0 ? (
          <p style={{ color: '#666' }}>找不到符合條件的酒店。</p>
        ) : (
          filteredHotels.map(hotel => <LocalHotelCard key={hotel._id} hotel={hotel} />)
        )}
      </div>
    </div>
  );
};

export default LocalHotelListPage;

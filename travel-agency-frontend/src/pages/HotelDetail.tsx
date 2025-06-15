import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface HotelImage {
  path: string;
}

interface HotelDetailData {
  name: { content: string };
  description?: { content: string };
  address?: { content: string };
  images?: HotelImage[];
  category?: { name: string };
  zone?: { name: string };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HotelDetail: React.FC = () => {
  const { hotelCode } = useParams<{ hotelCode: string }>();
  const [hotel, setHotel] = useState<HotelDetailData | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hotelCode) return;

    setLoading(true);

    // 同時呼叫兩個 API，使用完整 API 路徑
    const detailRequest = axios.get(`${API_BASE}/hotels/hotel-details?hotelId=${hotelCode}`);
    const priceRequest = axios.get(`${API_BASE}/hotels/price?hotelId=${hotelCode}`);

    Promise.all([detailRequest, priceRequest])
      .then(([detailRes, priceRes]) => {
        setHotel(detailRes.data.hotel || null);
        setMinPrice(priceRes.data.minPrice ?? null);
      })
      .catch((err) => {
        console.error('載入酒店詳細資料失敗:', err);
        setHotel(null);
        setMinPrice(null);
      })
      .finally(() => setLoading(false));
  }, [hotelCode]);

  if (loading) return <p>載入中...</p>;
  if (!hotel) return <p>找不到酒店資料</p>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>{hotel.name.content}</h2>
      {minPrice !== null && <p><strong>最低價:</strong> ${minPrice}</p>}
      {hotel.description?.content && <p>{hotel.description.content}</p>}
      {hotel.address?.content && <p><strong>地址:</strong> {hotel.address.content}</p>}
      {hotel.category?.name && <p><strong>分類:</strong> {hotel.category.name}</p>}
      {hotel.zone?.name && <p><strong>地區:</strong> {hotel.zone.name}</p>}

      {hotel.images && hotel.images.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          {hotel.images.map((img, idx) =>
            img.path ? (
              <img
                key={idx}
                src={img.path}
                alt={`圖片 ${idx + 1}`}
                style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default HotelDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLocalHotelById } from '../../services/localHotelApi';
import type { AxiosResponse } from 'axios';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description?: string;
  imageFilename?: string;
  // 如果你有多張圖片，可以加 images: string[] 或類似
  images?: string[]; 
}

const LocalHotelDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLocalHotelById(id)
        .then((res: AxiosResponse<Hotel>) => {
          setHotel(res.data);
          setError(null);
        })
        .catch(() => {
          setError('載入酒店資料失敗');
          setHotel(null);
        })
        .finally(() => setLoading(false));
    } else {
      setError('酒店 ID 不存在');
      setLoading(false);
    }
  }, [id]);

  if (loading) return <p>載入中...</p>;
  if (error) return <p>{error}</p>;
  if (!hotel) return <p>找唔到酒店資料</p>;

  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');

  // 圖片來源：優先用 images 陣列，無就 fallback 單張 imageFilename
  const imageUrls = hotel.images && hotel.images.length > 0
    ? hotel.images.map(imgPath => `${baseUrl}/uploads/${imgPath}?t=${Date.now()}`)
    : hotel.imageFilename
      ? [`${baseUrl}/uploads/${hotel.imageFilename}?t=${Date.now()}`]
      : [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #ccc',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer',
        }}
      >
        ← 返回
      </button>

      <h2>{hotel.name}</h2>
      <p><strong>地點：</strong>{hotel.location}</p>
      <p><strong>價格：</strong>${hotel.price}</p>
      {hotel.description && <p><strong>描述：</strong>{hotel.description}</p>}

      {imageUrls.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          {imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`圖片 ${idx + 1}`}
              loading="lazy"
              style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 8 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalHotelDetail;

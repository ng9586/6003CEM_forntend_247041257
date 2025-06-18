import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description?: string;
  imageFilename?: string;
}

interface Props {
  hotel: Hotel;
  onFavoriteChange?: (hotelId: string, isFavorited: boolean) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const IMAGE_BASE_URL = API_BASE.replace(/\/api\/?$/, '');

const LocalHotelCard: React.FC<Props> = ({ hotel, onFavoriteChange }) => {
  const navigate = useNavigate();
  const { profile, updateFavoritedHotels } = useUser();

  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // 根據 Context 中的 profile.favoritedHotels 來判斷當前酒店是否被收藏
    if (profile?.favoritedHotels) {
      // 確保 favoritedHotels 裡的元素是物件，並且取其 _id
      const favoriteIds = profile.favoritedHotels.map(fav => (typeof fav === 'string' ? fav : fav._id));
      setIsFavorited(favoriteIds.includes(hotel._id));
    } else {
      setIsFavorited(false);
    }
  }, [profile, hotel._id]); // 依賴 profile 變化以更新收藏狀態

  const imageUrl = hotel.imageFilename
    ? `${IMAGE_BASE_URL}/uploads/${hotel.imageFilename}?t=${Date.now()}`
    : 'https://dummyimage.com/40x40/cccccc/ffffff&text=No+Image';

  const handleClick = () => {
    navigate(`/localHotels/${hotel._id}`);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到父級的 handleClick

    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入才能收藏！');
      navigate('/login');
      return;
    }

    // 樂觀更新 UI：先改變心心狀態
    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);
    onFavoriteChange?.(hotel._id, newFavoritedState);

    try {
      if (newFavoritedState) {
        // 新增收藏
        const res = await axios.post(
          `${API_BASE}/users/me/favorites`,
          { hotelId: hotel._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('已加入收藏！');
        // 成功後，用後端回傳的最新收藏列表更新 Context
        if (res.data?.favoritedHotels) {
          console.log('LocalHotelCard: 新增收藏成功，後端回傳收藏列表:', res.data.favoritedHotels); // DEBUG LOG
          updateFavoritedHotels && updateFavoritedHotels(res.data.favoritedHotels);
        }
      } else {
        // 移除收藏
        const res = await axios.delete(`${API_BASE}/users/me/favorites/${hotel._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('已從收藏中移除！');
        // 成功後，用後端回傳的最新收藏列表更新 Context
        if (res.data?.favoritedHotels) {
          console.log('LocalHotelCard: 移除收藏成功，後端回傳收藏列表:', res.data.favoritedHotels); // DEBUG LOG
          updateFavoritedHotels && updateFavoritedHotels(res.data.favoritedHotels);
        }
      }
    } catch (error: any) {
      // API 失敗時，回復心心狀態
      alert(error.response?.data?.message || '操作失敗，請稍後再試');
      setIsFavorited(!newFavoritedState);
      onFavoriteChange?.(hotel._id, !newFavoritedState);
    }
  };

  return (
    <div
      style={{
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        width: 220,
        padding: 12,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt={hotel.name}
        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
      />
      <h3 style={{ fontSize: 18, margin: '0 0 4px 0', color: '#333' }}>{hotel.name}</h3>
      <p style={{ fontSize: 14, color: '#666', margin: '0 0 4px 0' }}>{hotel.location}</p>
      <p style={{ fontSize: 16, color: '#007bff', fontWeight: 'bold', margin: 0 }}>價格: ${hotel.price}</p>

      <div
        onClick={handleFavoriteToggle}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          cursor: 'pointer',
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          padding: 4,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isFavorited ? (
          <AiFillHeart size={24} color="#ff69b4" />
        ) : (
          <AiOutlineHeart size={24} color="#ccc" />
        )}
      </div>
    </div>
  );
};

export default LocalHotelCard;

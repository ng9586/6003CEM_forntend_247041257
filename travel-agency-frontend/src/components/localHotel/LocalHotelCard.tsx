import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { Card, Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';

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
    if (profile?.favoritedHotels) {
      const favoriteIds = profile.favoritedHotels.map(fav => (typeof fav === 'string' ? fav : fav._id));
      setIsFavorited(favoriteIds.includes(hotel._id));
    } else {
      setIsFavorited(false);
    }
  }, [profile, hotel._id]);

  const imageUrl = hotel.imageFilename
    ? `${IMAGE_BASE_URL}/uploads/${hotel.imageFilename}?t=${Date.now()}`
    : 'https://dummyimage.com/220x120/cccccc/ffffff&text=No+Image';

  const handleClick = () => {
    navigate(`/localHotels/${hotel._id}`);
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入才能收藏！');
      navigate('/login');
      return;
    }

    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);
    onFavoriteChange?.(hotel._id, newFavoritedState);

    try {
      if (newFavoritedState) {
        const res = await axios.post(
          `${API_BASE}/users/me/favorites`,
          { hotelId: hotel._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('已加入收藏！');
        if (res.data?.favoritedHotels) {
          updateFavoritedHotels && updateFavoritedHotels(res.data.favoritedHotels);
        }
      } else {
        const res = await axios.delete(`${API_BASE}/users/me/favorites/${hotel._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('已從收藏中移除！');
        if (res.data?.favoritedHotels) {
          updateFavoritedHotels && updateFavoritedHotels(res.data.favoritedHotels);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失敗，請稍後再試');
      setIsFavorited(!newFavoritedState);
      onFavoriteChange?.(hotel._id, !newFavoritedState);
    }
  };

  return (
    <Card
      onClick={handleClick}
      style={{ width: 220, cursor: 'pointer', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      className="position-relative"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter') handleClick(); }}
    >
      <Card.Img
        variant="top"
        as={Image}
        src={imageUrl}
        alt={hotel.name}
        style={{ height: 120, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        loading="lazy"
      />
      <Card.Body className="d-flex flex-column justify-content-between p-3">
        <div>
          <Card.Title className="mb-1" style={{ fontSize: 18, color: '#333' }}>{hotel.name}</Card.Title>
          <Card.Text className="mb-1 text-muted" style={{ fontSize: 14 }}>{hotel.location}</Card.Text>
          <Card.Text className="mb-0 fw-bold text-primary" style={{ fontSize: 16 }}>價格: ${hotel.price}</Card.Text>
        </div>
      </Card.Body>

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{isFavorited ? '取消收藏' : '加入收藏'}</Tooltip>}
      >
        <Button
          variant="light"
          onClick={handleFavoriteToggle}
          className="position-absolute"
          style={{
            top: 8,
            right: 8,
            borderRadius: '50%',
            padding: 6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            minWidth: 36,
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={isFavorited ? '取消收藏' : '加入收藏'}
        >
          {isFavorited ? (
            <AiFillHeart size={24} color="#ff69b4" />
          ) : (
            <AiOutlineHeart size={24} color="#aaa" />
          )}
        </Button>
      </OverlayTrigger>
    </Card>
  );
};

export default LocalHotelCard;

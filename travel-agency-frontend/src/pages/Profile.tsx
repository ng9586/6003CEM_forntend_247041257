import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import StarRating from '../components/StarRating';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Review {
  _id: string;
  comment: string;
  rating: number;
  createdAt: string;
  userId: { _id: string; username: string };  // 注意這裡要有 _id
}

const Profile: React.FC = () => {
  const { profile, setProfile } = useUser();
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatarUrl) {
      setAvatarPreview(null);
    }
  }, [profile?.avatarUrl]);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setReviewsError('請先登入');
        return;
      }
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const res = await axios.get(`${API_BASE}/reviews/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data);
      } catch {
        setReviewsError('載入評論失敗');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [profile]);

  if (!profile) return <p>載入中...</p>;

  const handleUsernameUpdate = () => {
    const token = localStorage.getItem('token');
    axios
      .put(
        `${API_BASE}/users/me/name`,
        { username: newUsername },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setProfile(res.data))
      .catch(() => alert('更新失敗'));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleAvatarUpload = () => {
    if (!avatarFile) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    axios
      .put(`${API_BASE}/users/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setProfile(res.data);
        setAvatarFile(null);
        setAvatarPreview(null);
      })
      .catch(() => alert('上傳失敗'));
  };

  // 新增：刪除留言函式
  const handleDeleteReview = async (reviewId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入才能刪除留言');
      return;
    }
    if (!window.confirm('確定要刪除這則留言嗎？')) return;

    try {
      await axios.delete(`${API_BASE}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // 刪除成功後重新拉取評論
      const res = await axios.get(`${API_BASE}/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || '刪除失敗，請稍後再試');
    }
  };

  return (
    <div className="container mt-4">
      <h2>👤 個人資料</h2>
      <div className="card p-3">
        {/* 頭像區 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: 'pointer',
            marginBottom: '1rem',
            border: '2px solid #007bff',
            display: 'inline-block',
          }}
        >
          <img
            src={
              avatarPreview
                ? avatarPreview
                : profile.avatarUrl
                ? `${API_BASE}${profile.avatarUrl}?t=${Date.now()}`
                : 'https://via.placeholder.com/100'
            }
            alt="Avatar"
            className="rounded-circle"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />

        {/* 用戶名更新 */}
        <div className="mb-3">
          <label className="form-label">用戶名</label>
          <input
            type="text"
            className="form-control"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button className="btn btn-primary mt-2" onClick={handleUsernameUpdate}>
            更新用戶名
          </button>
        </div>

        {/* 頭像上傳 */}
        <div className="mb-3">
          <button className="btn btn-success" onClick={handleAvatarUpload} disabled={!avatarFile}>
            上傳頭像
          </button>
        </div>

        {/* 用戶評論區（只讀） */}
        <div style={{ marginTop: 32 }}>
          <h3>📝 我的評論</h3>
          {reviewsLoading && <p>載入評論中...</p>}
          {reviewsError && <p style={{ color: 'red' }}>{reviewsError}</p>}
          {!reviewsLoading && reviews.length === 0 && <p>尚無評論</p>}

          {reviews.map((r) => (
            <div
              key={r._id}
              style={{
                borderBottom: '1px solid #ddd',
                paddingBottom: 8,
                marginBottom: 8,
                position: 'relative',
              }}
            >
              <p>
                <strong>{r.userId?.username || '匿名'}</strong> -{' '}
                {new Date(r.createdAt).toLocaleDateString()}
                {/* 新增刪除按鈕 */}
                <button
                  onClick={() => handleDeleteReview(r._id)}
                  style={{
                    marginLeft: 12,
                    color: 'red',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                  }}
                  title="刪除留言"
                >
                  刪除
                </button>
              </p>
              <StarRating rating={r.rating} readOnly size={20} />
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;

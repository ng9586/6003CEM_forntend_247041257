// src/pages/Profile.tsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Profile: React.FC = () => {
  const { profile, setProfile } = useUser();
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return <p>載入中...</p>;

  const handleUsernameUpdate = () => {
    const token = localStorage.getItem('token');
    axios
      .put(`${API_BASE}/users/me/name`, { username: newUsername }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setProfile(res.data))
      .catch(() => alert('更新失敗'));
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
      .then(res => setProfile(res.data))
      .catch(() => alert('上傳失敗'));
  };

  return (
    <div className="container mt-4">
      <h2>👤 個人資料</h2>
      <div className="card p-3">
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
              profile.avatarUrl
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
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
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

        <div className="mb-3">
          <button
            className="btn btn-success"
            onClick={handleAvatarUpload}
            disabled={!avatarFile}
          >
            上傳頭像
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

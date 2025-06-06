// src/pages/Profile.tsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const API_BASE = import.meta.env.VITE_IMAGE_BASE_URL;

const Profile: React.FC = () => {
  const { profile, setProfile } = useUser();
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return <p>載入中...</p>;

  const API_ROOT = API_BASE.replace(/\/api$/, '');
  const avatarSrc = avatarPreview || (profile.avatarUrl
    ? `${API_ROOT}${profile.avatarUrl}?t=${Date.now()}`
    : 'https://via.placeholder.com/100');

console.log("🤖 profile.avatarUrl =", profile?.avatarUrl);
console.log("🧠 avatarSrc =", avatarSrc);

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
      .then((res) => {
        setProfile(res.data);
        alert('✅ 用戶名已更新');
      })
      .catch(() => alert('❌ 用戶名更新失敗'));
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
        alert('✅ 頭像上傳成功');
      })
      .catch(() => alert('❌ 頭像上傳失敗'));
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
            src={avatarSrc}
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
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setAvatarFile(file);
            if (file) {
              setAvatarPreview(URL.createObjectURL(file));
            } else {
              setAvatarPreview(null);
            }
          }}
        />

        <div className="mb-3">
          <label htmlFor="usernameInput" className="form-label">
            用戶名
          </label>
          <input
            type="text"
            className="form-control"
            id="usernameInput"
            name="username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            autoComplete="username"
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

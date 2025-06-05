import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ProfileData {
  email: string;
  username: string;
  avatarUrl: string;
  role: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

  const token = localStorage.getItem('token');

  // 載入用戶資料
  useEffect(() => {
    axios
      .get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setNewUsername(res.data.username);
        setAvatarTimestamp(Date.now()); // 初始化時間戳
      })
      .catch((err) => {
        console.error('載入個人資料失敗', err);
      });
  }, []);

  // 產生本地預覽 URL
  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  // 點擊圓形頭像框觸發檔案選擇
  const onAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 檔案選擇事件
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
  };

  // 用戶名更新
  const handleUsernameUpdate = () => {
    axios
      .put(
        `${API_BASE}/users/me/name`,
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('用戶名已更新');
        setProfile((prev) => prev && { ...prev, username: newUsername });
      })
      .catch(() => alert('更新失敗'));
  };

  // 上傳頭像
  const handleAvatarUpload = () => {
    if (!avatarFile) return;

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
        alert('頭像已更新');
        // 更新 profile 中 avatarUrl，並更新時間戳，強制刷新圖片
        setProfile((prev) => prev && { ...prev, avatarUrl: res.data.avatarUrl });
        setAvatarTimestamp(Date.now());
        setAvatarFile(null);
        setPreviewUrl(null);
      })
      .catch(() => alert('頭像上傳失敗'));
  };

  if (!profile) return <p>載入中...</p>;

  return (
    <div className="container mt-4">
      <h2>👤 個人資料</h2>
      <div className="card p-3">
        {/* 圓形頭像框 */}
        <div
          onClick={onAvatarClick}
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
          title="點擊更換頭像"
        >
          <img
            src={
              previewUrl
                ? previewUrl
                : profile.avatarUrl
                ? `${API_BASE}${profile.avatarUrl}?t=${avatarTimestamp}`
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
          onChange={onFileChange}
        />

        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>

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

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export interface LocalHotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description?: string;
  imageFilename?: string;
}

export interface ProfileData {
  email: string;
  username: string;
  avatarUrl: string;
  role: string;
  avatarUpdatedAt?: number;
  favoritedHotels?: LocalHotel[]; // 確保這裡可以是完整的 LocalHotel[]
}

interface UserContextType {
  profile: ProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  fetchProfile: () => Promise<void>;
  updateFavoritedHotels: (newFavoritedHotels: LocalHotel[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData | null>(() => {
    const storedProfile = localStorage.getItem('profile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfile(null);
      return;
    }
    try {
      // 這裡呼叫的是 /users/me，確保後端這個 endpoint 會 populate favoritedHotels
      const res = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('UserContext: fetchProfile 成功取得用戶資料:', res.data); // DEBUG LOG
      setProfile(res.data);
    } catch (error) {
      console.error('UserContext: 拉取用戶資料失敗', error);
      setProfile(null);
    }
  };

  const updateFavoritedHotels = (newFavoritedHotels: LocalHotel[]) => {
    console.log('UserContext: 更新收藏列表:', newFavoritedHotels); // DEBUG LOG
    setProfile(prev => (prev ? { ...prev, favoritedHotels: newFavoritedHotels } : prev));
  };

  useEffect(() => {
    if (profile) {
      localStorage.setItem('profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('profile');
    }
  }, [profile]);

  const value = useMemo(() => ({
    profile,
    setProfile,
    fetchProfile,
    updateFavoritedHotels,
  }), [profile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};


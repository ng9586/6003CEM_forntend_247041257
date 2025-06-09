// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ProfileData {
  email: string;
  username: string;
  avatarUrl: string;
  role: string;
  avatarUpdatedAt?: number; // 加呢個欄位
}

interface UserContextType {
  profile: ProfileData | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初始化時從 localStorage 讀 profile
  const [profile, setProfile] = useState<ProfileData | null>(() => {
    const storedProfile = localStorage.getItem('profile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  // useEffect 監聽 profile 變化，同步更新 localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('profile'); // 登出時移除
    }
  }, [profile]);

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '../types';
import type { Language } from './locale/translations';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: IUser | null;
  theme: 'light' | 'dark';
  lang: Language;
  setAuth: (token: string, refreshToken: string, user: IUser) => void;
  updateUser: (partial: Partial<IUser>) => void;
  clearAuth: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLang: (lang: Language) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      theme: 'light',
      lang: 'en',
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      clearAuth: () => set({ token: null, refreshToken: null, user: null }),
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'tourist-auth-storage',
    }
  )
);

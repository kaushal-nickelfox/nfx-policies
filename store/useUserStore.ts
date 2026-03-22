import { create } from 'zustand';
import type { Employee, UserRole } from '@/types/index';

interface UserState {
  user: Employee | null;
  role: UserRole | null;
  isLoading: boolean;
  setUser: (user: Employee | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  role: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, role: null, isLoading: false }),
}));

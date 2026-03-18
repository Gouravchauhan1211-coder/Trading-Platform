import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Notification } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: Notification[];
  
  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

// Sample user for demonstration
const sampleUser: User = {
  id: '1',
  email: 'trader@example.com',
  name: 'John Trader',
  plan: 'PRO',
  createdAt: '2024-01-01T00:00:00Z',
};

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Order Executed',
    message: 'Your buy order for RELIANCE has been executed at ₹2850.50',
    type: 'SUCCESS',
    read: false,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Price Alert',
    message: 'INFY has crossed your target price of ₹1500',
    type: 'INFO',
    read: false,
    createdAt: '2024-01-15T09:45:00Z',
  },
  {
    id: '3',
    title: 'Market Update',
    message: 'Nifty 50 opened at 21500 with positive sentiment',
    type: 'INFO',
    read: true,
    createdAt: '2024-01-15T09:00:00Z',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: sampleUser,
      isAuthenticated: true,
      isLoading: false,
      notifications: sampleNotifications,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({
          user: { ...sampleUser, email },
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, notifications: [] });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
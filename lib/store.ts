import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  setCart: (items: CartItem[], total: number, count: number) => void;
  clearCart: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  count: 0,
  
  setCart: (items, total, count) => set({ items, total, count }),
  
  clearCart: () => set({ items: [], total: 0, count: 0 }),
}));
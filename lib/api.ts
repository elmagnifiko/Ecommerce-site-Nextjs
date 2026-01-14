import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://127.0.0.1:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour définir le token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types pour les API
interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface CartItem {
  product_id: number;
  quantity: number;
}

interface UpdateCartItem {
  quantity: number;
}

interface CreateOrderData {
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
  shipping_address?: string;
  billing_address?: string;
}

// API Auth
export const authAPI = {
  register: (data: RegisterData) => api.post('/register', data),
  login: (data: LoginData) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

// API Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
};

// API Products
export const productsAPI = {
  getAll: (params?: Record<string, string | number | boolean>) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  getByCategory: (categoryId: number) => api.get(`/products/category/${categoryId}`),
};

// API Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data: CartItem) => api.post('/cart/add', data),
  update: (id: number, data: UpdateCartItem) => api.put(`/cart/${id}`, data),
  remove: (id: number) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

// API Orders
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: CreateOrderData) => api.post('/orders', data),
};

export default api;
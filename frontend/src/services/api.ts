import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eco_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getUserStats = async (userId: string) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export const logAction = async (userId: string, actionType: string) => {
  const response = await api.post(`/action/log`, {
    user_id: userId,
    action_type: actionType
  });
  return response.data;
};

export const getLeaderboard = async (type: string, id: string) => {
  const response = await api.get(`/leaderboard/${type}/${id}`);
  return response.data;
};

export const getAISuggestions = async (userId: string) => {
  const response = await api.post(`/ai/suggest`, { user_id: userId });
  return response.data;
};

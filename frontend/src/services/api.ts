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

export const createPost = async (content: string, imageUrl?: string) => {
  const response = await api.post('/posts', { content, image_url: imageUrl });
  return response.data;
};

export const getPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

export const getComments = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (postId: string, content: string) => {
  const response = await api.post(`/posts/${postId}/comments`, { content });
  return response.data;
};

export const deleteComment = async (postId: string, commentId: string) => {
  const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return response.data;
};

export const toggleCommentLike = async (postId: string, commentId: string) => {
  const response = await api.post(`/posts/${postId}/comments/${commentId}/like`);
  return response.data;
};

export const updateUser = async (userId: string, data: { name?: string; profile_picture?: string }) => {
  const response = await api.put(`/user/${userId}`, data);
  return response.data;
};

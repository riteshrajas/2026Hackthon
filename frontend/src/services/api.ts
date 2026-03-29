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

export const logAction = async (userId: string, actionType: string, actionLabel?: string) => {
  const response = await api.post(`/action/log`, {
    user_id: userId,
    action_type: actionType,
    action_label: actionLabel
  });
  return response.data;
};

export const getActionHistory = async (limit = 10) => {
  const response = await api.get(`/action/history`, { params: { limit } });
  return response.data;
};

export const getDailyChallenge = async () => {
  const response = await api.get('/action/daily');
  return response.data;
};

export const expandDailyChallenge = async (challengeId: string) => {
  const response = await api.post('/action/daily/expand', { challenge_id: challengeId });
  return response.data;
};

export const completeDailyChallenge = async (challengeId: string, expanded: boolean) => {
  const response = await api.post('/action/daily/complete', {
    challenge_id: challengeId,
    expanded
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

export const getPendingRequests = async () => {
  const response = await api.get('/community/requests');
  return response.data;
};

export const respondToRequest = async (requestId: string, status: 'accepted' | 'declined') => {
  const response = await api.post(`/community/requests/${requestId}/respond`, { status });
  return response.data;
};

export const getActiveNinjas = async (scope: 'county' | 'country' | 'global', value?: string, limit = 5) => {
  const response = await api.get('/community/active', { params: { scope, value, limit } });
  return response.data;
};

export const getEvents = async (scope: 'county' | 'country' | 'global', value?: string, limit = 50) => {
  const response = await api.get('/events', { params: { scope, value, limit } });
  return response.data;
};

export const createEvent = async (payload: {
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location_name?: string;
  location_address?: string;
  scope?: 'county' | 'country' | 'global';
  scope_value?: string;
  capacity?: number | null;
  organization_name?: string;
  organization_url?: string;
  details_url?: string;
  image_url?: string;
}) => {
  const response = await api.post('/events', payload);
  return response.data;
};

export const signupEvent = async (eventId: string) => {
  const response = await api.post(`/events/${eventId}/signup`);
  return response.data;
};

export const getEventSignups = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}/signups`);
  return response.data;
};

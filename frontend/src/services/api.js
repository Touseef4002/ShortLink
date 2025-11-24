import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register : (data) => api.post('/api/auth/register', data),
    login : (data) => api.post('/api/auth/login', data),
    getMe : () => api.get('/api/auth/me')
};

export const linksAPI = {
    getAll : () => api.get('/api/links'),
    getById : (id) => api.get(`/api/links/${id}`),
    create : (data) => api.post('/api/links', data),
    update : (id, data) => api.put(`/api/links/${id}`, data),
    delete : (id) => api.delete(`/api/links/${id}`),
};

export const analyticsAPI = {
    getAnalytics : (linkId) => api.get(`/api/analytics/${linkId}`),
    getSummary : (linkId) => api.get('/api/analytics/${linkId}/summary'),
};

export default api;
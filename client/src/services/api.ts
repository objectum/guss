import axios from 'axios';
import type { AuthResponse, LoginRequest, Round, TapResponse, TapRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth', credentials);
        return response.data;
    },
};

export const roundAPI = {
    getRounds: async (): Promise<Round[]> => {
        const response = await api.get('/round/list');
        return response.data;
    },
    createRound: async (startTime: string, endTime: string): Promise<Round> => {
        const response = await api.post('/round', { startTime, endTime });
        return response.data;
    },
    getRound: async (id: string): Promise<Round> => {
        const response = await api.get(`/round/${id}`);
        return response.data;
    },
};

export const tapAPI = {
    tap: async (tapRequest: TapRequest): Promise<TapResponse> => {
        const response = await api.put('/tap', tapRequest);
        return response.data;
    },
    getScore: async (roundId: string): Promise<{ score: number }> => {
        const response = await api.get(`/tap/score/${roundId}`);
        return response.data;
    },
};

export default api;

import axios from 'axios';

export const convemeApi = axios.create({
    baseURL: 'http://localhost:3000/graphql',
    headers: {
        'Content-Type': 'application/json',
    },
});

convemeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// IMPORTANTE: Cambia esta IP por la de tu computadora en la red local.
// Ejemplo: 'http://192.168.1.100:3006/graphql'
const API_BASE_URL = 'http://192.168.1.XX:3006/graphql';

export const convemeApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

convemeApi.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

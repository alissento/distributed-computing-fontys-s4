import axios, {AxiosInstance, RawAxiosRequestHeaders} from "axios";
import env from '@/config/env';

const apiClient: AxiosInstance = axios.create({
    baseURL: env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    } as RawAxiosRequestHeaders,
});

// Add auth header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
import axios, {AxiosInstance, RawAxiosRequestHeaders} from "axios";
import env from '@/config/env';

const apiClient: AxiosInstance = axios.create({
    baseURL: 'https://api.norbertknez.me',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    } as RawAxiosRequestHeaders,
    withCredentials: true,
    timeout: 30000,
});

// Global response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            console.error(
                `API Error: ${error.response.status} ${error.response.statusText}`,
                error.response.data
            );
        } else if (error.request) {
            console.error('API Error: No response received', error.request);
        } else {
            console.error('API Request Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
import apiClient from "@/config/apiClient.ts";
import { RegisterRequest, User } from "@/types/user";

type TokenResponse = {
    token: string;
    user: User;
};

const AuthAPI = {
    login: async (email: string, password: string): Promise<TokenResponse> => {
        const response = await apiClient.post('auth/tokens', { email, password });
        return response.data;
    },

    register: async (request: RegisterRequest): Promise<TokenResponse> => {
        try {
            const response = await apiClient.post('users', request);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        await apiClient.delete('auth/tokens');
    },
    
    refreshToken: async (): Promise<TokenResponse> => {
        const response = await apiClient.post('auth/tokens/refresh');
        return response.data;
    },

    // Keep this method for backward compatibility or when we need to force-fetch user data
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get('auth/tokens/me');
        return response.data;
    }
}

export default AuthAPI;
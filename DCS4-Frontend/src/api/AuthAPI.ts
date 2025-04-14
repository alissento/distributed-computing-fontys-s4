import apiClient from "@/config/apiClient.ts";

const AuthAPI = {
    login: async (email: string, password: string) => {
        const response = await apiClient.post('auth/tokens', { email, password })
        return response.data.token;
    },

    register: async (request: RegisterFormData) => {
        try {
            const response = await apiClient.post('users', request);
            return response.data;
        } catch (error) {
            // The error is already transformed by the apiClient interceptor
            throw error;
        }
    },
}
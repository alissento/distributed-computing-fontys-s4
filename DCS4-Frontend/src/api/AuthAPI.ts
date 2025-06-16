import apiClient from "@/config/apiClient.ts";
import { RegisterRequest, User } from "@/types/user";

type TokenResponse = {
    token: string;
    user: User;
};

type AuthenticationResponse = {
    status: 'authenticated' | 'totp_required' | 'totp_setup_required';
    token?: string;
    user?: User;
    email?: string;
};

type TotpSetupResponse = {
    secret: string;
    manualEntryKey: string;
    qrCodeDataUrl: string;
};

const AuthAPI = {
    login: async (email: string, password: string): Promise<AuthenticationResponse> => {
        const response = await apiClient.post('auth/tokens', { email, password });
        return response.data;
    },

    register: async (request: RegisterRequest): Promise<AuthenticationResponse> => {
        try {
            const response = await apiClient.post('users', request);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verifyTotp: async (email: string, totpCode: string): Promise<AuthenticationResponse> => {
        const response = await apiClient.post('auth/tokens/totp-verify', { email, totpCode });
        return response.data;
    },

    setupTotp: async (): Promise<TotpSetupResponse> => {
        const response = await apiClient.post('auth/totp/setup');
        return response.data;
    },

    verifyTotpSetup: async (code: string, secret: string): Promise<void> => {
        await apiClient.post('auth/totp/setup/verify', { code, secret });
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
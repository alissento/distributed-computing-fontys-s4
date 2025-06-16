import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {RegisterRequest, Role, roleHierarchy, User} from "@/types/user.ts";
import AuthAPI from "@/api/AuthAPI.ts";

// Authentication response type from API
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

type AuthState = 'unauthenticated' | 'pending_totp' | 'pending_totp_setup' | 'authenticated';

type AuthStore = {
    user: User | null
    authState: AuthState
    isLoading: boolean
    lastChecked: number | null
    pendingEmail: string | null
    totpSetupData: TotpSetupResponse | null
    
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    verifyTotp: (code: string) => Promise<void>
    setupTotp: () => Promise<void>
    verifyTotpSetup: (code: string) => Promise<void>
    checkAuth: (force?: boolean) => Promise<boolean>
    hasRole: (role: Role) => boolean
    setUserData: (user: User) => void
    
    // isAuthenticated will be computed in AuthContext
}

// Cache time in milliseconds (5 minutes)
const AUTH_CACHE_TIME = 5 * 60 * 1000;

const api = {
    login: async (email: string, password: string): Promise<AuthenticationResponse> => {
        return await AuthAPI.login(email, password);
    },
    
    register: async (request: RegisterRequest): Promise<AuthenticationResponse> => {
        return await AuthAPI.register(request);
    },
    
    verifyTotp: async (email: string, code: string): Promise<AuthenticationResponse> => {
        return await AuthAPI.verifyTotp(email, code);
    },
    
    setupTotp: async (): Promise<TotpSetupResponse> => {
        return await AuthAPI.setupTotp();
    },
    
    verifyTotpSetup: async (code: string, secret: string): Promise<void> => {
        return await AuthAPI.verifyTotpSetup(code, secret);
    },
    
    logout: async (): Promise<void> => {
        await AuthAPI.logout();
    },
    
    refreshToken: async (): Promise<any> => {
        return await AuthAPI.refreshToken();
    }
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            authState: 'unauthenticated',
            isLoading: false,
            lastChecked: null,
            pendingEmail: null,
            totpSetupData: null,

            // Remove the getter - we'll compute this in AuthContext instead

            setUserData: (user: User) => {
                set({ 
                    user, 
                    authState: 'authenticated',
                    lastChecked: Date.now(),
                    pendingEmail: null,
                    totpSetupData: null
                });
            },

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const response = await api.login(email, password);
                    
                    if (response.status === 'authenticated' && response.user) {
                        get().setUserData(response.user);
                    } else if (response.status === 'totp_required') {
                        set({ 
                            authState: 'pending_totp',
                            pendingEmail: email,
                            isLoading: false 
                        });
                        return;
                    }
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyTotp: async (code: string) => {
                const { pendingEmail } = get();
                if (!pendingEmail) {
                    throw new Error('No pending email for TOTP verification');
                }
                
                set({ isLoading: true });
                try {
                    const response = await api.verifyTotp(pendingEmail, code);
                    if (response.status === 'authenticated' && response.user) {
                        get().setUserData(response.user);
                    }
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            setupTotp: async () => {
                set({ isLoading: true });
                try {
                    const setupData = await api.setupTotp();
                    set({ 
                        totpSetupData: setupData,
                        authState: 'pending_totp_setup',
                        isLoading: false 
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyTotpSetup: async (code: string) => {
                const { totpSetupData } = get();
                if (!totpSetupData) {
                    throw new Error('No TOTP setup data available');
                }
                
                set({ isLoading: true });
                try {
                    await api.verifyTotpSetup(code, totpSetupData.secret);
                    // After successful setup, the user should be authenticated with a valid JWT cookie
                    // Fetch the current user data to complete the authentication
                    try {
                        const user = await AuthAPI.getCurrentUser();
                        get().setUserData(user);
                        set({ 
                            totpSetupData: null,
                            isLoading: false 
                        });
                    } catch (getUserError) {
                        // If we can't get user data, something went wrong
                        console.error('Failed to get user data after TOTP setup:', getUserError);
                        set({ 
                            authState: 'unauthenticated',
                            totpSetupData: null,
                            isLoading: false 
                        });
                        throw new Error('Authentication failed after TOTP setup');
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await api.logout();
                    set({ 
                        user: null, 
                        authState: 'unauthenticated', 
                        isLoading: false,
                        lastChecked: null,
                        pendingEmail: null,
                        totpSetupData: null
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (name, email, password) => {
                set({ isLoading: true });
                try {
                    const registerRequest: RegisterRequest = { name, email, password };
                    const response = await api.register(registerRequest);
                    
                    if (response.status === 'totp_setup_required') {
                        set({ 
                            authState: 'pending_totp_setup',
                            pendingEmail: email,
                            isLoading: false 
                        });
                        // Automatically start TOTP setup
                        await get().setupTotp();
                    } else if (response.status === 'authenticated' && response.user) {
                        get().setUserData(response.user);
                        set({ isLoading: false });
                    }
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },
            // Check auth status from cache if available or force skip cache
            checkAuth: async (force = false) => {
                // Skip check if recently validated and not forced
                const { lastChecked, isLoading, authState } = get();
                const isCacheValid = lastChecked && (Date.now() - lastChecked < AUTH_CACHE_TIME);
                
                if (isLoading) {
                    return authState === 'authenticated';
                }

                if (isCacheValid && !force) {
                    return authState === 'authenticated';
                }
                
                set({ isLoading: true });
                
                try {
                    // Try to get current user directly first (uses cookie auth)
                    try {
                        const user = await AuthAPI.getCurrentUser();
                        get().setUserData(user);
                        set({ isLoading: false });
                        return true;
                    } catch (getUserError) {
                        // If getCurrentUser fails, try refresh as fallback
                        try {
                            const response = await api.refreshToken();
                            if (response.user) {
                                get().setUserData(response.user);
                                set({ isLoading: false });
                                return true;
                            }
                            // If no user in response, fall through to unauthenticated
                        } catch (refreshError) {
                            // Refresh failed, continue to unauthenticated
                        }
                        
                        // Both methods failed, user is not authenticated
                        set({ 
                            user: null, 
                            authState: 'unauthenticated', 
                            isLoading: false,
                            lastChecked: Date.now(),
                            pendingEmail: null,
                            totpSetupData: null
                        });
                        return false;
                    }
                } catch (error) {
                    // Session is invalid or both auth checks failed
                    set({ 
                        user: null, 
                        authState: 'unauthenticated', 
                        isLoading: false,
                        lastChecked: Date.now(),
                        pendingEmail: null,
                        totpSetupData: null
                    });
                    return false;
                }
                
                // Default fallback
                return false;
            },
            
            hasRole: (role) => {
                const { user } = get();
                if (!user) return false;
                return roleHierarchy[user.role]?.includes(role) || false;
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ 
                user: state.user,
                authState: state.authState,
                lastChecked: state.lastChecked,
                pendingEmail: state.pendingEmail
            })
        }
    )
)
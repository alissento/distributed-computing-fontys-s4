import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {RegisterRequest, Role, roleHierarchy, User} from "@/types/user.ts";
import AuthAPI from "@/api/AuthAPI.ts";

// Token response type from API
type TokenResponse = {
    token: string;
    user: User;
};

type AuthStore = {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    lastChecked: number | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    checkAuth: (force?: boolean) => Promise<boolean>
    hasRole: (role: Role) => boolean
    setUserData: (user: User) => void
}

// Cache time in milliseconds (5 minutes)
const AUTH_CACHE_TIME = 5 * 60 * 1000;

const api = {
    login: async (email: string, password: string): Promise<TokenResponse> => {
        return await AuthAPI.login(email, password);
    },
    
    register: async (request: RegisterRequest): Promise<TokenResponse> => {
        return await AuthAPI.register(request);
    },
    
    logout: async (): Promise<void> => {
        await AuthAPI.logout();
    },
    
    refreshToken: async (): Promise<TokenResponse> => {
        return await AuthAPI.refreshToken();
    }
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            lastChecked: null,

            setUserData: (user: User) => {
                set({ 
                    user, 
                    isAuthenticated: true,
                    lastChecked: Date.now()
                });
            },

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const { user } = await api.login(email, password);
                    get().setUserData(user);
                    set({ isLoading: false });
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
                        isAuthenticated: false, 
                        isLoading: false,
                        lastChecked: null
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
                    const { user } = await api.register(registerRequest);
                    get().setUserData(user);
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },
            // Check auth status from cache if available or force skip cache
            checkAuth: async (force = false) => {
                // Skip check if recently validated and not forced
                const { lastChecked, isLoading } = get();
                const isCacheValid = lastChecked && (Date.now() - lastChecked < AUTH_CACHE_TIME);
                
                if (isLoading) {
                    return get().isAuthenticated;
                }

                if (isCacheValid && !force) {
                    return get().isAuthenticated;
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
                            const { user } = await api.refreshToken();
                            get().setUserData(user);
                            set({ isLoading: false });
                            return true;
                        } catch (refreshError) {
                            // Both methods failed, user is not authenticated
                            set({ 
                                user: null, 
                                isAuthenticated: false, 
                                isLoading: false,
                                lastChecked: Date.now()
                            });
                            return false;
                        }
                    }
                } catch (error) {
                    // Session is invalid or both auth checks failed
                    set({ 
                        user: null, 
                        isAuthenticated: false, 
                        isLoading: false,
                        lastChecked: Date.now()
                    });
                    return false;
                }
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
                isAuthenticated: state.isAuthenticated,
                lastChecked: state.lastChecked
            })
        }
    )
)
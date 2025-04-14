import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export enum Role {
    USER = 'USER',
    ANALYST = 'ANALYST',
    ADMIN = 'ADMIN'
}

const roleHierarchy: Record<Role, Role[]> = {
    [Role.USER]: [Role.USER],
    [Role.ANALYST]: [Role.USER, Role.ANALYST],
    [Role.ADMIN]: [Role.USER, Role.ANALYST, Role.ADMIN]
}

type User = {
    id: string
    name: string
    email: string
    role: Role
}

type AuthStore = {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    checkAuth: () => Promise<void>
    hasRole: (role: Role) => boolean
}

const api = {
    login: async (email: string, password: string): Promise<User> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: '1',
                    name: 'Test User',
                    email,
                    role: Role.USER
                })
            }, 500)
        })
    },
    register: async (name: string, email: string, password: string): Promise<User> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: '1',
                    name,
                    email,
                    role: Role.USER
                })
            }, 500)
        })
    },
    logout: async (): Promise<void> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(resolve, 300)
        })
    },
    getUser: async (): Promise<User> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: '1',
                    name: 'Test User',
                    email: 'user@example.com',
                    role: Role.USER
                })
            }, 300)
        })
    }
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true })
                try {
                    const user = await api.login(email, password)
                    set({ user, isAuthenticated: true, isLoading: false })
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            },

            logout: async () => {
                set({ isLoading: true })
                try {
                    await api.logout()
                    set({ user: null, isAuthenticated: false, isLoading: false })
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            },

            register: async (name, email, password) => {
                set({ isLoading: true })
                try {
                    const user = await api.register(name, email, password)
                    set({ user, isAuthenticated: true, isLoading: false })
                } catch (error) {
                    set({ isLoading: false })
                    throw error
                }
            },

            checkAuth: async () => {
                set({ isLoading: true })
                try {
                    const user = await api.getUser()
                    set({ user, isAuthenticated: true, isLoading: false })
                } catch (error) {
                    set({ user: null, isAuthenticated: false, isLoading: false })
                }
            },
            
            hasRole: (role) => {
                const { user } = get()
                if (!user) return false
                
                // Check if user's role includes the required role based on hierarchy
                return roleHierarchy[user.role]?.includes(role) || false
            }
        }),
        {
            name: 'auth-storage'
        }
    )
)
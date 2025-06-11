import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/stores/AuthStore';
import { Role, User } from '@/types/user';

type AuthState = 'unauthenticated' | 'pending_totp' | 'pending_totp_setup' | 'authenticated';

type AuthContextType = {
  isAuthenticated: boolean;
  authState: AuthState;
  isLoading: boolean;
  user: User | null;
  hasRole: (role: Role) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    authState,
    isLoading: storeLoading, 
    checkAuth, 
    user,
    hasRole
  } = useAuthStore();

  const isAuthenticated = authState === 'authenticated';
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check auth on initial load 
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      await checkAuth();
      setIsCheckingAuth(false);
    };
    
    verifyAuth();
    
    // Set up periodic checks (every 5 minutes)
    const interval = setInterval(() => {
      checkAuth(true); // force refresh
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkAuth]);

  // Provide auth state to the entire app
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      authState,
      isLoading: storeLoading || isCheckingAuth,
      user,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 
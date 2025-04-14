import {Navigate, Outlet, useLocation} from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/AuthStore";
import { toast } from "sonner";
import {Role} from "@/types/user.ts";
import Spinner from "@/components/ui/spinner.tsx";

type ProtectedRouteProps = {
    redirectPath?: string;
    children?: React.ReactNode;
    requiredRole?: Role;
};

const ProtectedRoute = ({
    redirectPath = '/login',
    children,
    requiredRole,
}: ProtectedRouteProps) => {
    const location = useLocation();
    const { isAuthenticated, checkAuth, isLoading, hasRole } = useAuthStore();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    
    // Handle unauthorized parameter 
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('unauthorized') === 'true') {
            toast("Access Denied", {
                description: "You don't have permission to access this resource",
                style: { backgroundColor: 'hsl(var(--destructive))' }
            });
            
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('unauthorized');
            window.history.replaceState({}, '', newUrl);
        }
    }, [location.search]);
    
    // Check authentication on navigation/route change
    useEffect(() => {
        let isMounted = true;
        
        const verifyAuth = async () => {
            setIsCheckingAuth(true);
            await checkAuth();
            if (isMounted) {
                setIsCheckingAuth(false);
            }
        };
        
        verifyAuth();
        
        return () => {
            isMounted = false;
        };
    }, [checkAuth, location.pathname]);

    // Show loading state while checking authentication
    if (isLoading || isCheckingAuth) {
        return <Spinner/>;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
    }

    // Role-based access control
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to={`/?unauthorized=true`} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
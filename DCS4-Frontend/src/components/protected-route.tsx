import {Navigate, Outlet} from "react-router-dom";
import React, { useEffect } from "react";
import { useAuthStore, Role } from "@/stores/AuthStore";

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
    const { isAuthenticated, checkAuth, isLoading, hasRole } = useAuthStore();
    
    useEffect(() => {
        // Check authentication status when component mounts
        if (!isAuthenticated && !isLoading) {
            checkAuth();
        }
    }, [checkAuth, isAuthenticated, isLoading]);

    // Show loading state while checking authentication
    if (isLoading) {
        return <div>Loading...</div>; // Consider using a proper loading component
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // Role-based access control with hierarchy
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
import { Navigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import { toast } from "sonner";
import { Role } from "@/types/user.ts";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
    children?: React.ReactNode;
    requiredRole?: Role;
};

const ProtectedRoute = ({
    children,
    requiredRole,
}: ProtectedRouteProps) => {
    const location = useLocation();
    const { hasRole } = useAuth();
    
    // Handle unauthorized toast when redirected with unauthorized parameter
    React.useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('unauthorized') === 'true') {
            toast("Access Denied", {
                description: "You don't have permission to access this resource",
                style: { backgroundColor: 'hsl(var(--destructive))' }
            });
            
            // Remove the parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('unauthorized');
            window.history.replaceState({}, '', newUrl);
        }
    }, [location.search]);

    // Only check role-based access control - authentication is handled by Layout
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to={`/?unauthorized=true`} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
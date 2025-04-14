import { Outlet, useLocation } from "react-router-dom"
import { DashboardSidebar } from "./dashboard-sidebar"
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { useAuth } from "@/contexts/AuthContext";
import ContentSkeleton from "./ui/content-skeleton";

export default function Layout() {
    const { isLoading } = useAuth();
    const location = useLocation()
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register"

    if (isAuthPage) {
        return <Outlet />
    }

    return (
        <SidebarProvider className="flex h-screen">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarTrigger />
                    {isLoading ? <ContentSkeleton /> : <Outlet />}
                </main>
        </SidebarProvider>
    )
}


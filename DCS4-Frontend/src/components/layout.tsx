import { Outlet, useLocation } from "react-router-dom"
import { DashboardSidebar } from "./dashboard-sidebar"
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar"

export default function Layout() {
    const location = useLocation()
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register"

    if (isAuthPage) {
        return <Outlet />
    }

    return (
        <SidebarProvider className="flex h-screen">
            <DashboardSidebar />
            <main className="flex-1 w-full overflow-auto">
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}


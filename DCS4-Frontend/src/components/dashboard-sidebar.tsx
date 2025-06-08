import { Link, useLocation, useNavigate } from "react-router-dom"
import {
    BarChart3,
    Calculator,
    ChevronDown,
    Clock,
    Home,
    LineChart,
    LogOut,
    Settings,
    TrendingUp,
    Users,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "./ui/sidebar"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useAuthStore } from "@/stores/AuthStore"
import { toast } from "sonner"

export function DashboardSidebar() {
    const location = useLocation()
    const navigate = useNavigate()

    const user = useAuthStore(state => state.user)
    const logout = useAuthStore(state => state.logout)

    const handleLogout = async () => {
        try {
            await logout()
            toast("Logged out", {
                description: "You have been logged out successfully"
            })
            navigate('/login')
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    const isActive = (path: string) => {
        return location.pathname === path
    }

    const userInitials = user?.name 
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U'

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">StockP</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/")}>
                                    <Link to="/">
                                        <Home className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                           {/* <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/predictions")}>
                                    <Link to="/predictions">
                                        <LineChart className="h-4 w-4" />
                                        <span>Predictions</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/history")}>
                                    <Link to="/history">
                                        <Clock className="h-4 w-4" />
                                        <span>History</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/analytics")}>
                                    <Link to="/analytics">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>Analytics</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>*/}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Analyst</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/admin/calculations")}>
                                    <Link to="/admin/calculations">
                                        <Calculator className="h-4 w-4" />
                                        <span>Calculations</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Admin</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
                                    <Link to="/admin/users">
                                        <Users className="h-4 w-4" />
                                        <span>Users</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
                                    <Link to="/admin/settings">
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="px-3 py-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start px-2">
                                <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback>{userInitials}</AvatarFallback>
                                </Avatar>
                                <span className="truncate">{user?.name || 'User'}</span>
                                <ChevronDown className="ml-auto h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span>{user?.name || 'User'}</span>
                                    <span className="text-xs text-muted-foreground">{user?.email || ''}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                           {/* <DropdownMenuItem asChild>
                                <Link to="/profile">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>*/}
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
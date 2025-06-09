import {useEffect, useState} from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UsersAPI from "@/api/UsersAPI.ts";

type UserRole = "USER" | "ANALYST" | "ADMIN"

interface User {
    id: string
    name: string
    email: string
    role: UserRole
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL")

    useEffect(() => {
        UsersAPI.getAllUsers().then(setUsers)
    }, []);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
        UsersAPI.updateUserRole(userId, newRole)
    }

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case "ADMIN":
                return "destructive"
            case "ANALYST":
                return "default"
            case "USER":
                return "secondary"
            default:
                return "secondary"
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        return status === "active" ? "default" : "secondary"
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage user accounts and permissions</p>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={roleFilter} onValueChange={(value: UserRole | "ALL") => setRoleFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="ANALYST">Analyst</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                    <CardDescription>
                        A list of all users in your organization with their current roles and status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                                                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={user.role} onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue>
                                                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USER">
                                                    <Badge variant="secondary">USER</Badge>
                                                </SelectItem>
                                                <SelectItem value="ANALYST">
                                                    <Badge variant="default">ANALYST</Badge>
                                                </SelectItem>
                                                <SelectItem value="ADMIN">
                                                    <Badge variant="destructive">ADMIN</Badge>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    Showing {filteredUsers.length} of {users.length} users
                </div>
                <div className="flex items-center space-x-4">
                    <span>Total: {users.length}</span>
                    <span>Admins: {users.filter((u) => u.role === "ADMIN").length}</span>
                </div>
            </div>
        </div>
    )
}

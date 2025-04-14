import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {ThemeProvider} from './components/theme-provider'
import Register from "@/app/register.tsx";
import Layout from "@/components/layout.tsx";
import Dashboard from "@/app/dashboard.tsx";
import Predictions from "@/app/prediction.tsx";
import History from "@/app/history.tsx";
import AdminCalculations from "@/app/admin/calculations.tsx";
import AdminUsers from "@/app/admin/users.tsx";
import AdminSettings from "@/app/admin/settings.tsx";
import Login from "@/app/login.tsx";
import {Toaster} from "sonner";
import ProtectedRoute from "@/components/protected-route.tsx";
import {Role} from "@/types/user.ts";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

// Create a client for react-query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/" element={<Layout/>}>
                                <Route index element={<Dashboard/>}/>
                                <Route path="predictions" element={<Predictions/>}/>
                                <Route path="history" element={<History/>}/>
                                <Route path="analytics" element={<Predictions/>}/>
                                <Route path="admin/calculations" element={
                                    <ProtectedRoute requiredRole={Role.ANALYST}>
                                        <AdminCalculations/>
                                    </ProtectedRoute>
                                }/>
                                <Route path="admin/users" element={
                                    <ProtectedRoute requiredRole={Role.ADMIN}>
                                        <AdminUsers/>
                                    </ProtectedRoute>
                                }/>
                                <Route path="admin/settings" element={
                                    <ProtectedRoute requiredRole={Role.ADMIN}>
                                        <AdminSettings/>
                                    </ProtectedRoute>
                                }/>
                            </Route>
                        </Routes>
                        <Toaster/>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}
export default App


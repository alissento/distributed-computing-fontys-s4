import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import {ThemeProvider} from './components/theme-provider'
import Register from "@/app/register.tsx";
import Layout from "@/components/layout.tsx";
import Dashboard from "@/app/dashboard.tsx";
import Predictions from "@/app/prediction.tsx";
import History from "@/app/history.tsx";
import Analytics from "@/app/analytics.tsx";
import AdminCalculations from "@/app/admin/calculations.tsx";
import AdminUsers from "@/app/admin/users.tsx";
import AdminSettings from "@/app/admin/settings.tsx";
import Login from "@/app/login.tsx";
import {Toaster} from "sonner";
import ProtectedRoute from "@/components/protected-route.tsx";
import { Role } from "@/stores/AuthStore";

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Router>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/"
                           element={
                               <ProtectedRoute requiredRole={Role.USER}>
                                   <Layout/>
                               </ProtectedRoute>
                           }>
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
            </Router>
            <Toaster/>
        </ThemeProvider>
    )
}

export default App

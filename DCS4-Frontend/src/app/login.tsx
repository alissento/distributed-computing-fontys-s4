import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { z } from "zod"
import { useState } from "react"
import { useAuthStore } from "../stores/AuthStore"
import { toast } from "sonner"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: ""
    })
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const login = useAuthStore(state => state.login)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
        
        // Clear error when user types
        if (errors[id as keyof LoginFormData]) {
            setErrors(prev => ({ ...prev, [id]: undefined }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            // Validate form data
            loginSchema.parse(formData)
            setErrors({})
            setIsSubmitting(true)
            
            // Submit to API via store
            await login(formData.email, formData.password)
            setIsSubmitting(false)
            
            // Don't show success toast here - AuthStore will handle the flow
            // If login succeeds immediately (no TOTP), user will be redirected by AppRoutes
            // If TOTP is required, user will see TOTP verification screen
        } catch (error) {
            setIsSubmitting(false)
            if (error instanceof z.ZodError) {
                // Handle validation errors
                const newErrors: Partial<Record<keyof LoginFormData, string>> = {}
                error.errors.forEach(err => {
                    if (err.path) {
                        newErrors[err.path[0] as keyof LoginFormData] = err.message
                    }
                })
                setErrors(newErrors)
            } else {
                // Handle API errors
                toast("Login failed", {
                    description: "Invalid email or password",
                    style: { backgroundColor: 'hsl(var(--destructive))' }
                })
            }
        }
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="m@example.com" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link to="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Logging in..." : "Login"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <div className="text-sm text-muted-foreground mt-2">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
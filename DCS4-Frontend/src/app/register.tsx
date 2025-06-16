import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { z } from "zod"
import { useState } from "react"
import { useAuthStore } from "../stores/AuthStore"
import { toast } from "sonner"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
    const [formData, setFormData] = useState<Omit<RegisterFormData, 'confirmPassword'> & {confirmPassword: string}>({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const register = useAuthStore(state => state.register)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
        
        // Clear error when user types
        if (errors[id as keyof RegisterFormData]) {
            setErrors(prev => ({ ...prev, [id]: undefined }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            // Validate form data
            registerSchema.parse(formData)
            setErrors({})
            setIsSubmitting(true)
            
            // Submit to API via store
            await register(formData.name, formData.email, formData.password)
            setIsSubmitting(false)
            
            // Don't navigate or show success toast here - AuthStore will handle the flow
            // User will be automatically redirected to TOTP setup screen
        } catch (error) {
            setIsSubmitting(false)
            if (error instanceof z.ZodError) {
                // Handle validation errors
                const newErrors: Partial<Record<keyof RegisterFormData, string>> = {}
                error.errors.forEach(err => {
                    if (err.path) {
                        newErrors[err.path[0] as keyof RegisterFormData] = err.message
                    }
                })
                setErrors(newErrors)
            } else {
                // Handle API errors
                toast("Registration failed", {
                    description: "Please try again later",
                    style: { backgroundColor: 'hsl(var(--destructive))' }
                })
            }
        }
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Enter your information to create an account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                    id="name" 
                                    type="text" 
                                    placeholder="John Doe" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
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
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input 
                                    id="confirmPassword" 
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Creating account..." : "Create account"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <div className="text-sm text-muted-foreground mt-2">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
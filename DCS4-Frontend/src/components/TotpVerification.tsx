import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/stores/AuthStore"
import { toast } from "sonner"

export default function TotpVerification() {
    const [code, setCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const verifyTotp = useAuthStore(state => state.verifyTotp)
    const pendingEmail = useAuthStore(state => state.pendingEmail)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (code.length !== 6) {
            toast("Invalid code", {
                description: "Please enter a 6-digit code",
                style: { backgroundColor: 'hsl(var(--destructive))' }
            })
            return
        }
        
        setIsSubmitting(true)
        try {
            await verifyTotp(code)
            toast("Authentication successful", {
                description: "Welcome back!"
            })
        } catch (error) {
            toast("Verification failed", {
                description: "Invalid TOTP code. Please try again.",
                style: { backgroundColor: 'hsl(var(--destructive))' }
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '') // Only allow digits
        if (value.length <= 6) {
            setCode(value)
        }
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code from your authenticator app for {pendingEmail}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Authentication Code</Label>
                                <Input 
                                    id="code" 
                                    type="text" 
                                    placeholder="000000"
                                    value={code}
                                    onChange={handleCodeChange}
                                    disabled={isSubmitting}
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest font-mono"
                                    autoComplete="one-time-code"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 6}>
                                {isSubmitting ? "Verifying..." : "Verify Code"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 
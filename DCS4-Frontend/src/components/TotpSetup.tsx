import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/AuthStore"
import { toast } from "sonner"
import {useNavigate} from "react-router-dom";

export default function TotpSetup() {
    const [code, setCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showManualEntry, setShowManualEntry] = useState(false)

    const verifyTotpSetup = useAuthStore(state => state.verifyTotpSetup)
    const totpSetupData = useAuthStore(state => state.totpSetupData)
    const pendingEmail = useAuthStore(state => state.pendingEmail)
    const navigate = useNavigate()

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
            await verifyTotpSetup(code)
            navigate("/")
            toast("Two-factor authentication enabled", {
                description: "Your account is now secured with 2FA!"
            })
        } catch (error) {
            toast("Verification failed", {
                description: "Invalid code. Please check your authenticator app and try again.",
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

    if (!totpSetupData) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                        <CardDescription>Setting up two-factor authentication</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Set Up Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Secure your account with an authenticator app for {pendingEmail}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Step 1: Scan QR Code</h3>
                            <p className="text-sm text-muted-foreground">
                                Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
                            </p>
                        </div>
                        
                        <div className="flex justify-center p-4 bg-white rounded-lg">
                            <img 
                                src={totpSetupData.qrCodeDataUrl} 
                                alt="TOTP QR Code"
                                className="w-48 h-48"
                            />
                        </div>

                        <div className="text-center">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowManualEntry(!showManualEntry)}
                            >
                                Can't scan? Enter code manually
                            </Button>
                        </div>

                        {showManualEntry && (
                            <div className="space-y-2 p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium">Manual entry code:</p>
                                <code className="block p-2 bg-background rounded text-sm font-mono break-all">
                                    {totpSetupData.manualEntryKey}
                                </code>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Step 2: Verify Setup</h3>
                            <p className="text-sm text-muted-foreground">
                                Enter the 6-digit code from your authenticator app to complete setup:
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Verification Code</Label>
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
                                    {isSubmitting ? "Verifying..." : "Complete Setup"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 
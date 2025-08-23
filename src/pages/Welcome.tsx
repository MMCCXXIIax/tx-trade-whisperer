// src/pages/Welcome.tsx
import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { saveProfile } from "@/lib/saveProfile"

type UserData = { name: string; email: string; mode: "demo" | "live" }

export default function Welcome() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    mode: "demo",
  })
  const [loading, setLoading] = useState(false)
  const [emailLocked, setEmailLocked] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")

  const welcomeText = useMemo(
    () =>
      "Welcome to TX - your 24/7 trading intelligence. I'll scan, filter, and flag what matters. You decide. We execute.",
    []
  )

  // Typewriter effect
  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= welcomeText.length) {
        setTypewriterText(welcomeText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 60)
    return () => clearInterval(timer)
  }, [welcomeText])

  // Pre-fill email from Supabase user
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return
      if (!active) return
      setUserData((s) => ({
        ...s,
        email: user.email ?? "",
      }))
      setEmailLocked(Boolean(user.email))
    })()
    return () => {
      active = false
    }
  }, [])

  const handleNext = () => {
    if (loading) return
    if (step === 1) return setStep(2)
    if (step === 2) {
      if (!userData.name || !userData.email) {
        toast({
          title: "Missing info",
          description:
            "Name and email keep your signals personal. Fill them in to continue.",
          variant: "destructive",
        })
        return
      }
      return setStep(3)
    }
    void handleComplete()
  }

  const handleComplete = async () => {
    if (loading) return
    setLoading(true)
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) {
        toast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "destructive",
        })
        return
      }

      const payload = {
        id: user.id,
        name: userData.name.trim(),
        email: (userData.email || "").trim(),
        mode: userData.mode,
      }

      const result = await saveProfile(payload)
      if (!result.success) throw new Error(result.error)

      try {
        localStorage.setItem("tx_mode", userData.mode)
      } catch {}

      toast({
        title: "You're in",
        description:
          userData.mode === "demo"
            ? `Nice, ${userData.name}. Demo mode armed. Learn the rhythm; then go live.`
            : `Locked and loaded, ${userData.name}. Live mode enabled - trade with intention.`,
      })

      // No navigate() here — ProtectedRoute will auto-redirect to /dashboard
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Save failed",
        description:
          "TX could not save your setup. Check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="grid-background" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          {step === 1 && (
            <Card className="terminal-container animate-fade-in border-tx-green/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-tx-green/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-tx-green animate-pulse" />
                </div>
                <CardTitle className="text-tx-green text-2xl font-bold">
                  TX INTELLIGENCE
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Your AI Trading Co-Pilot
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="min-h-20 flex items-center">
                  <p className="text-foreground text-center leading-relaxed">
                    {typewriterText} <span className="animate-pulse">|</span>
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <TrendingUp className="w-6 h-6 text-tx-green mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Pattern detection
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Shield className="w-6 h-6 text-tx-blue mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Risk control
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Zap className="w-6 h-6 text-tx-orange mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Real-time alerts
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleNext}
                    className="flex-1 tx-button tx-button-primary hover:scale-105 transition-transform"
                    disabled={loading}
                  >
                    Let's get started
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Skip intro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="terminal-container animate-scale-in border-tx-blue/30">
              <CardHeader>
                <CardTitle className="text-tx-green">Tell TX about you</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Keep it simple. TX tunes signals to your style.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Your name
                  </Label>
                  <Input
                    id="name"
                    placeholder="What should TX call you?"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData((s) => ({ ...s, name: e.target.value }))
                    }
                    className="terminal-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData((s) => ({ ...s, email: e.target.value }))
                    }
                    className={`terminal-input ${
                      emailLocked ? "opacity-80" : ""
                    }`}
                    disabled={emailLocked}
                  />
                  {emailLocked ? (
                    <p className="text-xs text-muted-foreground">
                      Email comes from your TX account
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Mode</Label>
                  <RadioGroup
                    value={userData.mode}
                    onValueChange={(val) =>
                      setUserData((s) => ({ ...s, mode: val as "demo" | "broker" }))
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="demo" id="demo" />
                      <Label htmlFor="demo">Demo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="broker" id="broker" />
                      <Label htmlFor="broker">Live</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={loading}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="terminal-container animate-fade-in border-tx-orange/30">
              <CardHeader>
                <CardTitle className="text-tx-green">Ready to launch</CardTitle>
                <p className="text-muted-foreground text-sm">
                  TX will start scanning and alerting based on your setup.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>Name:</strong> {userData.name}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {userData.email}
                  </p>
                  <p className="text-sm">
                    <strong>Mode:</strong>{" "}
                    {userData.mode === "demo" ? "Demo" : "Live"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="tx-button tx-button-primary"
                  >
                    {loading ? "Saving..." : "Finish"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

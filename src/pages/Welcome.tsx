import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

// Unified Supabase client
import { supabase } from '@/lib/supabaseClient';

type UserData = {
  name: string;
  email: string;
  mode: 'demo' | 'broker';
};

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    mode: 'demo',
  });
  const [loading, setLoading] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);

  const welcomeText = useMemo(
    () =>
      "Welcome to TX — your 24/7 trading intelligence. I'll scan, filter, and flag what matters. You decide. We execute.",
    []
  );

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= welcomeText.length) {
        setTypewriterText(welcomeText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [welcomeText]);

  // Load Supabase user and profile; skip onboarding if already completed
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = userRes?.user;
        if (!user) {
          toast({
            title: 'Sign in required',
            description: 'Log in to continue your TX setup.',
            variant: 'destructive',
          });
          navigate('/auth');
          return;
        }

        // Fetch profile (schema uses `name`)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, email, mode')
          .eq('id', user.id)
          .maybeSingle();

        if (!active) return;

        const nextData: UserData = {
          name: profile?.name ?? '',
          email: user.email ?? profile?.email ?? '',
          mode: (profile?.mode as UserData['mode']) ?? 'demo',
        };
        setUserData(nextData);
        setEmailLocked(Boolean(user.email)); // lock if email is from auth

        // Returning users skip to dashboard
        if (profile?.name && profile?.mode) {
          toast({
            title: 'Welcome back',
            description: `TX is synced. Taking you to your dashboard.`,
          });
          setTimeout(() => navigate('/dashboard'), 900);
        } else {
          // If we already have partial info, jump to details
          setStep(nextData.name || nextData.email ? 2 : 1);
        }
      } catch (err: any) {
        console.error(err);
        toast({
          title: 'Could not load your profile',
          description: 'Please try again. If this persists, re-login.',
          variant: 'destructive',
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleNext = () => {
    if (loading) return; // guard to prevent rapid forward clicks

    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!userData.name || !userData.email) {
        toast({
          title: 'Missing info',
          description: 'Name and email keep your signals personal. Fill them in to continue.',
          variant: 'destructive',
        });
        return;
      }
      setStep(3);
      return;
    }
    void handleComplete();
  };

  const handleComplete = async () => {
    if (loading) return; // prevent double submission
    setLoading(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const payload = {
        id: user.id, // required for RLS alignment
        name: userData.name.trim(),
        email: (userData.email || '').trim(),
        mode: userData.mode,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (upsertErr) throw upsertErr;

      // Optional: light local cache for UI snappiness (not a source of truth)
      try {
        localStorage.setItem('tx_mode', userData.mode);
      } catch {
        // ignore storage errors
      }

      toast({
        title: "You're in",
        description:
          userData.mode === 'demo'
            ? `Nice, ${userData.name}. Demo mode armed. Learn the rhythm; then go live.`
            : `Locked and loaded, ${userData.name}. Live mode enabled — trade with intention.`,
      });

      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Save failed',
        description: 'TX could not save your setup. Check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated background grid */}
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
                <p className="text-muted-foreground text-sm">Your AI Trading Co‑Pilot</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="min-h-20 flex items-center">
                  <p className="text-foreground text-center leading-relaxed">
                    {typewriterText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <TrendingUp className="w-6 h-6 text-tx-green mx-auto" />
                    <p className="text-xs text-muted-foreground">Pattern detection</p>
                  </div>
                  <div className="space-y-2">
                    <Shield className="w-6 h-6 text-tx-blue mx-auto" />
                    <p className="text-xs text-muted-foreground">Risk control</p>
                  </div>
                  <div className="space-y-2">
                    <Zap className="w-6 h-6 text-tx-orange mx-auto" />
                    <p className="text-xs text-muted-foreground">Real‑time alerts</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleNext}
                    className="flex-1 tx-button tx-button-primary hover:scale-105 transition-transform"
                    disabled={loading}
                  >
                    Let’s get started
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
                  <Label htmlFor="name" className="text-foreground">Your name</Label>
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
                  <Label htmlFor="email" className="text-foreground">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData((s) => ({ ...s, email: e.target.value }))
                    }
                    className={`terminal-input ${emailLocked ? 'opacity-80' : ''}`}
                    disabled={emailLocked}
                  />
                  {emailLocked ? (
                    <p className="text-[11px] text-muted-foreground">
                      Pulled from your account. Manage it in Settings.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      We’ll secure this in your TX profile.
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 tx-button tx-button-primary"
                    disabled={loading}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="terminal-container animate-slide-in-right border-tx-orange/30">
              <CardHeader>
                <CardTitle className="text-tx-green">Choose your mode</CardTitle>
                <p className="text-muted-foreground text-sm">
                  We can learn in demo or move with size live.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={userData.mode}
                  onValueChange={(value) =>
                    setUserData((s) => ({ ...s, mode: value as UserData['mode'] }))
                  }
                >
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-tx-green/50 transition-colors">
                    <RadioGroupItem value="demo" id="demo" />
                    <div className="flex-1">
                      <Label htmlFor="demo" className="font-bold text-foreground">Demo mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Practice with virtual capital. Learn TX’s tempo before risking real money.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-tx-blue/50 transition-colors">
                    <RadioGroupItem value="broker" id="broker" />
                    <div className="flex-1">
                      <Label htmlFor="broker" className="font-bold text-foreground">Live trading</Label>
                      <p className="text-xs text-muted-foreground">
                        Connect your broker for execution. API keys required.
                      </p>
                    </div>
                  </div>
                </RadioGroup>

                <div className="bg-tx-gray/50 p-4 rounded-lg border border-tx-green/20">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong className="text-tx-green">Pro tip:</strong> Start in demo. Build trust in the signals; then flip the switch.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1 tx-button tx-button-primary"
                  >
                    {loading ? 'Setting up TX…' : 'Start trading'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step >= num ? 'bg-tx-green' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

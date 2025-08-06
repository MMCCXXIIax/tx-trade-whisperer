import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const Welcome: React.FC = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    mode: 'demo'
  });
  const [loading, setLoading] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const navigate = useNavigate();

  const welcomeText = "Welcome to TX, your 24/7 trading intelligence assistant...";

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
    }, 80);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!userData.name || !userData.email) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields to continue.",
          variant: "destructive"
        });
        return;
      }
      setStep(3);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    // Store user data in localStorage
    localStorage.setItem('tx_user', JSON.stringify(userData));
    
    // Show welcome message
    toast({
      title: "Welcome to TX!",
      description: `Hey ${userData.name}, let's make some smart trades together!`,
    });

    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
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
                <div className="h-20 flex items-center">
                  <p className="text-foreground text-center leading-relaxed">
                    {typewriterText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <TrendingUp className="w-6 h-6 text-tx-green mx-auto" />
                    <p className="text-xs text-muted-foreground">Pattern Detection</p>
                  </div>
                  <div className="space-y-2">
                    <Shield className="w-6 h-6 text-tx-blue mx-auto" />
                    <p className="text-xs text-muted-foreground">Risk Management</p>
                  </div>
                  <div className="space-y-2">
                    <Zap className="w-6 h-6 text-tx-orange mx-auto" />
                    <p className="text-xs text-muted-foreground">Real-time Alerts</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleNext}
                  className="w-full tx-button tx-button-primary hover:scale-105 transition-transform"
                >
                  Let's Get Started
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="terminal-container animate-scale-in border-tx-blue/30">
              <CardHeader>
                <CardTitle className="text-tx-green">Tell TX About Yourself</CardTitle>
                <p className="text-muted-foreground text-sm">
                  TX needs to know who's behind the trades
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="What should TX call you?"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="terminal-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="terminal-input"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="flex-1 tx-button tx-button-primary"
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
                <CardTitle className="text-tx-green">Choose Your Trading Mode</CardTitle>
                <p className="text-muted-foreground text-sm">
                  How do you want to experience TX?
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={userData.mode} 
                  onValueChange={(value) => setUserData({...userData, mode: value})}
                >
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-tx-green/50 transition-colors">
                    <RadioGroupItem value="demo" id="demo" />
                    <div className="flex-1">
                      <Label htmlFor="demo" className="font-bold text-foreground">Demo Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Practice with virtual money. Perfect for learning TX's signals.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-tx-blue/50 transition-colors">
                    <RadioGroupItem value="broker" id="broker" />
                    <div className="flex-1">
                      <Label htmlFor="broker" className="font-bold text-foreground">Live Trading</Label>
                      <p className="text-xs text-muted-foreground">
                        Connect your broker for real trading (API keys required).
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                
                <div className="bg-tx-gray/50 p-4 rounded-lg border border-tx-green/20">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong className="text-tx-green">Pro Tip:</strong> Start with demo mode to understand TX's personality and signals before risking real money.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1 tx-button tx-button-primary"
                  >
                    {loading ? 'Setting up TX...' : 'Start Trading'}
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